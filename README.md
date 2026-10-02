# CodePati

**Programming Learning & Code Resource Platform**

CodePati is a dedicated platform designed for programmers, students, and engineers to explore, learn, and practice problem-solving across multiple programming languages (C, C++, Java, Python) with structured problem statements, implementations, complexity analyses, and community contributions.

---

## 🚀 Technology Stack

- **Framework:** [Next.js](https://nextjs.org/) (v16, App Router)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Authentication:** [Auth.js / NextAuth](https://authjs.dev/) (v5) with Google OAuth
- **Database:** [PostgreSQL](https://www.postgresql.org/) (v16)
- **ORM:** [Prisma](https://www.prisma.io/) (v6) with `@auth/prisma-adapter`
- **Version Control:** Git & GitHub

---

## 📁 Project Architecture

```text
CodePati/
├── prisma/
│   ├── migrations/          # Version-controlled database migrations
│   ├── schema.prisma        # Complete schema (Users, Auth, Programs, Submissions)
│   ├── promote-admin.ts     # CLI tool to promote users to ADMIN
│   └── seed.ts              # Seed script for initial categories and languages
├── public/
│   ├── icons/               # Platform icons
│   └── images/              # Static media assets (e.g. codepati-logo.png)
├── src/
│   ├── app/                 # Next.js App Router (pages, layout, styles)
│   │   ├── admin/           # Role-protected Administration Console (/admin)
│   │   │   └── page.tsx
│   │   ├── api/auth/        # Auth.js route handlers ([...nextauth])
│   │   │   └── [...nextauth]/route.ts
│   │   ├── login/           # Custom branded login experience (/login)
│   │   │   └── page.tsx
│   │   ├── globals.css
│   │   ├── layout.tsx       # Root layout wrapping Navbar & AuthProvider
│   │   └── page.tsx         # Development landing page & DB verification
│   ├── components/
│   │   ├── layout/          # Layout shells (Logo, Navbar, ThemeToggle)
│   │   │   ├── Logo.tsx
│   │   │   ├── Navbar.tsx
│   │   │   └── ThemeToggle.tsx
│   │   ├── providers/       # Client-side context providers (AuthProvider)
│   │   ├── shared/          # Reusable shared components
│   │   └── ui/              # Atom/UI primitives
│   ├── config/
│   │   └── site.ts          # Site-wide configurations and metadata
│   ├── lib/
│   │   ├── constants.ts     # Platform constants
│   │   ├── prisma.ts        # Singleton Prisma client instance
│   │   └── utils.ts         # Utility helpers
│   ├── server/
│   │   ├── repositories/    # Database query access layer
│   │   └── services/        # Business logic operations
│   ├── types/
│   │   ├── index.ts         # Application types
│   │   └── next-auth.d.ts   # NextAuth session & user module augmentations
│   └── auth.ts              # Central Auth.js configuration & handlers
├── .env                     # Local environment secrets (not committed)
├── .env.example             # Example environment template
├── .gitignore               # Git ignore rules
├── package.json             # NPM dependencies & scripts
├── tsconfig.json            # TypeScript configuration
└── README.md
```

---

## 🔐 Authentication & Google OAuth Setup (Phase 3)

CodePati uses **Auth.js (NextAuth v5)** with the **Google OAuth Provider** and **Prisma Adapter** for user persistence in PostgreSQL.

### 1. Required Environment Variables

Configure these variables in your local `.env` file:

```env
# Database connection string
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/codepati?schema=public"

# Auth.js Secret (required for session JWT encryption)
# Generate with: npx auth secret or openssl rand -hex 32
AUTH_SECRET="your_32_byte_secret_here"

# Google OAuth Credentials (from Google Cloud Console)
AUTH_GOOGLE_ID="your-client-id.apps.googleusercontent.com"
AUTH_GOOGLE_SECRET="GOCSPX-your-client-secret"
```

### 2. Google Cloud Console Configuration

To enable Google sign-in:

1. Open the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project (e.g., `CodePati-Dev`) or select an existing project.
3. Navigate to **APIs & Services** > **OAuth consent screen**:
   * Select **External** user type.
   * Provide the Application name (`CodePati`) and support email.
   * Add the required scopes: `.../auth/userinfo.email` and `.../auth/userinfo.profile`.
   * Add your email as a Test User if testing in external mode.
4. Navigate to **APIs & Services** > **Credentials**:
   * Click **Create Credentials** > **OAuth client ID**.
   * Application type: **Web application**.
   * Name: `CodePati Localhost`.
   * **Authorized JavaScript origins**:
     * `http://localhost:3000`
   * **Authorized redirect URIs**:
     * `http://localhost:3000/api/auth/callback/google`
5. Copy the generated **Client ID** and **Client Secret** into your `.env` file as `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET`.

---

## 🛠️ Local Development & Operations

### 1. Starting PostgreSQL Locally

If running portable PostgreSQL locally on Windows:

```bash
# Start PostgreSQL daemon
C:/Users/USER/pgsql/bin/postgres.exe -D C:/Users/USER/pgsql/data

# Or using pg_ctl
C:/Users/USER/pgsql/bin/pg_ctl.exe -D C:/Users/USER/pgsql/data start
```

### 2. Database Migrations & Seeding

```bash
# Run migrations
npx prisma migrate dev

# Seed foundational categories and languages
npx prisma db seed
```

### 3. Starting the Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000).

### 4. Testing Authentication & Google Login

1. Click **Sign in** on the navbar or navigate to `http://localhost:3000/login`.
2. Click **Sign in with Google**.
3. Upon authentication, you will be redirected back to the app with your session active.
4. The navbar will reflect your profile picture, name, and role.
5. Clicking **Sign out** terminates the session and returns to public view.

### 5. Role-Based Access Control & Admin Promotion

* By default, every newly authenticated Google account is assigned the **`USER`** role.
* Regular users attempting to navigate to `/admin` are presented with a **403 Access Denied** barrier.
* Unauthenticated users attempting to access `/admin` are redirected to `/login?callbackUrl=/admin`.
* To promote a known user account to **`ADMIN`** during development:

```bash
# List all registered users
npm run promote-admin

# Promote a specific user
npm run promote-admin user@example.com
```

Once promoted, accessing `/admin` unlocks the CodePati Administration Console and adds an "Admin" badge to the navbar.

---

## 🧪 Production Verification

Run the full verification suite before deploying:

```bash
# TypeScript check & ESLint
npm run lint

# Production build
npm run build
```
