# AI Job Application Agent

AI-powered tool that scrapes jobs from ATS platforms, stores them in PostgreSQL, and generates tailored resumes using Gemini.

## Features

- Lever job scraping
- Postgres job storage
- AI resume generation (Gemini API)
- Web dashboard UI

## Tech Stack

- Node.js
- Express
- PostgreSQL
- Google Gemini API
- TailwindCSS

## API Endpoints

GET /api/jobs  
GET /api/jobs/saved  
POST /api/resume/generate

## Run Locally

npm install
npm run dev