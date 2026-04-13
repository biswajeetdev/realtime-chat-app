# Realtime Chat App

A mobile realtime chat application built with Expo and InstantDB for live message syncing without a traditional backend.

## Tech Stack

- **Framework:** React Native (Expo)
- **Realtime Sync:** InstantDB
- **Language:** TypeScript

## Why InstantDB

InstantDB handles realtime data sync at the client level, eliminating the need for a separate WebSocket server. Messages appear instantly across all connected clients without polling.

## Setup
```bash
git clone https://github.com/YOUR_USERNAME/realtime-chat-app
cd realtime-chat-app
npm install
npx expo start
```

Add your InstantDB app ID to `.env.local` using `.env.local.example` as reference.