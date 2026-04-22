# Hivon Blog Platform

A full-stack blogging platform built with Next.js and Supabase.

## Tech Stack

- **Frontend + Backend**: Next.js 14 (App Router)
- **Authentication**: Supabase Auth
- **Database**: Supabase (PostgreSQL)
- **AI Integration**: Hugging Face Inference API (facebook/bart-large-cnn)
- **Styling**: Tailwind CSS
- **Deployment**: Netlify

## Features

- Email/password authentication
- Three user roles: Viewer, Author, Admin
- Create, edit, and view blog posts
- Featured image upload via Supabase Storage
- AI-generated post summaries (generated once, stored in DB)
- Comments on posts
- Search posts by title
- Pagination (6 posts per page)
- Admin dashboard for monitoring posts and comments

## Project Setup

### Prerequisites
- Node.js 18+
- Supabase account
- Hugging Face account

### Installation

```bash
git clone https://github.com/harsh-0905/hivon-blog.git
cd hivon-blog
npm install
```

### Environment Variables

Create `.env.local` in the root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
HUGGINGFACE_API_KEY=your_huggingface_token
```

### Database Setup

Run this SQL in Supabase SQL Editor:

```sql
create table public.users (
  id uuid references auth.users(id) on delete cascade primary key,
  name text not null,
  email text not null unique,
  role text not null default 'viewer'
);

create table public.posts (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  body text not null,
  image_url text,
  summary text,
  author_id uuid references public.users(id) not null,
  created_at timestamptz default now()
);

create table public.comments (
  id uuid default gen_random_uuid() primary key,
  post_id uuid references public.posts(id) not null,
  user_id uuid references public.users(id) not null,
  comment_text text not null,
  created_at timestamptz default now()
);
```

### Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## User Roles

| Role | Permissions |
|------|------------|
| Viewer | View posts, read summaries, comment |
| Author | Create posts, edit own posts, view comments |
| Admin | Edit any post, monitor all comments |

To set a user as admin or author, update the role in Supabase:

```sql
update public.users set role = 'author' where email = 'user@example.com';
update public.users set role = 'admin' where email = 'admin@example.com';
```

## Deployment Steps

1. Push code to GitHub
2. Go to [netlify.com](https://netlify.com)
3. Import GitHub repository
4. Add environment variables in Project Configuration
5. Deploy

## AI Integration

When a post is created:
1. Post body is sent to Hugging Face API
2. A ~200 word summary is generated
3. Summary is stored in the `posts.summary` column
4. Summary is displayed on post listing and post detail pages
5. API is never called again for the same post (cost optimization)
