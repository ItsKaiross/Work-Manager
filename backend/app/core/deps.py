from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
from app.database import get_db
from app.core.jwt import decode_token
from app.crud.user import get_user_by_id

bearer_scheme = HTTPBearer()

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    conn = Depends(get_db),
) -> dict:
    try:
        payload = decode_token(credentials.credentials)
        user_id = int(payload["sub"])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except (jwt.InvalidTokenError, KeyError, ValueError):
        raise HTTPException(status_code=401, detail="Invalid token")

    user = await get_user_by_id(conn, user_id)
    if not user or not user["is_active"]:
        raise HTTPException(status_code=401, detail="User not found")
    return user

async def get_current_admin(
    current_user: dict = Depends(get_current_user),
) -> dict:
    if not current_user.get("is_admin"):
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user