from unittest.mock import AsyncMock

from app.routers import profile


EMPTY_LINKS = {
    "resume_url": None,
    "portfolio_url": None,
    "github_url": None,
    "linkedin_url": None,
}


def test_get_professional_links(client, monkeypatch):
    saved = {**EMPTY_LINKS, "github_url": "https://github.com/example"}
    monkeypatch.setattr(profile.profile_crud, "get_professional_links", AsyncMock(return_value=saved))

    res = client.get("/api/profile/links")

    assert res.status_code == 200
    assert res.json() == saved


def test_update_professional_links(client, monkeypatch):
    saved = {**EMPTY_LINKS, "portfolio_url": "https://example.com"}
    update_mock = AsyncMock(return_value=saved)
    monkeypatch.setattr(profile.profile_crud, "update_professional_links", update_mock)

    res = client.put("/api/profile/links", json=saved)

    assert res.status_code == 200
    assert update_mock.await_args.args[1] == 1
    assert res.json() == saved


def test_update_rejects_non_http_url(client):
    res = client.put("/api/profile/links", json={**EMPTY_LINKS, "github_url": "javascript:alert(1)"})
    assert res.status_code == 422


def test_update_rejects_url_without_hostname(client):
    res = client.put("/api/profile/links", json={**EMPTY_LINKS, "resume_url": "https:///resume.pdf"})
    assert res.status_code == 422
