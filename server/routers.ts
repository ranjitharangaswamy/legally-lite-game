import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { updateUserState, getUserStats, initializeUserStats } from "./db";
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
    
    getStats: protectedProcedure.query(async ({ ctx }) => {
      let stats = await getUserStats(ctx.user.id);
      if (!stats) {
        await initializeUserStats(ctx.user.id);
        stats = await getUserStats(ctx.user.id);
      }
      return stats;
    }),
  }),
});

export type AppRouter = typeof appRouter;
