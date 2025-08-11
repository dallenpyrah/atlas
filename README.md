This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Environment Setup

### Pull Environment Variables from Vercel

To sync your local development environment with your Vercel project's environment variables:

1. **Install Vercel CLI** (if not already installed):
```bash
npm i -g vercel
# or
pnpm add -g vercel
# or
bun add -g vercel
```

2. **Link your local project to Vercel**:
```bash
vercel link
```
When prompted:
- Select your scope (personal account or team)
- Choose to link to an existing project
- Enter your project name

3. **Pull environment variables**:
```bash
vercel env pull .env.local
```
This command will:
- Download all environment variables from your Vercel project
- Create a `.env.local` file with all variables
- Automatically handle different environments (development, preview, production)

4. **Verify the `.env.local` file** was created and contains your variables:
```bash
cat .env.local
```

> **Note**: The `.env.local` file is already in `.gitignore` to prevent accidental commits of sensitive data.

### Update Environment Variables

If you need to update or add new environment variables:

1. **Add via Vercel Dashboard**:
   - Go to your project settings on [vercel.com](https://vercel.com)
   - Navigate to Settings → Environment Variables
   - Add/update variables

2. **Pull updates locally**:
```bash
vercel env pull .env.local
```

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
