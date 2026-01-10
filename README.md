# React Vite SPA

A modern React single-page application built with Vite, TypeScript, and Tailwind CSS v4.

## Package Manager

This project uses **Bun** as the default package manager for faster installs and builds.

### Prerequisites

Make sure you have Bun installed:
```bash
curl -fsSL https://bun.sh/install | bash
```

### Getting Started

```bash
# Install dependencies
bun install

# Start development server
bun run dev

# Build for production
bun run build

# Preview production build
bun run preview

# Run tests
bun run test

# Type checking
bun run type-check

# Linting
bun run lint
bun run lint:fix
```

### Additional Scripts

```bash
# Clean build artifacts
bun run clean

# Clean install (remove node_modules and reinstall)
bun run install:clean

# Update dependencies
bun run deps:update

# Build with bundle analyzer
bun run build:analyze
```

## Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS v4** - Utility-first CSS framework
- **Vitest** - Testing framework
- **ESLint** - Code linting
- **Bun** - Package manager and runtime

## Features

- ⚡ Fast development with Vite and Bun
- 🎨 Modern UI with Tailwind CSS v4
- 📱 Responsive design
- 🧪 Testing setup with Vitest
- 🔍 TypeScript for type safety
- 📦 Optimized production builds