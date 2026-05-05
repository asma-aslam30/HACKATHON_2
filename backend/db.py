import os
from sqlmodel import SQLModel, Session, create_engine
from sqlalchemy import event
from dotenv import load_dotenv

load_dotenv()

# Use the UNPOOLED URL for SQLAlchemy (Neon pooled URL breaks with psycopg2)
DATABASE_URL = os.getenv("DATABASE_URL_UNPOOLED") or os.getenv("DATABASE_URL", "")

# Strip channel_binding param — psycopg2 doesn't support it
if "channel_binding" in DATABASE_URL:
    import re
    DATABASE_URL = re.sub(r"[&?]channel_binding=\w+", "", DATABASE_URL)

engine = create_engine(
    DATABASE_URL,
    echo=False,
    connect_args={
        "sslmode": "require",
        "connect_timeout": 30,
        "keepalives": 1,
        "keepalives_idle": 30,
        "keepalives_interval": 5,
        "keepalives_count": 5,
    },
    pool_pre_ping=True,       # test connection before using it
    pool_recycle=300,         # recycle connections every 5 min
    pool_size=5,
    max_overflow=10,
)


def create_db_and_tables():
    """Create all tables if they don't exist."""
    SQLModel.metadata.create_all(engine)


def get_session():
    """FastAPI dependency — yields a DB session."""
    with Session(engine) as session:
        yield session
