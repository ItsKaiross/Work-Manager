"""Router tests for the cover-letter endpoints.

These mock the CRUD/AI-integration layer (no real DB, no network calls),
per the design doc's own test strategy. Prompt-injection resistance and
hallucination-avoidance are prompt-quality properties of the real model and
aren't meaningfully testable with mocks - that's a documented gap here, not
something faked with a trivial assertion.
"""

from datetime import datetime
from unittest.mock import AsyncMock

from app.crud.cover_letter import compute_source_fingerprint
from app.routers import job_applications

APP_ID = 42
LETTER_ID = 7
OTHER_USER_APP = None  # a get_application_by_id mock returning None simulates "not mine / doesn't exist"


def _fake_application(**overrides):
    base = {
        "id": APP_ID,
        "user_id": 1,
        "position": "Senior Backend Engineer",
        "company": "Example Co",
        "location": "Remote",
        "description": "We are looking for a backend engineer with 5+ years of Python experience "
        "to join our platform team and own our core services.",
    }
    base.update(overrides)
    return base


def _fake_resume(**overrides):
    base = {
        "id": 9,
        "user_id": 1,
        "upload_date": "2026-01-01 00:00:00",
        "skills": ["python", "fastapi"],
        "experience_years": 6,
        "parsed_data": {"raw_text": "Experienced backend engineer. Built services in Python and FastAPI."},
    }
    base.update(overrides)
    return base


def _fake_generated(**overrides):
    base = {
        "content": "Dear Hiring Team, ... (a grounded draft) ...",
        "supporting_points": [
            {"claim": "Built backend services in Python", "resume_evidence": "Built services in Python and FastAPI"}
        ],
        "warnings": [],
    }
    base.update(overrides)
    return base


def _fake_letter_row(**overrides):
    base = {
        "id": LETTER_ID,
        "application_id": APP_ID,
        "resume_id": 9,
        "content": "Dear Hiring Team, ... (a grounded draft) ...",
        "supporting_points": [
            {"claim": "Built backend services in Python", "resume_evidence": "Built services in Python and FastAPI"}
        ],
        "warnings": [],
        "tone": "professional",
        "emphasis": None,
        "recipient_name": None,
        "status": "draft",
        "model": "llama-3.3-70b-versatile",
        "prompt_version": "cover-letter-v1",
        "created_at": datetime(2026, 1, 1),
        "updated_at": datetime(2026, 1, 1),
    }
    base.update(overrides)
    return base


def test_generate_success(client, monkeypatch):
    monkeypatch.setattr(job_applications.crud, "get_application_by_id", AsyncMock(return_value=_fake_application()))
    monkeypatch.setattr(job_applications.resume_crud, "get_active_resume", AsyncMock(return_value=_fake_resume()))
    monkeypatch.setattr(job_applications, "ai_generate_cover_letter", AsyncMock(return_value=_fake_generated()))
    monkeypatch.setattr(
        job_applications.cover_letter_crud, "create_cover_letter", AsyncMock(return_value=_fake_letter_row())
    )

    res = client.post(f"/applications/{APP_ID}/cover-letters", json={"tone": "professional"})

    assert res.status_code == 201
    body = res.json()
    assert body["id"] == LETTER_ID
    assert body["content"].startswith("Dear Hiring Team")
    assert body["supporting_points"][0]["claim"]


def test_generate_application_not_found(client, monkeypatch):
    monkeypatch.setattr(job_applications.crud, "get_application_by_id", AsyncMock(return_value=None))

    res = client.post(f"/applications/{APP_ID}/cover-letters", json={"tone": "professional"})

    assert res.status_code == 404


def test_generate_no_active_resume(client, monkeypatch):
    monkeypatch.setattr(job_applications.crud, "get_application_by_id", AsyncMock(return_value=_fake_application()))
    monkeypatch.setattr(job_applications.resume_crud, "get_active_resume", AsyncMock(return_value=None))

    res = client.post(f"/applications/{APP_ID}/cover-letters", json={"tone": "professional"})

    assert res.status_code == 409
    assert "resume" in res.json()["detail"].lower()


def test_generate_resume_missing_raw_text(client, monkeypatch):
    monkeypatch.setattr(job_applications.crud, "get_application_by_id", AsyncMock(return_value=_fake_application()))
    monkeypatch.setattr(
        job_applications.resume_crud,
        "get_active_resume",
        AsyncMock(return_value=_fake_resume(parsed_data={"raw_text": ""})),
    )

    res = client.post(f"/applications/{APP_ID}/cover-letters", json={"tone": "professional"})

    assert res.status_code == 409


def test_generate_description_too_short(client, monkeypatch):
    monkeypatch.setattr(
        job_applications.crud,
        "get_application_by_id",
        AsyncMock(return_value=_fake_application(description="Backend role.")),
    )
    monkeypatch.setattr(job_applications.resume_crud, "get_active_resume", AsyncMock(return_value=_fake_resume()))

    res = client.post(f"/applications/{APP_ID}/cover-letters", json={"tone": "professional"})

    assert res.status_code == 409
    assert "description" in res.json()["detail"].lower()


def test_generate_ai_unavailable_returns_503(client, monkeypatch):
    monkeypatch.setattr(job_applications.crud, "get_application_by_id", AsyncMock(return_value=_fake_application()))
    monkeypatch.setattr(job_applications.resume_crud, "get_active_resume", AsyncMock(return_value=_fake_resume()))
    monkeypatch.setattr(job_applications, "ai_generate_cover_letter", AsyncMock(return_value=None))

    res = client.post(f"/applications/{APP_ID}/cover-letters", json={"tone": "professional"})

    assert res.status_code == 503


def test_generate_ai_raises_returns_503(client, monkeypatch):
    monkeypatch.setattr(job_applications.crud, "get_application_by_id", AsyncMock(return_value=_fake_application()))
    monkeypatch.setattr(job_applications.resume_crud, "get_active_resume", AsyncMock(return_value=_fake_resume()))
    monkeypatch.setattr(job_applications, "ai_generate_cover_letter", AsyncMock(side_effect=RuntimeError("boom")))

    res = client.post(f"/applications/{APP_ID}/cover-letters", json={"tone": "professional"})

    assert res.status_code == 503


def test_list_cover_letters_application_not_found(client, monkeypatch):
    monkeypatch.setattr(job_applications.crud, "get_application_by_id", AsyncMock(return_value=None))

    res = client.get(f"/applications/{APP_ID}/cover-letters")

    assert res.status_code == 404


def test_list_cover_letters_success(client, monkeypatch):
    monkeypatch.setattr(job_applications.crud, "get_application_by_id", AsyncMock(return_value=_fake_application()))
    monkeypatch.setattr(
        job_applications.cover_letter_crud,
        "get_cover_letters_for_application",
        AsyncMock(return_value=[_fake_letter_row()]),
    )

    res = client.get(f"/applications/{APP_ID}/cover-letters")

    assert res.status_code == 200
    assert res.json()[0]["id"] == LETTER_ID


def test_get_cover_letter_not_found(client, monkeypatch):
    monkeypatch.setattr(job_applications.cover_letter_crud, "get_cover_letter_by_id", AsyncMock(return_value=None))

    res = client.get(f"/applications/{APP_ID}/cover-letters/{LETTER_ID}")

    assert res.status_code == 404


def test_update_cover_letter_saves_edit(client, monkeypatch):
    edited = "Dear Hiring Team, this is my edited version."
    monkeypatch.setattr(
        job_applications.cover_letter_crud,
        "update_cover_letter_content",
        AsyncMock(return_value=_fake_letter_row(content=edited)),
    )

    res = client.put(f"/applications/{APP_ID}/cover-letters/{LETTER_ID}", json={"content": edited})

    assert res.status_code == 200
    assert res.json()["content"] == edited


def test_update_cover_letter_not_found(client, monkeypatch):
    monkeypatch.setattr(job_applications.cover_letter_crud, "update_cover_letter_content", AsyncMock(return_value=None))

    res = client.put(f"/applications/{APP_ID}/cover-letters/{LETTER_ID}", json={"content": "x"})

    assert res.status_code == 404


def test_delete_cover_letter_not_found(client, monkeypatch):
    monkeypatch.setattr(job_applications.cover_letter_crud, "delete_cover_letter", AsyncMock(return_value=False))

    res = client.delete(f"/applications/{APP_ID}/cover-letters/{LETTER_ID}")

    assert res.status_code == 404


def test_delete_cover_letter_success(client, monkeypatch):
    monkeypatch.setattr(job_applications.cover_letter_crud, "delete_cover_letter", AsyncMock(return_value=True))

    res = client.delete(f"/applications/{APP_ID}/cover-letters/{LETTER_ID}")

    assert res.status_code == 200
    assert res.json() == {"ok": True}


def test_fingerprint_stable_for_same_inputs():
    kwargs = dict(
        position="Backend Engineer",
        company="Example Co",
        description="We need a backend engineer.",
        resume_id=9,
        resume_upload_date="2026-01-01 00:00:00",
        tone="professional",
        emphasis=None,
        recipient_name=None,
    )
    assert compute_source_fingerprint(**kwargs) == compute_source_fingerprint(**kwargs)


def test_fingerprint_changes_with_description():
    kwargs = dict(
        position="Backend Engineer",
        company="Example Co",
        description="We need a backend engineer.",
        resume_id=9,
        resume_upload_date="2026-01-01 00:00:00",
        tone="professional",
        emphasis=None,
        recipient_name=None,
    )
    changed = compute_source_fingerprint(**{**kwargs, "description": "We need a senior backend engineer."})
    assert compute_source_fingerprint(**kwargs) != changed


def test_fingerprint_changes_with_resume_id():
    kwargs = dict(
        position="Backend Engineer",
        company="Example Co",
        description="We need a backend engineer.",
        resume_id=9,
        resume_upload_date="2026-01-01 00:00:00",
        tone="professional",
        emphasis=None,
        recipient_name=None,
    )
    changed = compute_source_fingerprint(**{**kwargs, "resume_id": 10})
    assert compute_source_fingerprint(**kwargs) != changed
