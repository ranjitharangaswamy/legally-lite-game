# Legally Lite

An interactive legal education game that teaches users about **state-specific laws across all 50 US states** through engaging challenges, mini-games, and simulations with comprehensive accessibility features.

## Overview

Legally Lite is a gamified legal education platform designed to help users understand their rights and navigate the legal system through interactive gameplay. Users can select their state and learn about housing, employment, consumer rights, and other legal topics specific to their jurisdiction.

## Features

### 🎮 Interactive Games & Challenges

- **12 Educational Challenges** organized by difficulty (Easy → Medium → Hard)
- **5 Mini-Games**:
  - **Legal Concept Match**: Card-matching game pairing legal terms with definitions
  - **Court Process Sorter**: Arrange court procedure steps in correct order with smooth animations
  - **Tenant Law Sorter**: Drag-and-drop categorization of housing laws with visual feedback
  - **Tenant Shield**: Tower defense game protecting against illegal landlord actions
  - **Clause Cutter**: Identify and slash illegal contract clauses

### 📍 State-Specific Content

- Support for all 50 US states
- State-specific quiz questions with verified legal citations
- Laws sourced from official Attorney General offices and legal databases
- Users select their state in their profile to receive relevant content

### 🎯 Gamification System

- **XP Rewards**: Earn experience points by completing quizzes and games
- **Leaderboard**: Track progress and compete with other learners
- **Dashboard Filters**: Sort by difficulty, topic, or XP rewards

### ♿ Comprehensive Accessibility

- **Text Zoom**: Adjustable text size (applies to all elements)
- **High Contrast Mode**: Enhanced visibility for low-vision users
- **Reduce Motion**: Disable animations for users sensitive to motion
- **Screen Reader Support**: Full ARIA labels and keyboard navigation
- **Dark/Light Mode Toggle**: Choose your preferred theme

### 🎨 Design

- **Neo-Brutalist Noir** aesthetic with gamer-friendly orange/teal color palette
- **Typewriter Font** (Special Elite) for unique visual identity
- Bold borders, shadows, and high-contrast elements

## Tech Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Backend**: tRPC + Express
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS 4
- **Authentication**: Manus OAuth
- **Routing**: Wouter

## Getting Started

### Prerequisites

- Node.js 22.x
- pnpm

### Installation

```bash
# Install dependencies
pnpm install

# Push database schema
pnpm db:push

# Start development server
pnpm dev
```

### Environment Variables

Required environment variables are automatically injected by the Manus platform:
- `DATABASE_URL`: Database connection string
- `JWT_SECRET`: Session signing secret
- `VITE_APP_ID`: OAuth application ID
- `OAUTH_SERVER_URL`: OAuth backend URL
- `VITE_OAUTH_PORTAL_URL`: OAuth login portal URL

## Project Structure

```
client/
  src/
    pages/           # Page components
    components/      # Reusable UI components
    contexts/        # React contexts (Accessibility, Auth)
    lib/             # Utilities and tRPC client
    index.css        # Global styles and accessibility features

server/
  routers.ts         # tRPC API procedures
  db.ts              # Database query helpers

drizzle/
  schema.ts          # Database schema definitions
```

## Legal Disclaimer

**This game is for educational purposes only.** The information provided through Legally Lite should not be considered legal advice. While we strive to present accurate legal concepts, laws vary by jurisdiction and change over time. For specific legal guidance regarding your situation, please consult a qualified attorney licensed in your state.

## Contributing

Contributions are welcome! Please ensure:
- All new features include proper TypeScript types
- Accessibility features are maintained
- State-specific content includes verified legal citations
- Games integrate with the XP rewards system

## License

Built with [Manus](https://manus.im)

---

**Note**: Currently, California laws have the most comprehensive verified content with official legal citations. Content for other states is being expanded with verified sources.
