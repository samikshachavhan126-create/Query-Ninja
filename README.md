# Query Ninja

**Query Ninja** is a peer-powered, faculty-verified academic doubt resolution platform designed for engineering and computer science students. It combines structured Q&A, live duplicate detection, trust badges, source-grounded AI study assistance, exam-sprint planning, and contribution analytics in a fast, dark-mode-ready web workspace.

---

## Key Features

- **Doubt Feed & Popular Topics Cloud**
  - Filterable campus feed across programming languages and core CS subjects (**Python**, **C++**, **JavaScript & TypeScript**, **Java**, **C & Pointers**, **Data Structures**, and more).
  - Interactive **Popular Topics** tag cloud highlighting active academic discussions for one-click feed filtering.
- **Ask a Doubt (`Cmd+K` / `Ctrl+K`) with Similarity Detection**
  - Global keyboard shortcut (`⌘K` on macOS, `Ctrl+K` on Windows/Linux) opens the doubt composer from anywhere in the app.
  - Real-time similarity matching surfaces existing **Teacher-Verified** or **Peer-Accepted** threads before posting duplicates.
- **Trust Tiers & Faculty Moderation**
  - Every thread tracks resolution status cleanly: **Unresolved**, **Peer-Accepted**, or **Teacher-Verified**.
  - Faculty moderators can endorse answers with official verification notes or hide misleading replies with transparent moderation reasons.
- **Unresolved Tracker**
  - Dedicated queue of open doubts filterable by subject/language and wait time so peers and instructors can prioritize unanswered questions.
- **24×7 AI Friend with Constrained Source Material**
  - Instant study assistant that checks verified campus threads first and provides one-click escalation to the **Doubt Feed** when no verified answer exists.
  - Includes an **Attach Source Material** panel supporting built-in reference PDFs/code notes as well as custom uploaded or pasted documents—constraining responses exclusively to the selected material and tagging replies with a `Using [Material Name]` badge.
- **Ratraa Planner**
  - Focused late-night and exam-sprint study planner linked to relevant campus doubts.
- **Learner Profile & Live Activity Badges**
  - Top navigation displays cumulative **Solved Count**, **Helpful Contributor** badges, and an interactive **Rank Tier** popover.
  - Dedicated **Learner Profile** view tracks **Total Solved Doubts**, **Helpfulness Points**, a **7-day Contribution Streak**, filterable **Earned Badges**, **Subject & Language Activity Breakdown**, and clickable **Recent Contributions**.
- **Live Persona Switcher & Light/Dark Theme**
  - Switch seamlessly between **Student (Asker)**, **Top Solver (Peer)**, and **Faculty Moderator** viewpoints to preview role-specific controls, with persistent Light and Dark theme support.

---

## Tech Stack

- **Frontend:** React 19, TypeScript, Vite
- **Styling:** Tailwind CSS v4
- **Icons & Motion:** Lucide React, Motion (`motion/react`)

---

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- npm (or bun)

### Installation

```bash
npm install
```

### Environment Variables

Copy `.env.example` to `.env` if you plan to configure optional environment variables:

```bash
cp .env.example .env
```

### Development Server

Starts the local Vite development server on port `3000`:

```bash
npm run dev
```

### Type Checking & Production Build

```bash
npm run lint
npm run build
```

---

## Project Structure

```text
├── public/
│   └── assets/           # Brand logo and static assets
├── src/
│   ├── components/       # Feed, Ask, Tracker, AI Friend, Ratraa Planner, Learner Profile, TopNav
│   ├── data/             # Subject/language metadata and pre-seeded campus doubts
│   ├── utils/            # Similarity matching, source-constrained responses, user activity engine
│   ├── App.tsx           # Application shell, state handlers, keyboard shortcuts, theme state
│   └── types.ts          # Shared TypeScript interfaces and status types
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```
