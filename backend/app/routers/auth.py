from fastapi import Request
from fastapi.responses import RedirectResponse
from sqlalchemy import select
from app.core.oauth import oauth
from app.core.jwt import create_access_token, create_refresh_token
from app.models.user import User
from app.config import settings

@router.get("/google/login")
async def google_login(request: Request):
    redirect_uri = settings.google_redirect_uri
    return await oauth.google.authorize_redirect(request, redirect_uri)

@router.get("/google/callback")
async def google_callback(request: Request, db: AsyncSession = Depends(get_db)):
    token = await oauth.google.authorize_access_token(request)
    user_info = token.get("userinfo")
    if not user_info or not user_info.get("email"):
        raise HTTPException(status_code=400, detail="Google auth failed")

    email = user_info["email"]
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()

    if not user:
        user = User(email=email, hashed_password=None, auth_provider="google")
        db.add(user)
        await db.commit()
        await db.refresh(user)

    access = create_access_token(user.id)
    refresh = create_refresh_token(user.id)

    # Redirect back to frontend with tokens in the URL fragment (not query string,
    # so they don't get logged by servers/proxies)
    return RedirectResponse(
        f"{settings.frontend_url}/oauth-callback#access_token={access}&refresh_token={refresh}"
    )