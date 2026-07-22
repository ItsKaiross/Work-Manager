from fastapi import FastAPI
from app.routers import auth

app = FastAPI(title="Work Manager API")
app.include_router(auth.router)

@app.get("/")
async def root():
    return {"status": "ok"}