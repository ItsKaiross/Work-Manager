import os

# app.config.Settings has several required fields loaded from .env.local via
# pydantic-settings. Environment variables take precedence over the env file,
# so setting placeholders here (only if not already set) makes the test suite
# importable/runnable without a real .env.local or database - these tests
# never touch a live DB or the Groq API, everything is mocked at the
# CRUD/AI-integration boundary.
os.environ.setdefault("MYSQL_HOST", "localhost")
os.environ.setdefault("MYSQL_PORT", "3306")
os.environ.setdefault("MYSQL_USER", "test")
os.environ.setdefault("MYSQL_PASSWORD", "test")
os.environ.setdefault("MYSQL_DATABASE", "test")
os.environ.setdefault("JWT_SECRET", "test-secret")
os.environ.setdefault("GOOGLE_CLIENT_ID", "test-client-id")
os.environ.setdefault("GOOGLE_CLIENT_SECRET", "test-client-secret")
os.environ.setdefault("GOOGLE_REDIRECT_URI", "http://localhost/callback")
os.environ.setdefault("FRONTEND_URL", "http://localhost:3000")

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.database import get_db
from app.core.deps import get_current_user

FAKE_USER = {"id": 1, "email": "test@example.com", "is_admin": False, "is_active": True}


@pytest.fixture
def client():
    # Deliberately NOT using `with TestClient(app) as c:` - that triggers the
    # app's lifespan (seed_admin_user/run_migrations), which would try to
    # open a real DB pool. Plain instantiation skips lifespan and is enough
    # for these router tests, since get_db is overridden and every
    # DB-touching call is mocked at the CRUD/AI layer per test.
    app.dependency_overrides[get_db] = lambda: object()
    app.dependency_overrides[get_current_user] = lambda: FAKE_USER
    test_client = TestClient(app)
    yield test_client
    app.dependency_overrides.clear()
