# Productivity Hub

A Comprehensive, beautifully designed web application to manage all aspects of your personal productivity. Built with a stunning Apple iOS-inspired design language, featuring smooth physics-based animations, and backed by a robust Supabase backend.

## ✨ Features

- **Dashboard**: A centralized command center providing an overview of your day, complete with a dynamic Productivity Score.
- **Task Management (Todos)**: Organize tasks efficiently with prioritization and categorization.
- **Calendar & Scheduler**: Plan your days with an intuitive event scheduler and calendar view.
- **Habit Tracker**: Build and maintain positive routines with streak tracking and visual progress.
- **Pomodoro Timer**: Boost focus and manage work sessions using the customizable Pomodoro technique.
- **Goal Setting**: Set, track, and achieve long-term objectives with structured milestones.
- **Expense Tracker**: Monitor your budget, record transactions, and visualize financial health.
- **Daily Journal**: Document your thoughts, track your daily mood, and reflect on your progress.
- **Notes**: Capture ideas instantly with a rich text note-taking interface.
- **Reminders**: Never forget an important task or event again.
- **Analytics & Achievements**: Visualize your productivity trends over time and unlock achievements for consistent engagement.
- **Command Palette & Keyboard Shortcuts**: Navigate the app lightning-fast like a pro.
- **Data Export**: Seamlessly export your data to CSV formats for personal backup and analysis.
- **Premium Design**: Experience a deeply satisfying UI characterized by glassmorphism, depth, Apple-grade typography, fully responsive layouts, and a meticulously crafted Dark Mode built with standard Tailwind utility classes.

## 🛠 Tech Stack

- **Frontend**: [React 19](https://react.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Backend & Database**: [Supabase](https://supabase.com/) (PostgreSQL, Auth, Realtime)
- **Routing**: [React Router v7](https://reactrouter.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Charts**: [Recharts](https://recharts.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine.

### Prerequisites

Ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- `npm` or `yarn`

### Installation

1. **Clone the repository** (if applicable):
   ```bash
   git clone https://github.com/yourusername/build-productivity-hub.git
   cd build-productivity-hub
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up Supabase**:
   - Create a new project on [Supabase](https://database.new/).
   - Obtain your `Project URL` and `anon public` API key from the project settings.
   - Set up the necessary database schemas (tables for Todos, Goals, Expenses, Habits, Journal, Notes, Events, Reminders, and Achievements) with Row Level Security (RLS) enabled.
   - Ensure Supabase Authentication (Email/Password) is enabled.

4. **Environment Variables**:
   Create a `.env` file in the root directory and add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

5. **Run the development server**:
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:5173`.

## 📂 Project Structure

- `src/components/`: Reusable UI components (buttons, modals, layout elements).
- `src/pages/`: Core application views (Dashboard, Todos, Habits, etc.).
- `src/context/`: React Context providers for global state management (AppContext, ThemeContext, AuthContext).
- `src/hooks/`: Custom React hooks.
- `src/lib/`: External service configurations (e.g., Supabase client setup).
- `src/utils/`: Helper functions and utilities.
- `src/types/`: TypeScript interface definitions for robust typing.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the issues page if you want to contribute.

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.
