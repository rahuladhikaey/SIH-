# 🚀 MedMitra — Render Production Deployment Guide

This guide explains how to deploy the entire MedMitra system (**Frontend**, **Backend**, **Python AI Service**, and **Redis Queue**) to **Render** using 1-Click Blueprints.

---

## 📌 Prerequisites

1. **GitHub Repository**: Push this code to a public or private GitHub repository.
2. **Render Account**: Create a free account at [render.com](https://render.com).
3. **MongoDB Atlas Account**: Create a free MongoDB database at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas).

---

## 🛠️ Step 1: Set Up Free MongoDB Database (MongoDB Atlas)

Render does not host managed MongoDB databases natively. Follow these 3 quick steps:

1. Log into [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Click **Create Cluster** and select the **M0 Free Tier**.
3. Under **Network Access**, click **Add IP Address** and enter `0.0.0.0/0` (Allows Render services to connect).
4. Under **Database Access**, create a Database User (e.g. username: `medmitra_admin`, password: `your_secure_password`).
5. Click **Connect** → **Drivers** → Copy your connection string:
   ```
   mongodb+srv://medmitra_admin:<password>@cluster0.mongodb.net/medmitra?retryWrites=true&w=majority
   ```
   *(Save this connection string for Step 3)*

---

## 🚀 Step 2: Deploy to Render via Blueprint (1-Click Setup)

1. Log in to your [Render Dashboard](https://dashboard.render.com).
2. Click the **New +** button in the top navigation bar and select **Blueprint**.
3. Connect your GitHub repository containing this MedMitra codebase.
4. Render will automatically detect the [`render.yaml`](./render.yaml) file in the root directory.
5. Enter a Service Group Name (e.g., `medmitra-prod`).
6. Under Environment Variables:
   - Paste your **`MONGODB_URI`** connection string from MongoDB Atlas.
7. Click **Apply**.

Render will automatically provision and deploy:
- 🟢 `medmitra-redis`: Managed Redis Key-Value Store
- 🟢 `medmitra-backend`: Express + TypeScript API Service
- 🟢 `medmitra-ai-service`: Python FastAPI AI Service
- 🟢 `medmitra-frontend`: React + Vite SPA Web Application

---

## 🌐 Render Live Endpoints Overview

Once deployed, your services will be available at:
- **Frontend App**: `https://medmitra-frontend.onrender.com`
- **Backend API**: `https://medmitra-backend.onrender.com/api/v1`
- **Backend Swagger Docs**: `https://medmitra-backend.onrender.com/api-docs`
- **AI Service**: `https://medmitra-ai-service.onrender.com`

---

## 🔍 Verification & Health Checks

You can verify service health by visiting:
- Backend Health Check: `https://medmitra-backend.onrender.com/health`
- AI Service Health Check: `https://medmitra-ai-service.onrender.com/health`

---

## 🔐 Optional AI Provider API Keys (Env Vars)

To enable live LLM & Vision capabilities in the AI service, navigate to your `medmitra-ai-service` on Render → **Environment** tab, and add any of:
- `OPENAI_API_KEY` (For GPT-4o Clinical Summarization)
- `GEMINI_API_KEY` (For Gemini 1.5 Clinical Extractions)
- `ANTHROPIC_API_KEY` (For Claude Clinical Validation)
