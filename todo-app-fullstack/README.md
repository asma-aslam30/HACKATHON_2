# Todo App Fullstack

A modern, collaborative todo application built with Next.js, Supabase, and Tailwind CSS.

## Features

- 🔐 **Authentication**: Secure login with email, Google, and GitHub
- 📝 **Todo Management**: Create, update, and manage tasks
- 🔄 **Real-time Sync**: Live updates across devices and users
- 👥 **Collaboration**: Share tasks with team members
- 💬 **Comments**: Discuss tasks with teammates
- 📊 **Dashboard**: Visualize productivity and progress
- 🎨 **Modern UI**: Beautiful interface with Tailwind CSS
- 📱 **Responsive**: Works on all device sizes

## Tech Stack

- **Frontend**: Next.js 14, React 18
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **Database**: PostgreSQL with Prisma ORM
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Icons**: Heroicons
- **Type Safety**: TypeScript (optional)

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd todo-app-fullstack
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
# Then update .env.local with your Supabase credentials
```

4. Run the development server:
```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3001](http://localhost:3001) in your browser

## Environment Variables

Create a `.env.local` file in the root directory:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Database URL (for Prisma)
DATABASE_URL=your_postgres_database_url

# OAuth (optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Lint code
- `npm run db:push` - Push Prisma schema to database
- `npm run db:studio` - Open Prisma Studio

## Folder Structure

```
todo-app-fullstack/
├── components/          # Reusable UI components
├── lib/                 # Utility functions and services
├── pages/               # Next.js pages
├── public/              # Static assets
├── styles/              # Global styles
├── __tests__/           # Test files
├── prisma/              # Prisma schema and migrations
├── DEPLOYMENT.md        # Deployment instructions
└── README.md            # This file
```

## Database Schema

The application uses a PostgreSQL database managed by Prisma. Key models include:

- `User`: Application users
- `Todo`: Tasks with title, description, completion status, etc.
- `Comment`: Discussions on tasks
- `Tag`: Categorization of tasks
- `Collaboration`: Sharing relationships between users and tasks

## API Routes

- `/api/auth` - Authentication endpoints
- `/api/todos` - Todo management
- `/api/comments` - Comment management

## Testing

Run tests with:
```bash
npm run test
# or for watch mode
npm run test:watch
```

Unit tests are located in `__tests__/unit/`
Integration tests are in `__tests__/integration/`
Component tests are in `__tests__/components/`

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests (`npm run test`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you encounter any issues, please open an issue in the GitHub repository.