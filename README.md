# Flo - Your AI Voice Companion

Turn hesitation into action with Flo, a momentum-based Conversational Voice AI Agent that detects hesitation, breaks mental friction, and gets you back in a state of flow.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Visit%20App-blue)](https://switch-it-up.vercel.app/)

## Overview

Flo is an empathetic voice assistant that helps you manage stress, stay organized, and find your calm. It combines advanced AI capabilities with seamless integrations to provide a comprehensive productivity and well-being solution.

### Key Features

- 🎯 **Smart Task Focus**: Understands when you're overwhelmed, refines your focus, and helps you take the next step without cognitive overload
- 💬 **Empathetic Conversations**: Voice-based support to help you process emotions and reduce anxiety
- 📅 **Seamless Integrations**:
  - Notion for note-taking and task management
  - Google Calendar for event scheduling
- 🔍 **Just Talk to Browse**: Surface relevant insights, get nudges to take action, and stay on track

## Architecture

![Architecture Diagram](https://i.imgur.com/QBtMmhQ.png)

## Tech Stack

- **Frontend**: Next.js 14, React, TailwindCSS
- **Backend**: FastAPI, Python
- **Database**: Supabase
- **Authentication**: Clerk
- **APIs**:
  - ElevenLabs for Voice AI
  - Notion API for notes and tasks
  - Google Calendar API for events
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.11+
- uv (Python package installer)

### Environment Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd switch-it-up
   ```

2. Install frontend dependencies:
   ```bash
   npm install
   ```

3. Install backend dependencies:
   ```bash
   uv sync
   ```

4. Create a `.env.local` file with the following variables:
   ```env
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
   CLERK_SECRET_KEY=your_clerk_secret
   NEXT_PUBLIC_XI_API_KEY=your_elevenlabs_key
   SUPABASE_URL=your_supabase_url
   SUPABASE_KEY=your_supabase_key
   NOTION_CLIENT_ID=your_notion_client_id
   NOTION_CLIENT_SECRET=your_notion_secret
   NEXT_PUBLIC_GCAL_CLIENT_ID=your_google_client_id
   GCAL_CLIENT_SECRET=your_google_secret
   ```

### Running the Application

1. Start the development server:
   ```bash
   npm run dev
   ```
   This will start both the Next.js frontend and FastAPI backend concurrently.

2. Open [http://localhost:3000](http://localhost:3000) in your browser.

## API Documentation

FastAPI documentation is available at:
- Swagger UI: [http://localhost:3000/api/py/docs](http://localhost:3000/api/py/docs)
- OpenAPI: [http://localhost:3000/api/py/openapi.json](http://localhost:3000/api/py/openapi.json)

## Project Structure

```
switch-it-up/
├── app/                    # Next.js frontend
│   ├── components/        # React components
│   │   ├── api/          # API routes
│   │   └── [...index]/   # Main pages
│   ├── api/               # FastAPI backend
│   │   ├── src/          # Source code
│   │   │   ├── db/       # Database operations
│   │   │   ├── notion/   # Notion integration
│   │   │   ├── routes/   # API routes
│   │   │   └── services/ # Business logic
│   │   └── index.py      # FastAPI entry point
│   └── public/            # Static assets
└── README.md
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Deployment

The application is deployed on Vercel: [https://switch-it-up.vercel.app/](https://switch-it-up.vercel.app/)
