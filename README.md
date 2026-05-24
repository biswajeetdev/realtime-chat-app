# Realtime Chat App

![React Native](https://img.shields.io/badge/React_Native-20232A?style=flat&logo=react&logoColor=61DAFB)
![Expo](https://img.shields.io/badge/Expo-000020?style=flat&logo=expo&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![InstantDB](https://img.shields.io/badge/InstantDB-7C3AED?style=flat&logoColor=white)

A mobile realtime chat application built with Expo and InstantDB for live message syncing without a traditional backend.

## Tech Stack

- **Framework:** React Native (Expo)
- **Realtime Sync:** InstantDB
- **Language:** TypeScript

## Why InstantDB

InstantDB handles realtime data sync at the client level, eliminating the need for a separate WebSocket server. Messages appear instantly across all connected clients without polling.

## Setup
```bash
git clone https://github.com/biswajeetdev/realtime-chat-app
cd realtime-chat-app
npm install
npx expo start
```

Add your InstantDB app ID to `.env.local` using `.env.local.example` as reference.