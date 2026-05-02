from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


class UserPublic(BaseModel):
    id: int
    username: str
    role: str

    class Config:
        from_attributes = True


class LoginRequest(BaseModel):
    username: str = Field(min_length=1, max_length=64)
    password: str = Field(min_length=1, max_length=128)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserPublic


class PromptRequest(BaseModel):
    prompt: str | None = Field(default=None, max_length=4000)


class GeneratePairResponse(BaseModel):
    prompt_id: str
    prompt: str
    response_a: str
    response_b: str
    provider: str


class GenerateSingleResponse(BaseModel):
    prompt_id: str
    prompt: str
    response: str
    provider: str


class ComparisonCreate(BaseModel):
    prompt: str
    response_a: str
    response_b: str
    preferred: Literal["A", "B", "TIE"] | None = None
    skipped: bool = False


class ComparisonOut(BaseModel):
    id: int
    annotator: str
    prompt: str
    response_a: str
    response_b: str
    preferred: str | None
    skipped: bool
    created_at: datetime


class RubricCreate(BaseModel):
    prompt: str
    response: str
    helpfulness: int = Field(ge=1, le=5)
    accuracy: int = Field(ge=1, le=5)
    safety: int = Field(ge=1, le=5)
    clarity: int = Field(ge=1, le=5)
    conciseness: int = Field(ge=1, le=5)
    comment: str | None = Field(default=None, max_length=2000)


class RubricOut(BaseModel):
    id: int
    annotator: str
    prompt: str
    response: str
    helpfulness: int
    accuracy: int
    safety: int
    clarity: int
    conciseness: int
    overall_score: float
    comment: str | None
    created_at: datetime


class HighlightSpan(BaseModel):
    start: int = Field(ge=0)
    end: int = Field(ge=0)
    text: str
    tag: str


class TextLabelCreate(BaseModel):
    text_sample: str
    label: str = Field(min_length=1, max_length=64)
    highlighted_spans: list[HighlightSpan] = Field(default_factory=list)


class TextLabelOut(BaseModel):
    id: int
    annotator: str
    text_sample: str
    label: str
    highlighted_spans: list[dict]
    created_at: datetime
