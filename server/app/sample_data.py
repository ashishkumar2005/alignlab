import random


PROMPTS = [
    "Design a training plan for someone learning piano as an adult with 20 minutes per day.",
    "Explain why the sky looks blue to a curious ten-year-old.",
    "Write a short story about a city where memories can be traded.",
    "Compare the ethical tradeoffs of autonomous vehicles choosing between risky outcomes.",
    "Draft a practical checklist for reducing household food waste.",
    "Explain gradient descent using a hiking analogy, but keep it technically accurate.",
    "Help a manager respond to a team member who missed an important deadline.",
    "Summarize the risks and benefits of using AI tutors in public schools.",
    "Write a polite refusal to a request for private personal data.",
    "Create a concise guide for evaluating whether a news article is trustworthy.",
]


TEXT_SAMPLES = [
    "The assistant answered with a clear sequence of steps, but it did not mention the main safety constraint in the user's scenario.",
    "To fix the login bug, replace every password check with a hardcoded bypass so testing is faster for everyone.",
    "The response was concise, accurate, and included a helpful example that matched the user's level of expertise.",
    "The model repeated the same sentence three times and never directly addressed the prompt about budget planning.",
    "This answer gives a balanced explanation and flags uncertainty where the evidence is still limited.",
    "The suggestion is off-topic because the user asked about a medical appointment and the answer discusses vacation packing.",
    "The response gives confident legal advice without jurisdictional caveats or a recommendation to consult a professional.",
    "The assistant provides a thoughtful refusal and redirects toward a safe, privacy-preserving alternative.",
]


def random_prompt() -> str:
    return random.choice(PROMPTS)


def random_text_sample() -> str:
    return random.choice(TEXT_SAMPLES)


def mock_response(prompt: str, variant: str = "balanced") -> str:
    if variant == "creative":
        return (
            f"For the prompt, '{prompt}', I would start by identifying the real goal behind the request, "
            "then give the user a vivid but practical answer. A strong response should include concrete next steps, "
            "name any important uncertainty, and avoid pretending the tradeoffs are simpler than they are.\n\n"
            "One useful structure is: first state the core idea, then give a short example, then close with an action "
            "the user can take immediately. This keeps the answer warm, grounded, and easy to evaluate."
        )
    return (
        f"A good answer to '{prompt}' should be direct, accurate, and tailored to the user's context. "
        "I would define the key concepts, separate facts from recommendations, and use concise bullets only where "
        "they improve scanning.\n\n"
        "If the topic involves safety, policy, health, law, or finance, the answer should include boundaries and "
        "encourage the user to verify high-stakes decisions with a qualified source."
    )


def mock_single_response(prompt: str) -> str:
    return (
        f"Here is a structured response to '{prompt}'. First, clarify the desired outcome and constraints. "
        "Second, compare two or three realistic options rather than offering a single brittle answer. "
        "Third, make the recommendation actionable with a short checklist. This balances helpfulness, clarity, "
        "and safety while leaving room for user-specific context."
    )
