import os
from sqlmodel import SQLModel, Session, create_engine
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "")

# SQLModel / SQLAlchemy engine
# Use connect_args for SSL with Neon
engine = create_engine(
    DATABASE_URL,
    echo=False,
    connect_args={"sslmode": "require"} if "neon.tech" in DATABASE_URL else {},
)


def create_db_and_tables():
    """Create all tables if they don't exist."""
    SQLModel.metadata.create_all(engine)


def get_session():
    """FastAPI dependency — yields a DB session."""
    with Session(engine) as session:
        yield session
