from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from ..database import get_db
from ..deps import get_current_user
from ..models import Comparison, RubricRating, TextLabel, User
from ..sample_data import TEXT_SAMPLES, random_text_sample
from ..schemas import ComparisonCreate, RubricCreate, TextLabelCreate


router = APIRouter(prefix="/api/feedback", tags=["feedback"])


def _comparison_payload(row: Comparison) -> dict:
    return {
        "id": row.id,
        "annotator": row.annotator.username,
        "prompt": row.prompt,
        "response_a": row.response_a,
        "response_b": row.response_b,
        "preferred": row.preferred,
        "skipped": row.skipped,
        "created_at": row.created_at,
    }


def _rubric_payload(row: RubricRating) -> dict:
    return {
        "id": row.id,
        "annotator": row.annotator.username,
        "prompt": row.prompt,
        "response": row.response,
        "helpfulness": row.helpfulness,
        "accuracy": row.accuracy,
        "safety": row.safety,
        "clarity": row.clarity,
        "conciseness": row.conciseness,
        "overall_score": row.overall_score,
        "comment": row.comment,
        "created_at": row.created_at,
    }


@router.post("/compare")
def save_comparison(
    payload: ComparisonCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not payload.skipped and payload.preferred is None:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="preferred is required unless skipped is true",
        )

    comparison = Comparison(
        annotator_id=current_user.id,
        prompt=payload.prompt,
        response_a=payload.response_a,
        response_b=payload.response_b,
        preferred=payload.preferred,
        skipped=payload.skipped,
    )
    db.add(comparison)
    db.commit()
    db.refresh(comparison)
    return _comparison_payload(comparison)


@router.get("/compare")
def list_comparisons(
    preferred: str | None = Query(default=None),
    skipped: bool | None = Query(default=None),
    limit: int = Query(default=100, ge=1, le=500),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Comparison).join(User)
    if preferred:
        query = query.filter(Comparison.preferred == preferred.upper())
    if skipped is not None:
        query = query.filter(Comparison.skipped == skipped)
    rows = query.order_by(Comparison.created_at.desc()).limit(limit).all()
    return [_comparison_payload(row) for row in rows]


@router.post("/rubric")
def save_rubric_rating(
    payload: RubricCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    overall_score = round(
        (
            payload.helpfulness * 0.25
            + payload.accuracy * 0.25
            + payload.safety * 0.2
            + payload.clarity * 0.15
            + payload.conciseness * 0.15
        ),
        2,
    )
    rating = RubricRating(
        annotator_id=current_user.id,
        prompt=payload.prompt,
        response=payload.response,
        helpfulness=payload.helpfulness,
        accuracy=payload.accuracy,
        safety=payload.safety,
        clarity=payload.clarity,
        conciseness=payload.conciseness,
        overall_score=overall_score,
        comment=payload.comment,
    )
    db.add(rating)
    db.commit()
    db.refresh(rating)
    return _rubric_payload(rating)


@router.get("/rubric/stats")
def rubric_stats(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    row = (
        db.query(
            func.avg(RubricRating.helpfulness),
            func.avg(RubricRating.accuracy),
            func.avg(RubricRating.safety),
            func.avg(RubricRating.clarity),
            func.avg(RubricRating.conciseness),
        )
        .first()
    )
    keys = ["helpfulness", "accuracy", "safety", "clarity", "conciseness"]
    return {key: round(float(value or 0), 2) for key, value in zip(keys, row)}


@router.get("/label/samples")
def list_text_samples(current_user: User = Depends(get_current_user)):
    return {"samples": TEXT_SAMPLES}


@router.get("/label/random")
def get_random_text_sample(current_user: User = Depends(get_current_user)):
    return {"text_sample": random_text_sample()}


@router.post("/label")
def save_text_label(
    payload: TextLabelCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    label = TextLabel(
        annotator_id=current_user.id,
        text_sample=payload.text_sample,
        label=payload.label,
        highlighted_spans=[span.model_dump() for span in payload.highlighted_spans],
    )
    db.add(label)
    db.commit()
    db.refresh(label)
    return {
        "id": label.id,
        "annotator": label.annotator.username,
        "text_sample": label.text_sample,
        "label": label.label,
        "highlighted_spans": label.highlighted_spans,
        "created_at": label.created_at,
    }


@router.get("/label/distribution")
def label_distribution(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    rows = db.query(TextLabel.label, func.count(TextLabel.id)).group_by(TextLabel.label).all()
    return [{"label": label, "count": count} for label, count in rows]
