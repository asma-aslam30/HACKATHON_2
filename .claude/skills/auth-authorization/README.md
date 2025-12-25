# Authentication & Authorization Skill

**Purpose**: Design Better Auth integration, JWT middleware, and multi-tenant authorization patterns for Evolution of Todo hackathon Phase II-V

**Owner**: Backend Pro Agent + Frontend Auth Agent

**Version**: 1.0.0
**Last Updated**: 2025-12-24

---

## Overview

The **Authentication & Authorization Skill** enables secure, multi-tenant access control:
- Design Better Auth integration for Next.js and FastAPI
- Implement JWT middleware for stateless authentication
- Enforce multi-tenant authorization (row-level security)
- Create refresh token flows for session management
- Generate auth specifications and middleware code
- Integrate with Neon PostgreSQL row-level security (optional)

This skill ensures CRITICAL security requirement: users can ONLY access their own data.

---

## Skill Components

### 1. Phase II Auth Flow

**Complete Authentication Flow**:
```
User (Browser)
  ↓
Next.js Frontend (Better Auth client)
  ↓
POST /api/auth/login (Better Auth server)
  ↓
Verify password (bcrypt)
  ↓
Generate JWT access token + refresh token
  ↓
Return tokens to frontend
  ↓
Store tokens (httpOnly cookie or localStorage)
  ↓
Frontend → API request with Authorization: Bearer {access_token}
  ↓
FastAPI JWT middleware
  ↓
Decode token, extract user_id
  ↓
Inject current_user into route handler
  ↓
Route handler filters by user_id
  ↓
Return user-specific data
```

**Technologies**:
- **Better Auth**: Authentication library for Next.js and FastAPI
- **JWT**: JSON Web Tokens for stateless auth
- **Bcrypt**: Password hashing
- **HTTPOnly Cookies**: Secure token storage (recommended)
- **Neon RLS**: Database-level row filtering (optional Phase IV+)

### 2. Authorization Patterns (CRITICAL)

**Rule #1**: ALWAYS extract user_id from JWT, NEVER trust path parameters

```python
# ✅ CORRECT: Use JWT user_id
@router.get("/api/{user_id}/tasks")
async def list_tasks(
    user_id: int,  # Path parameter (DO NOT TRUST)
    current_user: User = Depends(get_current_user),  # From JWT
):
    # CRITICAL: Validate path matches JWT
    if user_id != current_user.id:
        raise HTTPException(status_code=403)

    # Filter by JWT user_id, not path
    tasks = session.exec(
        select(Task).where(Task.user_id == current_user.id)
    ).all()
```

**Rule #2**: Filter ALL database queries by user_id from JWT

```python
# ✅ CORRECT: Always filter by user_id
query = select(Task).where(Task.user_id == current_user.id)

# ❌ WRONG: No user_id filter
query = select(Task).where(Task.status == "pending")
```

**Rule #3**: Return 404 (not 403) when resource not found OR unauthorized

```python
# ✅ CORRECT: Return 404 for both cases
task = session.get(Task, task_id)
if not task or task.user_id != current_user.id:
    raise HTTPException(status_code=404, detail="Task not found")

# ❌ WRONG: Reveals existence of other users' data
if not task:
    raise HTTPException(status_code=404)
if task.user_id != current_user.id:
    raise HTTPException(status_code=403)  # Reveals task exists!
```

### 3. Refresh Tokens & Session Management

**Token Lifecycle**:
- **Access Token**: Short-lived (15 minutes), used for API requests
- **Refresh Token**: Long-lived (7 days), used to get new access token
- **Session**: Persisted in database with refresh token

**Refresh Flow**:
```
Frontend detects expired access token (401)
  ↓
POST /api/auth/refresh with refresh_token
  ↓
Verify refresh token signature
  ↓
Check if session still valid in database
  ↓
Generate new access token
  ↓
Return new access token
  ↓
Retry original request with new token
```

### 4. Better Auth Integration

**Better Auth Features**:
- Email/password authentication
- Social OAuth (Google, GitHub) - Phase III+
- Session management
- CSRF protection
- Rate limiting
- Password reset flows

---

## Skill Instructions

### Step 1: Design Auth Endpoints

**Template**:
```markdown
## Auth Endpoints

### POST /api/auth/register
Create new user account

**Request**:
\`\`\`json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "full_name": "John Doe"
}
\`\`\`

**Response (201)**:
\`\`\`json
{
  "id": 1,
  "email": "user@example.com",
  "full_name": "John Doe",
  "access_token": "eyJhbGc...",
  "refresh_token": "eyJhbGc...",
  "expires_in": 900
}
\`\`\`

**Errors**:
- 422: Email already exists
- 422: Password too weak
```

---

#### Example: Complete Auth Specification

```markdown
# Authentication Specification - Evolution of Todo

**Phase**: II (Web App)
**Method**: Better Auth + JWT
**Token Storage**: httpOnly cookies (primary) or localStorage (fallback)

---

## Auth Endpoints

### POST /api/auth/register

**Purpose**: Create new user account

**Request Body**:
\`\`\`json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "full_name": "John Doe"
}
\`\`\`

**Validation**:
- Email: Valid format, unique
- Password: Min 8 chars, must contain uppercase, lowercase, number
- Full name: 1-255 characters

**Response (201)**:
\`\`\`json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "full_name": "John Doe",
    "is_active": true
  },
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 900
}
\`\`\`

**Errors**:
- 422 Unprocessable Entity: Email already exists
- 422 Unprocessable Entity: Password too weak
- 422 Unprocessable Entity: Invalid email format

---

### POST /api/auth/login

**Purpose**: Authenticate user and generate JWT tokens

**Request Body**:
\`\`\`json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
\`\`\`

**Response (200)**:
\`\`\`json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "full_name": "John Doe"
  },
  "access_token": "eyJhbGc...",
  "refresh_token": "eyJhbGc...",
  "token_type": "bearer",
  "expires_in": 900
}
\`\`\`

**Errors**:
- 401 Unauthorized: Invalid email or password

**Security**:
- Use constant-time comparison for passwords (bcrypt.checkpw)
- Rate limit: 5 attempts per 15 minutes per IP
- Log failed login attempts

---

### POST /api/auth/refresh

**Purpose**: Get new access token using refresh token

**Request Body**:
\`\`\`json
{
  "refresh_token": "eyJhbGc..."
}
\`\`\`

**Response (200)**:
\`\`\`json
{
  "access_token": "eyJhbGc...",
  "token_type": "bearer",
  "expires_in": 900
}
\`\`\`

**Errors**:
- 401 Unauthorized: Invalid or expired refresh token
- 401 Unauthorized: Session revoked

---

### POST /api/auth/logout

**Purpose**: Revoke refresh token and end session

**Request Headers**:
\`\`\`
Authorization: Bearer {access_token}
\`\`\`

**Response (200)**:
\`\`\`json
{
  "message": "Logged out successfully"
}
\`\`\`

---

## JWT Token Structure

### Access Token Payload
\`\`\`json
{
  "sub": 1,                          // User ID (subject)
  "email": "user@example.com",       // User email
  "type": "access",                  // Token type
  "exp": 1735045800,                 // Expiration (15 minutes)
  "iat": 1735045000                  // Issued at
}
\`\`\`

### Refresh Token Payload
\`\`\`json
{
  "sub": 1,                          // User ID
  "session_id": "550e8400...",       // Session UUID
  "type": "refresh",                 // Token type
  "exp": 1735649800,                 // Expiration (7 days)
  "iat": 1735045000                  // Issued at
}
\`\`\`

### Token Signing
- Algorithm: HS256
- Secret: From environment variable JWT_SECRET
- Expiration: Access 15min, Refresh 7 days
```

---

### Step 2: Implement JWT Middleware

Create dependency injection for authentication.

**app/core/deps.py**:
```python
"""
Authentication Dependencies - JWT Middleware

Provides get_current_user dependency for protected routes.
"""

from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlmodel import Session, select
from jose import JWTError, jwt
from datetime import datetime

from app.core.config import settings
from app.models.user import User

import logging

logger = logging.getLogger(__name__)

# HTTP Bearer scheme for Authorization header
security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    session: Session = Depends(get_session),
) -> User:
    """
    Extract and validate JWT token, return current user.

    This is the CRITICAL security dependency that enforces multi-tenant isolation.

    Args:
        credentials: HTTP Bearer token from Authorization header
        session: Database session

    Returns:
        User object for authenticated user

    Raises:
        HTTPException 401: If token is invalid, expired, or user not found

    Usage:
        @router.get("/api/{user_id}/tasks")
        async def list_tasks(
            user_id: int,
            current_user: User = Depends(get_current_user),
        ):
            # CRITICAL: Validate path user_id matches JWT user_id
            if user_id != current_user.id:
                raise HTTPException(status_code=403)

            # Filter by JWT user_id (not path parameter)
            tasks = session.exec(
                select(Task).where(Task.user_id == current_user.id)
            ).all()
    """
    token = credentials.credentials

    # Decode JWT token
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET,
            algorithms=["HS256"],
        )

        # Extract user ID from "sub" claim
        user_id: int = payload.get("sub")

        if user_id is None:
            logger.warning("JWT missing 'sub' claim")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )

        # Verify token type
        token_type: str = payload.get("type")
        if token_type != "access":
            logger.warning(f"Invalid token type: {token_type}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token type",
                headers={"WWW-Authenticate": "Bearer"},
            )

        # Check expiration (jose library handles this, but explicit check)
        exp: int = payload.get("exp")
        if exp and datetime.utcnow().timestamp() > exp:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token has expired",
                headers={"WWW-Authenticate": "Bearer"},
            )

    except JWTError as e:
        logger.warning(f"JWT decode error: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Fetch user from database
    user = session.get(User, user_id)

    if user is None:
        logger.warning(f"User {user_id} from JWT not found in database")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Check if user account is active
    if not user.is_active:
        logger.warning(f"Inactive user {user_id} attempted to access API")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user account",
        )

    # Log successful authentication
    logger.info(f"User {user_id} authenticated successfully")

    return user


async def get_current_active_user(
    current_user: User = Depends(get_current_user),
) -> User:
    """
    Get current active user (convenience wrapper).

    Args:
        current_user: User from get_current_user dependency

    Returns:
        User object if active

    Raises:
        HTTPException 403: If user account is inactive

    Note:
        This is now redundant as get_current_user already checks is_active.
        Kept for backwards compatibility.
    """
    return current_user


def get_optional_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(HTTPBearer(auto_error=False)),
    session: Session = Depends(get_session),
) -> Optional[User]:
    """
    Get current user if authenticated, None otherwise.

    Used for endpoints that work both authenticated and unauthenticated.

    Args:
        credentials: Optional HTTP Bearer token
        session: Database session

    Returns:
        User object if authenticated, None otherwise

    Usage:
        @router.get("/api/public/tasks")
        async def list_public_tasks(
            user: Optional[User] = Depends(get_optional_user),
        ):
            if user:
                # Show user's tasks
            else:
                # Show sample tasks
    """
    if not credentials:
        return None

    try:
        payload = jwt.decode(
            credentials.credentials,
            settings.JWT_SECRET,
            algorithms=["HS256"],
        )
        user_id = payload.get("sub")

        if user_id:
            return session.get(User, user_id)

    except JWTError:
        pass

    return None
```

---

### Step 3: Implement Better Auth (Frontend)

**Next.js Configuration**:

**lib/auth.ts**:
```typescript
/**
 * Better Auth Configuration - Frontend
 *
 * Provides authentication for Next.js App Router
 */

import { betterAuth } from "better-auth/client";

export const authClient = betterAuth({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
  basePath: "/api/auth",

  // Session configuration
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes
    },
  },

  // Plugins
  plugins: [],
});

// Helper to get session server-side
export async function getSession() {
  const session = await authClient.getSession();
  return session;
}

// Helper to get access token
export async function getAccessToken(): Promise<string | null> {
  const session = await getSession();
  return session?.accessToken || null;
}
```

**Login Page** (app/login/page.tsx):
```tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await authClient.signIn.email({
        email,
        password,
      });

      if (result.error) {
        setError(result.error.message || 'Invalid email or password');
        return;
      }

      // Redirect to tasks page
      router.push('/tasks');
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-center mb-6">
          Login to Evolution of Todo
        </h1>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg disabled:opacity-50"
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="text-center mt-4 text-sm text-gray-600 dark:text-gray-400">
          Don't have an account?{' '}
          <a href="/register" className="text-blue-500 hover:text-blue-600">
            Register
          </a>
        </p>
      </div>
    </div>
  );
}
```

---

### Step 4: Implement Backend Auth Routes

**app/api/auth.py**:
```python
"""
Authentication API Router - Better Auth Integration

Endpoints:
- POST /api/auth/register - Create user account
- POST /api/auth/login - Authenticate and get tokens
- POST /api/auth/refresh - Refresh access token
- POST /api/auth/logout - Revoke session
"""

from datetime import datetime, timedelta
from typing import Dict
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from passlib.context import CryptContext
from jose import jwt

from app.core.deps import get_session, get_current_user
from app.core.config import settings
from app.models.user import User
from app.schemas.auth import (
    UserRegister,
    UserLogin,
    TokenResponse,
    RefreshTokenRequest,
)

import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/auth", tags=["auth"])

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password against bcrypt hash."""
    return pwd_context.verify(plain_password, hashed_password)


def hash_password(password: str) -> str:
    """Generate bcrypt hash for password."""
    return pwd_context.hash(password)


def create_access_token(user_id: int, email: str) -> str:
    """
    Create JWT access token.

    Args:
        user_id: User ID to encode in token
        email: User email

    Returns:
        JWT access token string
    """
    expire = datetime.utcnow() + timedelta(minutes=15)
    payload = {
        "sub": user_id,
        "email": email,
        "type": "access",
        "exp": expire,
        "iat": datetime.utcnow(),
    }
    token = jwt.encode(payload, settings.JWT_SECRET, algorithm="HS256")
    return token


def create_refresh_token(user_id: int, session_id: str) -> str:
    """
    Create JWT refresh token.

    Args:
        user_id: User ID to encode in token
        session_id: Session UUID for token revocation

    Returns:
        JWT refresh token string
    """
    expire = datetime.utcnow() + timedelta(days=7)
    payload = {
        "sub": user_id,
        "session_id": session_id,
        "type": "refresh",
        "exp": expire,
        "iat": datetime.utcnow(),
    }
    token = jwt.encode(payload, settings.JWT_SECRET, algorithm="HS256")
    return token


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(
    user_data: UserRegister,
    session: Session = Depends(get_session),
) -> Dict:
    """
    Register new user account.

    Request Body:
    - email: User email (unique)
    - password: Password (min 8 chars)
    - full_name: User's full name

    Returns:
        User object and JWT tokens
    """
    # Check if email already exists
    existing = session.exec(
        select(User).where(User.email == user_data.email)
    ).first()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Email already registered",
        )

    # Hash password
    password_hash = hash_password(user_data.password)

    # Create user
    user = User(
        email=user_data.email,
        password_hash=password_hash,
        full_name=user_data.full_name,
        is_active=True,
        is_superuser=False,
    )

    session.add(user)
    session.commit()
    session.refresh(user)

    logger.info(f"New user registered: {user.id} ({user.email})")

    # Generate tokens
    import uuid
    session_id = str(uuid.uuid4())

    access_token = create_access_token(user.id, user.email)
    refresh_token = create_refresh_token(user.id, session_id)

    return {
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "is_active": user.is_active,
        },
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "expires_in": 900,  # 15 minutes
    }


@router.post("/login", response_model=TokenResponse)
async def login(
    credentials: UserLogin,
    session: Session = Depends(get_session),
) -> Dict:
    """
    Authenticate user and generate JWT tokens.

    Request Body:
    - email: User email
    - password: User password

    Returns:
        User object and JWT tokens
    """
    # Find user by email
    user = session.exec(
        select(User).where(User.email == credentials.email)
    ).first()

    # Verify password (constant-time comparison)
    if not user or not verify_password(credentials.password, user.password_hash):
        logger.warning(f"Failed login attempt for {credentials.email}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Check if user is active
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user account",
        )

    logger.info(f"User logged in: {user.id} ({user.email})")

    # Generate tokens
    import uuid
    session_id = str(uuid.uuid4())

    access_token = create_access_token(user.id, user.email)
    refresh_token = create_refresh_token(user.id, session_id)

    return {
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
        },
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "expires_in": 900,
    }


@router.post("/refresh", response_model=Dict)
async def refresh_access_token(
    request: RefreshTokenRequest,
    session: Session = Depends(get_session),
) -> Dict:
    """
    Refresh access token using refresh token.

    Request Body:
    - refresh_token: Valid refresh token

    Returns:
        New access token
    """
    try:
        payload = jwt.decode(
            request.refresh_token,
            settings.JWT_SECRET,
            algorithms=["HS256"],
        )

        user_id = payload.get("sub")
        token_type = payload.get("type")

        if token_type != "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token type",
            )

        # Fetch user
        user = session.get(User, user_id)
        if not user or not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found or inactive",
            )

        # Generate new access token
        access_token = create_access_token(user.id, user.email)

        logger.info(f"Access token refreshed for user {user.id}")

        return {
            "access_token": access_token,
            "token_type": "bearer",
            "expires_in": 900,
        }

    except JWTError as e:
        logger.warning(f"Refresh token decode error: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token",
        )


@router.post("/logout")
async def logout(
    current_user: User = Depends(get_current_user),
) -> Dict:
    """
    Logout user (revoke session).

    In a stateless JWT system, logout is client-side (delete token).
    For session management, this would revoke the refresh token.

    Returns:
        Success message
    """
    logger.info(f"User logged out: {current_user.id}")

    return {"message": "Logged out successfully"}
```

---

### Step 5: Multi-Tenant Authorization Examples

**Example 1: List Tasks (Protected)**:
```python
@router.get("/api/{user_id}/tasks", response_model=List[TaskResponse])
async def list_tasks(
    user_id: int,  # Path parameter (DO NOT TRUST)
    status: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),  # From JWT
    session: Session = Depends(get_session),
) -> List[Task]:
    """List tasks for authenticated user."""

    # CRITICAL: Validate path user_id matches JWT user_id
    if user_id != current_user.id:
        logger.warning(
            f"User {current_user.id} attempted to access user {user_id} tasks"
        )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot access tasks for other users",
        )

    # Filter by JWT user_id (NEVER trust path parameter)
    query = select(Task).where(Task.user_id == current_user.id)

    if status:
        query = query.where(Task.status == status)

    tasks = session.exec(query).all()
    return tasks
```

**Example 2: Get Task (Protected)**:
```python
@router.get("/api/{user_id}/tasks/{task_id}", response_model=TaskResponse)
async def get_task(
    user_id: int,
    task_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
) -> Task:
    """Get single task with multi-tenant security."""

    # Validate path user_id
    if user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN)

    # Fetch task
    task = session.get(Task, task_id)

    # CRITICAL: Return 404 if not found OR belongs to different user
    # This prevents leaking information about other users' tasks
    if not task or task.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found",
        )

    return task
```

**Example 3: Admin Endpoint (Superuser Only)**:
```python
async def get_current_superuser(
    current_user: User = Depends(get_current_user),
) -> User:
    """Require superuser role."""
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Superuser access required",
        )
    return current_user


@router.get("/api/admin/users", response_model=List[UserResponse])
async def list_all_users(
    current_user: User = Depends(get_current_superuser),  # Admin only
    session: Session = Depends(get_session),
) -> List[User]:
    """List all users (admin only)."""
    users = session.exec(select(User)).all()
    return users
```

---

## Related Agents

- **Backend Pro Agent**: Implements FastAPI auth routes and JWT middleware
- **Frontend Auth Agent**: Implements Better Auth client and login UI
- **Security Agent**: Audits authentication and authorization implementation
- **Testing & QA Agent**: Tests auth flows and multi-tenant isolation

---

## Success Metrics

✅ **Secure**: No authentication bypasses, JWT properly validated
✅ **Multi-Tenant**: user_id from JWT enforced in ALL queries
✅ **Stateless**: JWT tokens, no server-side session storage
✅ **Refresh Flow**: Smooth token refresh without re-login
✅ **Error Handling**: Clear 401/403 responses
✅ **Password Security**: Bcrypt hashing, strength validation
✅ **Rate Limiting**: Protection against brute force
✅ **Tested**: 90%+ coverage of auth flows

---

## Best Practices

### Do's ✅

- **Extract user_id from JWT**: ALWAYS use current_user.id
- **Validate Path Parameters**: Check user_id in path matches JWT
- **Return 404 Not 403**: Don't leak resource existence
- **Use HTTPOnly Cookies**: More secure than localStorage
- **Rotate Secrets**: Change JWT_SECRET periodically
- **Log Auth Events**: Track login attempts and failures
- **Rate Limit**: Prevent brute force attacks
- **Hash Passwords**: Use bcrypt (never plaintext)

### Don'ts ❌

- **Don't Trust Path user_id**: ALWAYS validate against JWT
- **Don't Skip user_id Filter**: EVERY query must filter by user_id
- **Don't Return 403**: When resource not found (use 404)
- **Don't Expose Stack Traces**: In auth errors
- **Don't Store Tokens in localStorage**: Vulnerable to XSS
- **Don't Use Weak Secrets**: Min 32 random characters
- **Don't Skip Expiration**: Always set exp claim
- **Don't Log Passwords**: Never log plaintext passwords

---

## Integration with Other Skills

```
API & Database Specification (defines auth endpoints)
  ↓
AUTH & AUTHORIZATION (this skill) ← Security design
  ↓
Backend Service Design (implements middleware)
  ↓
Data Modeling & Migrations (User model with password_hash)
  ↓
Test Design (tests auth flows)
```

---

## Output Format

When using this skill, generate:

**1. Auth Specification** (specs/auth/jwt.md)
**2. JWT Middleware** (app/core/deps.py with get_current_user)
**3. Auth Router** (app/api/auth.py with register/login/refresh)
**4. Frontend Auth Client** (lib/auth.ts with Better Auth)
**5. Login/Register Pages** (app/login/page.tsx)
**6. Auth Tests** (tests/api/test_auth.py)

---

## References

- **Better Auth**: https://www.better-auth.com/
- **JWT**: https://jwt.io/
- **FastAPI Security**: https://fastapi.tiangolo.com/tutorial/security/
- **Passlib**: https://passlib.readthedocs.io/

---

**Document Version**: 1.0.0
**Created**: 2025-12-24
**Total Examples**: 6 (JWT middleware, auth router, Better Auth client, login page, multi-tenant patterns)
**Coverage**: Phases II-V (Authentication across all web/API phases)

---

*This authentication & authorization skill is part of the Evolution of Todo hackathon project demonstrating Spec-Driven Development and AI-Native software engineering practices.*
