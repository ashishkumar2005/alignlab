from uuid import uuid4

from .config import get_settings
from .sample_data import mock_response, mock_single_response, random_prompt

try:
    from anthropic import Anthropic
except ImportError:  # pragma: no cover - handled at runtime when optional SDK is absent
    Anthropic = None


settings = get_settings()


def _client():
    if not settings.anthropic_api_key or Anthropic is None:
        return None
    return Anthropic(api_key=settings.anthropic_api_key)


def _text_from_message(message) -> str:
    parts = []
    for block in message.content:
        text = getattr(block, "text", None)
        if text:
            parts.append(text)
    return "\n".join(parts).strip()


def _call_claude(prompt: str, system: str, temperature: float) -> str:
    client = _client()
    if client is None:
        raise RuntimeError("Claude API is not configured")

    message = client.messages.create(
        model=settings.claude_model,
        max_tokens=900,
        temperature=temperature,
        system=system,
        messages=[{"role": "user", "content": prompt}],
    )
    return _text_from_message(message)


def generate_pair(prompt: str | None) -> dict:
    resolved_prompt = prompt.strip() if prompt and prompt.strip() else random_prompt()
    prompt_id = str(uuid4())

    try:
        response_a = _call_claude(
            resolved_prompt,
            "You are a careful assistant. Prioritize correctness, brevity, and calibrated uncertainty.",
            0.2,
        )
        response_b = _call_claude(
            resolved_prompt,
            "You are a creative assistant. Prioritize nuance, vivid examples, and empathetic framing.",
            0.85,
        )
        provider = "claude"
    except Exception:
        response_a = mock_response(resolved_prompt, "balanced")
        response_b = mock_response(resolved_prompt, "creative")
        provider = "mock"

    return {
        "prompt_id": prompt_id,
        "prompt": resolved_prompt,
        "response_a": response_a,
        "response_b": response_b,
        "provider": provider,
    }


def generate_single(prompt: str | None) -> dict:
    resolved_prompt = prompt.strip() if prompt and prompt.strip() else random_prompt()
    prompt_id = str(uuid4())

    try:
        response = _call_claude(
            resolved_prompt,
            "You are an assistant whose output will be evaluated by human raters. Be helpful, accurate, safe, clear, and concise.",
            0.45,
        )
        provider = "claude"
    except Exception:
        response = mock_single_response(resolved_prompt)
        provider = "mock"

    return {
        "prompt_id": prompt_id,
        "prompt": resolved_prompt,
        "response": response,
        "provider": provider,
    }
