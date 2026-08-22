# CollegeFinder

CollegeFinder is a college discovery platform built with Next.js, TypeScript, Prisma, and PostgreSQL.

Users can search colleges, filter by location, view college details, save colleges, and compare up to three colleges.

## Features

- College listing with search, location filtering, and pagination
- College details and course information
- User registration and login
- Cookie-based authentication
- Save and remove colleges
- Compare up to three colleges using browser localStorage
- Responsive dark user interface

## Technologies

- Next.js App Router
- TypeScript and React
- Prisma ORM
- PostgreSQL
- Tailwind CSS
- JWT authentication with `jose`

## Requirements

- Node.js 20 or newer
- PostgreSQL
- npm

## Installation

```bash
git clone https://github.com/MohammedQadeer2/college-discovery-platform.git
cd college-discovery-platform
npm install
```

## Environment Variables

Create a `.env` file in the project root:

```env
DATABASE_URL="your-postgresql-connection-string"
JWT_SECRET="your-secret-key"
```

Do not commit `.env` to GitHub.

## Database Setup

Apply migrations and insert sample college data:

```bash
npx prisma migrate deploy
npx prisma db seed
```

The seed script recreates the college data and removes existing college and saved-college records before inserting sample data.

## Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Available Pages

| Route | Description |
| --- | --- |
| `/` | Browse and search colleges |
| `/colleges/[id]` | View college details |
| `/login` | Log in |
| `/register` | Create an account |
| `/saved` | View saved colleges |
| `/compare` | Compare selected colleges |

## API Routes

| Method | Route | Description |
| --- | --- | --- |
| `GET` | `/api/colleges` | List and filter colleges |
| `GET` | `/api/colleges/[id]` | Get one college |
| `POST` | `/api/auth/register` | Create an account |
| `POST` | `/api/auth/login` | Log in |
| `GET` | `/api/auth/me` | Get the current user |
| `POST` | `/api/auth/logout` | Log out |
| `GET` | `/api/saved-colleges` | List saved colleges |
| `POST` | `/api/saved-colleges` | Save a college |
| `DELETE` | `/api/saved-colleges/[collegeId]` | Remove a saved college |

## Production Build

```bash
npm run build
npm run start
```

The build command generates the Prisma client before building Next.js.

## Deploy on Vercel

1. Push the project to GitHub.
2. Import the repository into Vercel.
3. Add `DATABASE_URL` and `JWT_SECRET` in Vercel project settings.
4. Deploy or redeploy the project.

Use a hosted PostgreSQL database such as Neon or Supabase. Do not use a `localhost` database URL in Vercel.

## Useful Commands

```bash
npm run dev          # Start development server
npm run build        # Generate Prisma client and build the app
npm run start        # Start production server
npx prisma validate  # Validate the Prisma schema
npx prisma db seed   # Insert sample college data
```
