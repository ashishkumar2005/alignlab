from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, Float, ForeignKey, Integer, JSON, String, Text
from sqlalchemy.orm import relationship

from .database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(64), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(32), nullable=False, default="annotator")
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    comparisons = relationship("Comparison", back_populates="annotator")
    rubric_ratings = relationship("RubricRating", back_populates="annotator")
    text_labels = relationship("TextLabel", back_populates="annotator")


class Comparison(Base):
    __tablename__ = "comparisons"

    id = Column(Integer, primary_key=True, index=True)
    annotator_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    prompt = Column(Text, nullable=False)
    response_a = Column(Text, nullable=False)
    response_b = Column(Text, nullable=False)
    preferred = Column(String(10), nullable=True)
    skipped = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)

    annotator = relationship("User", back_populates="comparisons")


class RubricRating(Base):
    __tablename__ = "rubric_ratings"

    id = Column(Integer, primary_key=True, index=True)
    annotator_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    prompt = Column(Text, nullable=False)
    response = Column(Text, nullable=False)
    helpfulness = Column(Integer, nullable=False)
    accuracy = Column(Integer, nullable=False)
    safety = Column(Integer, nullable=False)
    clarity = Column(Integer, nullable=False)
    conciseness = Column(Integer, nullable=False)
    overall_score = Column(Float, nullable=False)
    comment = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)

    annotator = relationship("User", back_populates="rubric_ratings")


class TextLabel(Base):
    __tablename__ = "text_labels"

    id = Column(Integer, primary_key=True, index=True)
    annotator_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    text_sample = Column(Text, nullable=False)
    label = Column(String(64), nullable=False, index=True)
    highlighted_spans = Column(JSON, default=list, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)

    annotator = relationship("User", back_populates="text_labels")
