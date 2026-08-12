from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, extract, resume
from starlette.middleware.sessions import SessionMiddleware
from app.config import settings
from app.routers import job_applications

app = FastAPI(title="Work Manager API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(job_applications.router)
app.include_router(extract.router)
app.include_router(resume.router)
app.add_middleware(SessionMiddleware, secret_key=settings.jwt_secret)

@app.get("/")
async def root():
    return {"status": "ok"}


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "https://work-manager-five-phi.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8001, reload=True)