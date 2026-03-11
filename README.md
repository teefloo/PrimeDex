# 🎮 Ultra Pokédex

A cutting-edge, high-performance Pokédex application built with the latest **Next.js 16** and **React 19** features. Explore the world of Pokémon with advanced analytics, team building tools, and interactive challenges.

![Pokédex Preview](public/vercel.svg) <!-- Replace with a real screenshot if available -->

## ✨ Key Features

- **🛡️ Team Builder**: Assemble your ultimate squad of 6. Get deep insights into shared weaknesses, defensive coverage, and offensive potential.
- **📊 Stats Comparison**: Side-by-side analysis of up to 3 Pokémon. Compare base stats, physical dimensions, and type advantages with interactive charts.
- **🔍 Advanced Discovery**: Filter through all 9 generations by type, region, Base Stat Total (BST), height, weight, and legendary status.
- **🏆 Interactive Quizzes**: Test your knowledge in three modes: Time Attack, Survival, and Marathon. Compete for high scores!
- **📦 Living Pokédex Tracker**: Mark your captures and track your progress toward completing your personal collection.
- **🌍 Global Localization**: Fully translated into 7 languages: English, French, Spanish, German, Italian, Japanese, and Korean.
- **✨ Premium UI/UX**: Built with Tailwind CSS 4 and Framer Motion for buttery-smooth animations and a modern, glassmorphic aesthetic.
- **💾 Persistent State**: Your favorites, caught Pokémon, and teams are automatically saved to your browser using IndexedDB.

## 🛠 Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Library**: [React 19](https://react.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **State Management**:
  - **Server State**: [TanStack Query v5](https://tanstack.com/query/latest)
  - **Global State**: [Zustand](https://docs.pmnd.rs/zustand/) with [idb-keyval](https://github.com/jakearchibald/idb-keyval)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/), [shadcn/ui](https://ui.shadcn.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Charts**: [Recharts](https://recharts.org/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **API**: [PokéAPI](https://pokeapi.co/) via [Axios](https://axios-http.com/)
- **Testing**: [Vitest](https://vitest.dev/), [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)

## 🚀 Getting Started

### Prerequisites

- **Node.js**: 20.x or higher
- **Package Manager**: `npm` (included with Node.js) or `pnpm`

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/user/pokedex.git
   cd pokedex
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the Ultra Pokédex in action!

## 📂 Project Structure

```text
src/
├── app/              # Next.js App Router routes & layouts
│   ├── compare/      # Pokémon comparison tool
│   ├── favorites/    # User collection
│   ├── pokemon/      # Detail pages ([name])
│   ├── quiz/         # Quiz game modes
│   └── team/         # Team builder & analysis
├── components/       # Reusable React components
│   ├── layout/       # Header, Onboarding, Modals
│   ├── pokemon/      # Feature-specific Pokémon components
│   └── ui/           # Base UI primitives (shadcn/ui)
├── hooks/            # Custom React hooks (shortcuts, etc.)
├── lib/              # Core logic, API clients, and utilities
│   ├── api/          # PokéAPI integration (REST/GraphQL)
│   └── i18n.ts       # Internationalization setup
├── store/            # Zustand store definitions (persistence)
├── types/            # TypeScript interfaces for PokéAPI data
└── test/             # Vitest configuration and global setup
```

## 🧪 Testing & Quality

We prioritize stability. Run the test suite using Vitest:

```bash
# Run all tests
npx vitest

# Run tests in watch mode
npx vitest watch

# Run tests with UI
npx vitest --ui

# Check code quality (ESLint)
npm run lint
```

## 📦 Deployment

This project is optimized for deployment on **Vercel**.

1. Push your code to a GitHub repository.
2. Connect the repository to Vercel.
3. Vercel will automatically detect Next.js and deploy your application.

For manual builds:
```bash
npm run build
npm run start
```

## 🤝 Contributing

Contributions are welcome! If you'd like to improve the Ultra Pokédex:

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

Built with ❤️ for Pokémon fans worldwide.
