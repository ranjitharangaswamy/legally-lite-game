import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { updateUserState, getUserStats, initializeUserStats, awardXp, updateDisplayName, saveChatMessage, getChatHistory, updateTopicPerformance, getWeakTopics } from "./db";
import { invokeLLM } from "./_core/llm";
import { getEnhancedLegalResponse } from "./_core/legalSearch";
import { z } from "zod";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  user: router({
    updateState: protectedProcedure
      .input(z.object({ state: z.string().length(2) }))
      .mutation(async ({ ctx, input }) => {
        await updateUserState(ctx.user.id, input.state);
        return { success: true };
      }),
    
    updateDisplayName: protectedProcedure
      .input(z.object({ displayName: z.string().min(1).max(100) }))
      .mutation(async ({ ctx, input }) => {
        await updateDisplayName(ctx.user.id, input.displayName);
        return { success: true };
      }),
    
    getStats: protectedProcedure.query(async ({ ctx }) => {
      let stats = await getUserStats(ctx.user.id);
      if (!stats) {
        await initializeUserStats(ctx.user.id);
        stats = await getUserStats(ctx.user.id);
      }
      return stats;
    }),

    awardXp: protectedProcedure
      .input(z.object({ 
        xpAmount: z.number().min(1),
        challengeType: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        await awardXp(ctx.user.id, input.xpAmount, input.challengeType);
        const updatedStats = await getUserStats(ctx.user.id);
        return { success: true, stats: updatedStats };
      }),

    generatePersonalizedQuiz: protectedProcedure
      .input(z.object({
        topic: z.string(),
        difficulty: z.enum(["easy", "medium", "hard"]),
        state: z.string().length(2),
      }))
      .mutation(async ({ ctx, input }) => {
        const userStats = await getUserStats(ctx.user.id);
        const level = Math.floor((userStats?.totalXp || 0) / 500) + 1;

        const prompt = `You are a legal education expert. Generate a multiple-choice quiz question about ${input.topic} law specific to ${input.state} state.

User Level: ${level}
Difficulty: ${input.difficulty}
Total XP: ${userStats?.totalXp || 0}

Generate ONE quiz question that:
1. Is specific to ${input.state} state laws
2. Matches ${input.difficulty} difficulty level
3. Is appropriate for a user at level ${level}
4. Includes 4 answer options (A, B, C, D)
5. Includes the correct answer
6. Includes a detailed explanation with legal citations

Return ONLY valid JSON in this exact format:
{
  "question": "The question text",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correctAnswer": 0,
  "explanation": "Detailed explanation with legal citations",
  "citation": "Legal citation (e.g., CA Civil Code § 1234)"
}`;

        const response = await invokeLLM({
          messages: [
            { role: "system", content: "You are a legal education expert who generates accurate, state-specific legal quiz questions." },
            { role: "user", content: prompt }
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "quiz_question",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  question: { type: "string" },
                  options: { 
                    type: "array",
                    items: { type: "string" },
                    minItems: 4,
                    maxItems: 4
                  },
                  correctAnswer: { type: "number" },
                  explanation: { type: "string" },
                  citation: { type: "string" }
                },
                required: ["question", "options", "correctAnswer", "explanation", "citation"],
                additionalProperties: false
              }
            }
          }
        });

        const content = response.choices[0].message.content;
        if (typeof content !== 'string') {
          throw new Error('Invalid response format from AI');
        }
        const quizData = JSON.parse(content);
        
        return quizData;
      }),

    explainAnswer: protectedProcedure
      .input(z.object({
        question: z.string(),
        userAnswer: z.string(),
        correctAnswer: z.string(),
        topic: z.string(),
        state: z.string().length(2),
      }))
      .mutation(async ({ ctx, input }) => {
        const prompt = `A user learning ${input.state} state ${input.topic} law answered a quiz question incorrectly.

Question: ${input.question}
User's Answer: ${input.userAnswer}
Correct Answer: ${input.correctAnswer}

Provide a clear, educational explanation that:
1. Explains why their answer was incorrect
2. Explains why the correct answer is right
3. Provides the specific ${input.state} state law or statute that applies
4. Uses simple, accessible language
5. Encourages the learner

Keep the explanation under 150 words.`;

        const response = await invokeLLM({
          messages: [
            { role: "system", content: "You are a patient legal tutor who helps students learn from their mistakes." },
            { role: "user", content: prompt }
          ]
        });

        return { explanation: response.choices[0].message.content };
      }),

    chat: protectedProcedure
      .input(z.object({
        message: z.string(),
        topic: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Save user message
        await saveChatMessage({
          userId: ctx.user.id,
          role: "user",
          content: input.message,
          topic: input.topic,
        });

        // Get chat history for context
        const history = await getChatHistory(ctx.user.id, 10);
        const messages = history.map(h => ({
          role: h.role as "user" | "assistant",
          content: h.content
        }));

        // Use enhanced legal search with official government sources
        const { response: assistantMessage, sources } = await getEnhancedLegalResponse(
          input.message,
          ctx.user.selectedState || 'WA',
          messages
        );

        // Append sources to message if available
        const messageWithSources = sources.length > 0
          ? `${assistantMessage}\n\n**Official Sources:**\n${sources.map((url, idx) => `${idx + 1}. ${url}`).join('\n')}`
          : assistantMessage;

        // Save assistant response
        await saveChatMessage({
          userId: ctx.user.id,
          role: "assistant",
          content: messageWithSources,
          topic: input.topic,
        });

        return { message: messageWithSources };
      }),

    getChatHistory: protectedProcedure.query(async ({ ctx }) => {
      return await getChatHistory(ctx.user.id);
    }),

    recordQuizAnswer: protectedProcedure
      .input(z.object({
        topic: z.string(),
        isCorrect: z.boolean(),
      }))
      .mutation(async ({ ctx, input }) => {
        await updateTopicPerformance(ctx.user.id, input.topic, input.isCorrect);
        return { success: true };
      }),

    getAdaptiveDifficulty: protectedProcedure
      .input(z.object({
        topic: z.string(),
      }))
      .query(async ({ ctx, input }) => {
        const weakTopics = await getWeakTopics(ctx.user.id);
        const isWeak = weakTopics.some(t => t.topic === input.topic);
        
        // Return easier difficulty for weak topics
        return { 
          difficulty: isWeak ? 'easy' as const : 'medium' as const,
          needsMorePractice: isWeak 
        };
      }),

    generateScenario: protectedProcedure
      .input(z.object({
        topic: z.string(),
        state: z.string().length(2),
      }))
      .mutation(async ({ ctx, input }) => {
        const userStats = await getUserStats(ctx.user.id);
        const level = Math.floor((userStats?.totalXp || 0) / 500) + 1;
        const weakTopics = await getWeakTopics(ctx.user.id);
        const isWeakTopic = weakTopics.some(t => t.topic === input.topic);

        const prompt = `You are a legal education expert. Create a realistic legal scenario for a user learning ${input.state} state ${input.topic} law.

User Level: ${level}
Topic Mastery: ${isWeakTopic ? 'Needs Practice' : 'Progressing'}

Create a scenario that:
1. Is based on real ${input.state} state laws
2. Presents a realistic situation someone might encounter
3. Includes 3-4 decision points where the user must choose actions
4. Each decision has legal consequences
5. Is appropriate for level ${level}
${isWeakTopic ? '6. Focuses on fundamental concepts to reinforce learning' : ''}

Return ONLY valid JSON in this exact format:
{
  "title": "Scenario title",
  "description": "The situation description (2-3 paragraphs)",
  "decisions": [
    {
      "question": "What should you do?",
      "options": [
        {"text": "Option A", "isCorrect": true, "explanation": "Why this is right/wrong"},
        {"text": "Option B", "isCorrect": false, "explanation": "Why this is right/wrong"}
      ]
    }
  ],
  "legalConcepts": ["Concept 1", "Concept 2"],
  "citations": ["Citation 1", "Citation 2"]
}`;

        const response = await invokeLLM({
          messages: [
            { role: "system", content: "You are a legal education expert who creates realistic practice scenarios." },
            { role: "user", content: prompt }
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "legal_scenario",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  decisions: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        question: { type: "string" },
                        options: {
                          type: "array",
                          items: {
                            type: "object",
                            properties: {
                              text: { type: "string" },
                              isCorrect: { type: "boolean" },
                              explanation: { type: "string" }
                            },
                            required: ["text", "isCorrect", "explanation"],
                            additionalProperties: false
                          }
                        }
                      },
                      required: ["question", "options"],
                      additionalProperties: false
                    }
                  },
                  legalConcepts: {
                    type: "array",
                    items: { type: "string" }
                  },
                  citations: {
                    type: "array",
                    items: { type: "string" }
                  }
                },
                required: ["title", "description", "decisions", "legalConcepts", "citations"],
                additionalProperties: false
              }
            }
          }
        });

        const content = response.choices[0].message.content;
        if (typeof content !== 'string') {
          throw new Error('Invalid response format from AI');
        }
        const scenarioData = JSON.parse(content);
        
        return scenarioData;
      }),
  }),
});

export type AppRouter = typeof appRouter;
