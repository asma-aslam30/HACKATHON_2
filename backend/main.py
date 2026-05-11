"""
Phase III — AI-Powered Todo Chatbot
FastAPI + Gemini 2.5 Flash + MCP Tools + Neon PostgreSQL
"""

import os
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

# Local imports after load_dotenv so env vars are available  # noqa: E402
from db import create_db_and_tables  # noqa: E402
from routes.chat import router as chat_router  # noqa: E402
from routes.tasks import router as tasks_router  # noqa: E402


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Create DB tables on startup."""
    create_db_and_tables()
    yield


app = FastAPI(
    title="Todo AI Chatbot — Phase III",
    description="AI-powered todo management via Gemini 2.5 Flash + MCP tools",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        os.getenv("FRONTEND_URL", "http://localhost:3000"),
        "http://localhost:3000",
        "http://localhost:3001",
        "https://*.vercel.app",
        "https://*.run.app",
        "https://*.web.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat_router)
app.include_router(tasks_router)


@app.get("/")
def root():
    return {
        "name": "Todo AI Chatbot API",
        "phase": "III",
        "model": os.getenv("GEMINI_MODEL", "gemini-2.5-flash"),
        "status": "running",
        "docs": "/docs",
    }


@app.get("/health")
def health():
    return {"status": "ok"}
