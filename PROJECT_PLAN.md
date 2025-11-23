# Bible RAG Application - Project Plan

## Project Overview
We are building a **Retrieval-Augmented Generation (RAG)** web application that allows users to "chat" with the Bible.
- **Source Material**: King James Version (KJV) Bible (`kjv.json`).
- **Brain**: Google Gemini (via Google Generative AI SDK).
- **Memory**: Supabase (PostgreSQL with `pgvector` for vector similarity search).
- **Frontend**: Next.js (React) with a modern, responsive UI.

## Technology Stack
- **Framework**: Next.js 15 (App Router)
- **Language**: JavaScript/Node.js
- **Database**: Supabase (Postgres + pgvector)
- **AI Model**: Google Gemini (`gemini-1.5-flash` for chat, `text-embedding-004` for embeddings)
- **Styling**: Tailwind CSS + Lucide React (Icons)
- **Streaming**: Vercel AI SDK (`ai` package)

---

## Step-by-Step Implementation Guide

### Phase 1: Project Setup & Configuration
1.  **Install Dependencies**:
    -   `@supabase/supabase-js`: For database interaction.
    -   `@google/generative-ai`: For Gemini API.
    -   `ai`: For chat state management and streaming.
    -   `clsx`, `tailwind-merge`: For UI styling.
2.  **Environment Variables**:
    -   Set up `.env.local` with:
        -   `NEXT_PUBLIC_SUPABASE_URL`
        -   `NEXT_PUBLIC_SUPABASE_ANON_KEY`
        -   `SUPABASE_SERVICE_ROLE_KEY` (for ingestion only - keep secure!)
        -   `GOOGLE_GENERATIVE_AI_API_KEY`

### Phase 2: Database Setup (Supabase)
1.  **Enable Vector Extension**:
    -   Run `create extension if not exists vector;` in Supabase SQL Editor.
2.  **Create Documents Table**:
    -   Table `documents` with columns:
        -   `id`: Primary Key
        -   `content`: Text (The verse text)
        -   `metadata`: JSONB (Book, Chapter, Verse reference)
        -   `embedding`: Vector(768) (For Gemini embeddings)
3.  **Create Search Function**:
    -   A PostgreSQL function `match_documents` to perform similarity search using cosine distance.

### Phase 3: Data Ingestion (The "Knowledge Base")
1.  **Create Ingestion Script** (`src/scripts/ingest.js`):
    -   Load `kjv.json`.
    -   Iterate through Books -> Chapters -> Verses.
    -   **Chunking**: Treat each verse as a chunk (or group verses if too short).
    -   **Embedding**: Send text to Gemini (`text-embedding-004`) to get a vector.
    -   **Storage**: Insert text, metadata, and vector into Supabase `documents` table.
2.  **Run Ingestion**:
    -   Execute the script to populate the database.

### Phase 4: Backend API (The "Brain")
1.  **Create API Route** (`src/app/api/chat/route.js`):
    -   Accept `messages` from the frontend.
    -   **Step 1: Embed Query**: Convert the user's last message into a vector.
    -   **Step 2: Retrieve Context**: Call `match_documents` RPC in Supabase to find relevant verses.
    -   **Step 3: Construct Prompt**: Combine the user's question with the retrieved Bible verses.
    -   **Step 4: Generate Response**: Stream the response from Gemini, instructing it to answer based on the context.

### Phase 5: Frontend UI (The "Face")
1.  **Chat Interface** (`src/app/page.js`):
    -   Use `useChat` hook from Vercel AI SDK.
    -   Display user messages and AI responses in a chat bubble layout.
    -   Show "Thinking..." state while retrieving context.
    -   **Design**: Clean, spiritual/minimalist aesthetic (e.g., serif fonts, soft colors).

### Phase 6: Verification & Polish
1.  **Test Queries**: Ask questions like "What is love?" or "Who is David?" to verify it retrieves correct verses.
2.  **Refine Prompt**: Tweak the system instruction to ensure the AI cites verses correctly.
3.  **Deploy**: (Optional) Deploy to Vercel.

---

## Next Steps
1.  Run `npm install` to get packages.
2.  Create the Supabase table using the provided SQL script.
3.  Write and run the ingestion script.
