# Deployment Guide for Todo App Fullstack

This guide provides step-by-step instructions for deploying the Next.js + Supabase Todo application to production.

## Prerequisites

- Node.js 18+ installed
- Git installed
- Supabase account
- Vercel account (recommended for Next.js deployment)

## Environment Variables

Create a `.env.local` file with the following variables:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Database URL (for Prisma)
DATABASE_URL=postgresql://username:password@host:port/database

# Optional: OAuth Providers (if using social login)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
```

## Step 1: Set up Supabase Project

1. Go to [supabase.com](https://supabase.com) and create an account
2. Create a new project
3. Get your `Project URL` and `Anonymous Key` from the Project Settings
4. In the SQL Editor, run the following to set up the database schema:

```sql
-- Create users table
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create todos table
CREATE TABLE todos (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  completed BOOLEAN DEFAULT FALSE,
  priority TEXT DEFAULT 'medium',
  due_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tags TEXT[] DEFAULT '{}',
  shared_with TEXT[] DEFAULT '{}'
);

-- Create comments table
CREATE TABLE comments (
  id TEXT PRIMARY KEY,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  todo_id TEXT NOT NULL REFERENCES todos(id) ON DELETE CASCADE
);

-- Create tags table
CREATE TABLE tags (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#3B82F6',
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE
);

-- Enable Row Level Security (RLS)
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own todos" ON todos FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own todos" ON todos FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own todos" ON todos FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own todos" ON todos FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own comments" ON comments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own comments" ON comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own comments" ON comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own comments" ON comments FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own tags" ON tags FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own tags" ON tags FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own tags" ON tags FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own tags" ON tags FOR DELETE USING (auth.uid() = user_id);

-- Enable real-time
BEGIN;
  -- Enable the pg_net extension to allow http requests
  CREATE EXTENSION IF NOT EXISTS pg_net;

  -- Enable real-time
  DROP publication IF EXISTS supabase_realtime;
  CREATE publication supabase_realtime;
COMMIT;
```

## Step 2: Set up Authentication

1. In your Supabase project, go to Authentication → Settings
2. Enable the sign-in methods you want (Email, Google, GitHub, etc.)
3. Add your redirect URLs:
   - Development: `http://localhost:3001`
   - Production: `https://yourdomain.com`

## Step 3: Deploy to Vercel

### Option A: Using Vercel CLI

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Initialize and deploy:
```bash
vercel --prod
```

### Option B: Connect GitHub Repository

1. Push your code to a GitHub repository
2. Go to [vercel.com](https://vercel.com) and create an account
3. Import your GitHub repository
4. Add the environment variables in the Vercel dashboard
5. Deploy!

## Step 4: Configure Production Environment

In your Vercel project settings:

1. Go to Settings → Environment Variables
2. Add the environment variables from your `.env.local` file
3. Make sure to add them for both Preview and Production environments

## Step 5: Set up Custom Domain (Optional)

1. In Vercel, go to your project
2. Go to Settings → Domains
3. Add your custom domain
4. Follow DNS instructions to point your domain to Vercel

## Step 6: Set up Database Migrations for Production

1. Run the following command to push your Prisma schema to the production database:

```bash
# Set DATABASE_URL to your production database
DATABASE_URL=your-production-db-url npx prisma db push
```

2. Generate the Prisma client for production:
```bash
npx prisma generate
```

## Monitoring and Maintenance

1. Set up error tracking with Sentry (optional)
2. Monitor your Supabase project for performance
3. Regularly backup your database
4. Monitor usage to ensure you stay within Supabase limits

## Troubleshooting

### Common Issues:

1. **Auth not working**: Make sure your redirect URLs are correctly set in Supabase
2. **Real-time not working**: Check that you have enabled real-time in your Supabase project
3. **Database connection errors**: Verify your DATABASE_URL is correctly formatted
4. **Environment variables not loading**: Ensure they're set in your deployment platform

### Useful Commands:

```bash
# Deploy to production
npm run build && npm start

# Push database schema changes
npx prisma db push

# Generate Prisma client
npx prisma generate

# Check environment variables
npx vercel env pull .env.local
```

## Scaling Tips

1. **Database**: Monitor your Supabase database performance and scale up as needed
2. **Static assets**: Vercel handles this automatically
3. **Caching**: Implement proper caching strategies in your Next.js app
4. **CDN**: Vercel provides global CDN by default

Your Todo app should now be deployed and ready for use!