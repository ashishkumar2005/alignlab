import csv
from io import StringIO

from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from ..database import get_db
from ..deps import require_admin
from ..models import Comparison, RubricRating, TextLabel, User


router = APIRouter(prefix="/api/export", tags=["export"])


def _csv_response(filename: str, headers: list[str], rows: list[list]) -> StreamingResponse:
    buffer = StringIO()
    writer = csv.writer(buffer)
    writer.writerow(headers)
    writer.writerows(rows)
    buffer.seek(0)
    return StreamingResponse(
        iter([buffer.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )


@router.get("/compare")
def export_comparisons(db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    rows = db.query(Comparison).join(User).order_by(Comparison.created_at.desc()).all()
    return _csv_response(
        "alignlab_comparisons.csv",
        ["id", "annotator", "prompt", "response_a", "response_b", "preferred", "skipped", "created_at"],
        [
            [
                row.id,
                row.annotator.username,
                row.prompt,
                row.response_a,
                row.response_b,
                row.preferred,
                row.skipped,
                row.created_at.isoformat(),
            ]
            for row in rows
        ],
    )


@router.get("/rubric")
def export_rubric(db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    rows = db.query(RubricRating).join(User).order_by(RubricRating.created_at.desc()).all()
    return _csv_response(
        "alignlab_rubric_ratings.csv",
        [
            "id",
            "annotator",
            "prompt",
            "response",
            "helpfulness",
            "accuracy",
            "safety",
            "clarity",
            "conciseness",
            "overall_score",
            "comment",
            "created_at",
        ],
        [
            [
                row.id,
                row.annotator.username,
                row.prompt,
                row.response,
                row.helpfulness,
                row.accuracy,
                row.safety,
                row.clarity,
                row.conciseness,
                row.overall_score,
                row.comment,
                row.created_at.isoformat(),
            ]
            for row in rows
        ],
    )


@router.get("/labels")
def export_labels(db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    rows = db.query(TextLabel).join(User).order_by(TextLabel.created_at.desc()).all()
    return _csv_response(
        "alignlab_text_labels.csv",
        ["id", "annotator", "text_sample", "label", "highlighted_spans", "created_at"],
        [
            [
                row.id,
                row.annotator.username,
                row.text_sample,
                row.label,
                row.highlighted_spans,
                row.created_at.isoformat(),
            ]
            for row in rows
        ],
    )
