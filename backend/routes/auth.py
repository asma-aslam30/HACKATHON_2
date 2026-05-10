"""
JWT Authentication for FastAPI
Verifies tokens issued by Better Auth (frontend)
Shared secret: BETTER_AUTH_SECRET env var
"""

import os
import jwt
from fastapi import Depends, HTTPException, Header
from typing import Optional

SECRET = os.getenv("BETTER_AUTH_SECRET", "fallback-secret-change-this")


class AuthUser:
    def __init__(self, id: str, email: str = ""):
        self.id = id
        self.email = email


def get_current_user(
    authorization: Optional[str] = Header(default=None),
    x_user_id: Optional[str] = Header(default=None, alias="x-user-id"),
) -> AuthUser:
    """
    FastAPI dependency — extracts and verifies the authenticated user.

    Priority:
    1. JWT token from Authorization: Bearer <token> header
    2. x-user-id header (dev/testing fallback)
    3. Raises 401 if neither is present
    """
    # Try JWT first
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ", 1)[1]
        try:
            payload = jwt.decode(
                token,
                SECRET,
                algorithms=["HS256"],
                options={"verify_exp": True},
            )
            user_id = payload.get("sub") or payload.get("userId") or payload.get("id")
            email = payload.get("email", "")
            if user_id:
                return AuthUser(id=str(user_id), email=email)
        except jwt.ExpiredSignatureError:
            raise HTTPException(status_code=401, detail="Token expired")
        except jwt.InvalidTokenError:
            raise HTTPException(status_code=401, detail="Invalid token")

    # Dev fallback: x-user-id header
    if x_user_id:
        return AuthUser(id=x_user_id)

    raise HTTPException(status_code=401, detail="Authentication required")


def verify_user_access(user_id_in_url: str, current_user: AuthUser):
    """Ensure the authenticated user matches the user_id in the URL."""
    if current_user.id != user_id_in_url:
        raise HTTPException(
            status_code=403,
            detail="Access denied: you can only access your own data"
        )
