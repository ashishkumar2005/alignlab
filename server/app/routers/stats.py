from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from ..database import get_db
from ..deps import get_current_user, require_admin
from ..models import Comparison, RubricRating, TextLabel, User


router = APIRouter(prefix="/api/stats", tags=["stats"])


def _day_bounds(day: datetime) -> tuple[datetime, datetime]:
    start = datetime(day.year, day.month, day.day)
    return start, start + timedelta(days=1)


def _count_between(db: Session, model, start: datetime, end: datetime) -> int:
    return db.query(func.count(model.id)).filter(model.created_at >= start, model.created_at < end).scalar() or 0


@router.get("/overview")
def overview(db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    today_start, today_end = _day_bounds(datetime.utcnow())
    active_ids = set()
    for model in (Comparison, RubricRating, TextLabel):
        rows = (
            db.query(model.annotator_id)
            .filter(model.created_at >= today_start, model.created_at < today_end)
            .distinct()
            .all()
        )
        active_ids.update(row[0] for row in rows)

    return {
        "total_comparisons": db.query(func.count(Comparison.id)).scalar() or 0,
        "total_rubric_ratings": db.query(func.count(RubricRating.id)).scalar() or 0,
        "total_labels": db.query(func.count(TextLabel.id)).scalar() or 0,
        "active_annotators_today": len(active_ids),
    }


@router.get("/me/today")
def my_today_stats(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    today_start, today_end = _day_bounds(datetime.utcnow())
    return {
        "comparisons": (
            db.query(func.count(Comparison.id))
            .filter(
                Comparison.annotator_id == current_user.id,
                Comparison.created_at >= today_start,
                Comparison.created_at < today_end,
            )
            .scalar()
            or 0
        ),
        "ratings": (
            db.query(func.count(RubricRating.id))
            .filter(
                RubricRating.annotator_id == current_user.id,
                RubricRating.created_at >= today_start,
                RubricRating.created_at < today_end,
            )
            .scalar()
            or 0
        ),
        "labels": (
            db.query(func.count(TextLabel.id))
            .filter(
                TextLabel.annotator_id == current_user.id,
                TextLabel.created_at >= today_start,
                TextLabel.created_at < today_end,
            )
            .scalar()
            or 0
        ),
    }


@router.get("/daily")
def daily_activity(db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    today = datetime.utcnow()
    days = []
    for offset in range(29, -1, -1):
        day = today - timedelta(days=offset)
        start, end = _day_bounds(day)
        comparisons = _count_between(db, Comparison, start, end)
        ratings = _count_between(db, RubricRating, start, end)
        labels = _count_between(db, TextLabel, start, end)
        days.append(
            {
                "date": start.date().isoformat(),
                "comparisons": comparisons,
                "ratings": ratings,
                "labels": labels,
                "total": comparisons + ratings + labels,
            }
        )
    return days


@router.get("/compare-wins")
def comparison_wins(db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    today = datetime.utcnow()
    rows = []
    for offset in range(6, -1, -1):
        day = today - timedelta(days=offset)
        start, end = _day_bounds(day)
        base = db.query(Comparison).filter(
            Comparison.created_at >= start,
            Comparison.created_at < end,
            Comparison.skipped.is_(False),
        )
        a_count = base.filter(Comparison.preferred == "A").count()
        b_count = base.filter(Comparison.preferred == "B").count()
        tie_count = base.filter(Comparison.preferred == "TIE").count()
        total = a_count + b_count + tie_count
        rows.append(
            {
                "date": start.strftime("%a"),
                "A": round((a_count / total) * 100, 1) if total else 0,
                "B": round((b_count / total) * 100, 1) if total else 0,
                "Tie": round((tie_count / total) * 100, 1) if total else 0,
            }
        )
    return rows


@router.get("/leaderboard")
def leaderboard(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    today = datetime.utcnow()
    week_start = today - timedelta(days=today.weekday())
    week_start = datetime(week_start.year, week_start.month, week_start.day)
    users = db.query(User).order_by(User.username).all()
    entries = []
    for user in users:
        comparisons = (
            db.query(func.count(Comparison.id))
            .filter(Comparison.annotator_id == user.id, Comparison.created_at >= week_start)
            .scalar()
            or 0
        )
        ratings = (
            db.query(func.count(RubricRating.id))
            .filter(RubricRating.annotator_id == user.id, RubricRating.created_at >= week_start)
            .scalar()
            or 0
        )
        labels = (
            db.query(func.count(TextLabel.id))
            .filter(TextLabel.annotator_id == user.id, TextLabel.created_at >= week_start)
            .scalar()
            or 0
        )
        entries.append(
            {
                "username": user.username,
                "comparisons": comparisons,
                "ratings": ratings,
                "labels": labels,
                "total_score": comparisons + ratings + labels,
            }
        )

    ranked = sorted(entries, key=lambda item: item["total_score"], reverse=True)
    return [{"rank": index + 1, **entry} for index, entry in enumerate(ranked)]


@router.get("/recent")
def recent_activity(
    task_type: str | None = Query(default=None),
    limit: int = Query(default=20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    activities = []

    if task_type in (None, "comparison"):
        for row in db.query(Comparison).join(User).order_by(Comparison.created_at.desc()).limit(limit).all():
            result = "Skipped" if row.skipped else (row.preferred or "Unknown")
            activities.append(
                {
                    "annotator": row.annotator.username,
                    "task_type": "comparison",
                    "prompt_preview": row.prompt[:120],
                    "result": result,
                    "time": row.created_at,
                }
            )

    if task_type in (None, "rubric"):
        for row in db.query(RubricRating).join(User).order_by(RubricRating.created_at.desc()).limit(limit).all():
            activities.append(
                {
                    "annotator": row.annotator.username,
                    "task_type": "rubric",
                    "prompt_preview": row.prompt[:120],
                    "result": f"{row.overall_score:.2f}",
                    "time": row.created_at,
                }
            )

    if task_type in (None, "label"):
        for row in db.query(TextLabel).join(User).order_by(TextLabel.created_at.desc()).limit(limit).all():
            activities.append(
                {
                    "annotator": row.annotator.username,
                    "task_type": "label",
                    "prompt_preview": row.text_sample[:120],
                    "result": row.label,
                    "time": row.created_at,
                }
            )

    return sorted(activities, key=lambda item: item["time"], reverse=True)[:limit]
