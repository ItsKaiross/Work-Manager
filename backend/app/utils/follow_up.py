from datetime import datetime

# Days an application can sit in a status before it's flagged as needing a
# follow-up. Terminal statuses (rejected/withdrawn) are omitted - they never
# need one.
STALE_AFTER_DAYS = {
    "saved": 5,
    "applied": 7,
    "interviewing": 3,
    "offer": 2,
}


def compute_follow_up(status: str | None, updated_at: datetime | None) -> dict:
    """Flag applications that haven't moved in a while for their current status."""
    threshold = STALE_AFTER_DAYS.get(status)
    if not threshold or not updated_at:
        return {"needs_follow_up": False, "days_since_update": None}

    days_since_update = (datetime.now() - updated_at).days
    return {
        "needs_follow_up": days_since_update >= threshold,
        "days_since_update": days_since_update,
    }
