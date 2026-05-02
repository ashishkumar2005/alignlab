from fastapi import APIRouter, Depends

from ..claude import generate_pair, generate_single
from ..deps import get_current_user
from ..models import User
from ..sample_data import PROMPTS, random_prompt
from ..schemas import GeneratePairResponse, GenerateSingleResponse, PromptRequest


router = APIRouter(prefix="/api", tags=["generation"])


@router.get("/prompts")
def list_prompts(current_user: User = Depends(get_current_user)):
    return {"prompts": PROMPTS}


@router.get("/prompts/random")
def get_random_prompt(current_user: User = Depends(get_current_user)):
    return {"prompt": random_prompt()}


@router.post("/generate", response_model=GeneratePairResponse)
def generate_comparison(payload: PromptRequest, current_user: User = Depends(get_current_user)):
    return generate_pair(payload.prompt)


@router.post("/generate-single", response_model=GenerateSingleResponse)
def generate_rubric_response(payload: PromptRequest, current_user: User = Depends(get_current_user)):
    return generate_single(payload.prompt)
