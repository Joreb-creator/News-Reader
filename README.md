# 📰 News Reader

A full-stack news application built with React + Vite (frontend) and Node.js + Express (backend proxy).

## ✨ Features

- 🔍 Search news by keyword
- 🗂️ Browse by category
- 📄 Single-article “featured” view
- ⏩ Pagination with prefetching
- 💾 Favorites (persisted in localStorage)
- ⚡ In-memory caching for faster navigation
- 📱 Responsive layout (desktop + mobile)
- 🚨 Error handling for API limits and failures

## 🧠 Tech Stack

- Frontend: React + Vite + TypeScript
- Backend: Node.js + Express
- API: GNews

## 🔐 API Integration

This project uses the **GNews API** as a data provider.

The free tier of GNews includes:
- request limits
- delayed data

To handle this, the app includes:
- caching of previously fetched pages
- prefetching for smoother navigation
- graceful error handling when limits are reached

## ⚠️ Note

If the API limit is reached, the app will display an error message.  
This is expected behavior when using the free plan.

## 🚀 How to Run Locally

```bash
npm run server:install
npm run dev