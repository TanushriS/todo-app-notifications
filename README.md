# 🚀 TaskMaster Pro - Advanced To-Do List with Smart Notifications

A modern, full-stack task management application built with Next.js 15, Supabase, and advanced UI components.

## ✨ Features

### 🔐 **Authentication**
- Secure JWT-based authentication with Supabase
- Email verification and password reset
- Protected routes and user sessions

### 📋 **Advanced Task Management**
- Create, read, update, delete tasks (CRUD)
- Task priorities: Low, Medium, High, Urgent
- Categories: Personal, Work, Health, Finance, Learning, Shopping
- Due dates with smart notifications
- Real-time updates across devices
- Task completion tracking

### 🔔 **Smart Notifications**
- Browser push notifications for upcoming tasks
- Visual indicators for overdue tasks
- Automatic reminders 15 minutes before due time
- Priority-based notification styling

### 📊 **Analytics Dashboard**
- Task completion statistics
- Progress tracking with visual indicators
- Category and priority breakdowns
- Performance metrics

### 🎨 **Modern UI/UX**
- Dark/Light mode toggle
- Responsive design for all devices
- Smooth animations and transitions
- Gradient backgrounds and modern styling
- Advanced filtering and search

### 🔍 **Advanced Filtering**
- Search tasks by title and description
- Filter by priority levels
- Filter by categories
- Tab-based views (All, Pending, Completed, Urgent)

## 🛠 **Tech Stack**

- **Frontend**: Next.js 15 with App Router
- **Backend**: Next.js API Routes & Server Actions
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Styling**: Tailwind CSS + shadcn/ui
- **Icons**: Lucide React
- **Deployment**: Vercel

## 📦 **Installation & Setup**

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account

### 1. Clone & Install
\`\`\`bash
# If you downloaded the ZIP, extract it first
cd taskmaster-pro

# Install dependencies
npm install
\`\`\`

### 2. Environment Setup
Create a `.env.local` file in the root directory:

\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
\`\`\`

### 3. Supabase Setup

#### A. Create a Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Wait for the database to be ready
4. Go to Settings > API to get your keys

#### B. Run Database Migrations
1. Go to SQL Editor in your Supabase dashboard
2. Run the contents of `scripts/create-tasks-table.sql`
3. Run the contents of `scripts/update-tasks-table.sql`

#### C. Configure Authentication
1. Go to Authentication > Settings
2. Enable email authentication
3. Configure your site URL: `http://localhost:3000`
4. Add redirect URLs if needed

### 4. Run the Application
\`\`\`bash
# Development server
npm run dev

# Production build
npm run build
npm start
\`\`\`

Visit `http://localhost:3000` to see your application!

## 🚀 **Deployment to Vercel**

### Option 1: Deploy from GitHub
1. Push your code to GitHub
2. Connect your GitHub repo to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### Option 2: Deploy with Vercel CLI
\`\`\`bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY

# Redeploy with env vars
vercel --prod
\`\`\`

## 🔧 **Configuration**

### Notification Settings
The app automatically requests notification permissions. To customize:
- Modify notification timing in `checkDueTasks()` function
- Customize notification messages in `showNotification()` function

### Database Schema
The tasks table includes:
- `id`: UUID primary key
- `user_id`: Foreign key to auth.users
- `title`: Task title (required)
- `description`: Task description
- `completed`: Boolean completion status
- `due_date`: Optional due date/time
- `priority`: low, medium, high, urgent
- `category`: personal, work, health, finance, learning, shopping
- `created_at`: Timestamp
- `updated_at`: Auto-updated timestamp

### Customization
- **Colors**: Modify `priorityColors` and category colors in the dashboard component
- **Categories**: Add/remove categories in the `categories` array
- **Priorities**: Modify priority levels in the database constraint and UI
- **Themes**: Customize dark/light mode colors in Tailwind config

## 🐛 **Troubleshooting**

### Common Issues

1. **Tasks not loading**
   - Check Supabase connection
   - Verify RLS policies are set up correctly
   - Check browser console for errors

2. **Authentication issues**
   - Verify environment variables
   - Check Supabase auth settings
   - Ensure redirect URLs are configured

3. **Notifications not working**
   - Check browser notification permissions
   - Verify HTTPS in production (required for notifications)

4. **Database errors**
   - Run the SQL scripts in correct order
   - Check table permissions and RLS policies

### Getting Help
- Check the browser console for detailed error messages
- Verify all environment variables are set correctly
- Ensure Supabase project is active and accessible

## 📝 **License**

This project is open source and available under the MIT License.

## 🤝 **Contributing**

Feel free to submit issues and enhancement requests!

---

Built with ❤️ using Next.js, Supabase, and modern web technologies.
