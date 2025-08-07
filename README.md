# 🌱 Bejo Front-End Documentation

This document provides a comprehensive overview of the **Bejo Front-End** application, including its architecture, features, and setup instructions.

## 1. 📘 Project Overview

Bejo FE is a modern web application built with **Next.js** and **TypeScript**. It serves as the user interface for the Bejo platform, providing features like user authentication, a conversational AI assistant 🤖, and a dashboard 📊 for user management and analytics. The application is designed to be robust, scalable, and easy to maintain.

## 2. ✨ Features

* 🔐 **User Authentication** – Secure login and registration using **NextAuth.js** with credentials-based authentication.
* 💬 **Conversational AI** – Chat interface that lets users ask questions and receive AI-generated answers.
* 🕘 **Chat History** – View and manage past conversations.
* 📊 **Dashboard** – Admin panel with:

  * 👤 User management (view, add, edit, delete).
  * 📈 Analytics and statistics on user activity.
* 📱 **Responsive Design** – Mobile-friendly UI that adapts to various devices.
* 🌗 **Theming** – Supports light and dark mode for better UX.

## 3. 🧰 Tech Stack & Key Libraries

* ⚙️ **Framework:** [Next.js](https://nextjs.org/) (v15)
* 💻 **Language:** [TypeScript](https://www.typescriptlang.org/)
* 🎨 **Styling:** [Tailwind CSS](https://tailwindcss.com/) (v4) + PostCSS
* 🧩 **UI Components:** [shadcn/ui](https://ui.shadcn.com/)
* 🧠 **State Management:** React Hooks & Context API
* 🔐 **Authentication:** [NextAuth.js](https://next-auth.js.org/)
* 📝 **Form Handling:** [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
* 🛢️ **Database:** [OracleDB](https://www.oracle.com/database/technologies/oracledb-drivers-nodejs.html)
* 🔍 **Linting:** [ESLint](https://eslint.org/)
* 📦 **Package Manager:** [Bun](https://bun.sh/)

## 4. 🧱 Prerequisites

Before getting started, make sure you have the following installed:

* 🟢 [Node.js](https://nodejs.org/en/) (v18+ recommended)
* 🍞 [Bun](https://bun.sh/) (v1.0+)
* 🗄️ Access to an Oracle Database instance

## 5. 🚀 Installation & Setup

1. **Clone the repository:**

   ```bash
   git clone <repository-url>
   cd bejo-fe
   ```

2. **Install dependencies:**

   ```bash
   bun install
   ```

3. **Setup environment variables:**

   ```bash
   cp .env.example .env.local
   ```

4. **Run the development server:**

   ```bash
   bun run dev
   ```

   Open your browser at 👉 [http://localhost:3000](http://localhost:3000)

## 6. 🔧 Environment Variables

In your `.env.local`, include the following:

```
# NextAuth.js
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET= # openssl rand -hex 32

# Database
DATABASE_URL= # OracleDB connection string

# API URL
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

💡 Make sure to keep secrets secure and never commit `.env.local` to version control.

## 7. 🛠️ Available Scripts

* `bun run dev` – Starts development server ⚙️
* `bun run build` – Builds the app for production 🏗️
* `bun run start` – Runs the production server 🚢
* `bun run lint` – Lints the codebase 🧹

## 8. 🗂️ Project Structure Overview

```
bejo-fe/
├── app/
│   ├── (auth)/           # 🔐 Login/Register
│   ├── api/              # 🔌 API Routes
│   ├── ask/              # 🤖 AI Chat Interface
│   ├── dashboard/        # 📊 Admin Dashboard
│   ├── globals.css       # 🎨 Global Styles
│   └── layout.tsx        # 📐 Root Layout
├── components/           # 🧩 UI Components
│   └── ui/               # 🎛️ shadcn/ui components
├── hooks/                # 🪝 Custom Hooks
├── lib/                  # 🛠️ Utilities & DB Functions
├── public/               # 🖼️ Static Assets
├── types/                # 🧾 Type Definitions
├── .env.local            # 🔐 Local Environment Config
├── next.config.ts        # ⚙️ Next.js Config
├── package.json          # 📦 Project Info
└── tsconfig.json         # 🧠 TypeScript Config
```

## 9. 🧠 Core Concepts

### 🔐 Authentication

Configured with `NextAuth.js` using a `CredentialsProvider` inside `app/api/auth/[...nextauth]/route.ts`. Sessions are managed via JWT.

### 🔌 API Routes

Located in `app/api/`. Handles:

* Authentication
* Chat model requests
* User CRUD operations

### 🧩 UI Components

Custom + `shadcn/ui` components located in `components/ui/`. Easily customizable for your needs.

## 10. 🌍 Deployment

Deploy easily via platforms like:

* [Vercel](https://vercel.com/) 🚀
* [Netlify](https://www.netlify.com/) ☁️

**Steps:**

1. 📤 Push your code to GitHub/GitLab
2. 🛠️ Import the repo in Vercel/Netlify
3. 🔐 Set environment variables in dashboard
4. 🚀 Deploy and go live!