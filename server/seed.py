from datetime import datetime, timedelta
import random

from app.database import Base, SessionLocal, engine
from app.models import Comparison, RubricRating, TextLabel, User
from app.sample_data import PROMPTS, TEXT_SAMPLES, mock_response, mock_single_response
from app.security import get_password_hash


USERS = [
    {"username": "admin", "password": "admin123", "role": "admin"},
    {"username": "annotator", "password": "annotator123", "role": "annotator"},
]

LABELS = ["Helpful", "Needs Improvement", "Harmful", "Off-Topic", "Repetitive", "Excellent"]


def seed_users(db):
    created = []
    for user in USERS:
        existing = db.query(User).filter(User.username == user["username"]).first()
        if existing:
            created.append(existing)
            continue
        row = User(
            username=user["username"],
            password_hash=get_password_hash(user["password"]),
            role=user["role"],
        )
        db.add(row)
        db.flush()
        created.append(row)
    return created


def seed_annotations(db, users):
    existing_total = (
        db.query(Comparison).count()
        + db.query(RubricRating).count()
        + db.query(TextLabel).count()
    )
    if existing_total:
        return

    now = datetime.utcnow()
    for index in range(8):
        prompt = PROMPTS[index % len(PROMPTS)]
        created_at = now - timedelta(days=random.randint(0, 9), hours=random.randint(0, 12))
        db.add(
            Comparison(
                annotator_id=random.choice(users).id,
                prompt=prompt,
                response_a=mock_response(prompt, "balanced"),
                response_b=mock_response(prompt, "creative"),
                preferred=random.choice(["A", "B", "TIE"]),
                skipped=False,
                created_at=created_at,
            )
        )

    for index in range(6):
        prompt = PROMPTS[(index + 2) % len(PROMPTS)]
        scores = {
            "helpfulness": random.randint(3, 5),
            "accuracy": random.randint(3, 5),
            "safety": random.randint(3, 5),
            "clarity": random.randint(3, 5),
            "conciseness": random.randint(2, 5),
        }
        overall = round(
            scores["helpfulness"] * 0.25
            + scores["accuracy"] * 0.25
            + scores["safety"] * 0.2
            + scores["clarity"] * 0.15
            + scores["conciseness"] * 0.15,
            2,
        )
        db.add(
            RubricRating(
                annotator_id=random.choice(users).id,
                prompt=prompt,
                response=mock_single_response(prompt),
                overall_score=overall,
                comment=random.choice(["Clear and useful.", "Needs a stronger caveat.", "Good structure."]),
                created_at=now - timedelta(days=random.randint(0, 9), hours=random.randint(0, 12)),
                **scores,
            )
        )

    for index in range(6):
        sample = TEXT_SAMPLES[index % len(TEXT_SAMPLES)]
        highlighted = []
        if index % 2 == 0:
            highlighted.append(
                {
                    "start": 0,
                    "end": min(40, len(sample)),
                    "text": sample[: min(40, len(sample))],
                    "tag": "review",
                }
            )
        db.add(
            TextLabel(
                annotator_id=random.choice(users).id,
                text_sample=sample,
                label=random.choice(LABELS),
                highlighted_spans=highlighted,
                created_at=now - timedelta(days=random.randint(0, 9), hours=random.randint(0, 12)),
            )
        )


def main():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        users = seed_users(db)
        seed_annotations(db, users)
        db.commit()
        print("Seeded AlignLab database.")
        print("Admin login: admin / admin123")
        print("Annotator login: annotator / annotator123")
    finally:
        db.close()


if __name__ == "__main__":
    main()
