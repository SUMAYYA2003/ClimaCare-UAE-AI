import os

from dotenv import load_dotenv
from openai import OpenAI


load_dotenv()

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")

client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=OPENROUTER_API_KEY,
)


SYSTEM_PROMPT = """
You are the conversational AI assistant for ClimaCare UAE AI.

ClimaCare UAE AI is a climate-health decision support platform.

Your job is to:
- explain environmental conditions in simple language
- use the environmental values supplied by the ClimaCare backend
- use the ClimaCare machine-learning forecast when it is supplied
- provide practical, concise UAE travel and outdoor guidance
- avoid alarming or exaggerated medical language
- never invent environmental measurements
- never claim that you personally measured the environment
- clearly distinguish current observations from predicted values
- keep answers concise and useful

Important:
The machine-learning AQI forecast currently represents the ClimaCare Dubai pilot model.
Do not describe it as a verified forecast for every UAE emirate unless the backend
explicitly provides location-specific model data.

If information needed to answer a question is not supplied, say that the information
is not currently available instead of inventing it.
"""


def ask_climacare_ai(
    user_message: str,
    environmental_context: str = ""
) -> str:

    if not OPENROUTER_API_KEY:
        raise RuntimeError(
            "OPENROUTER_API_KEY is missing from the .env file."
        )

    user_prompt = f"""
ClimaCare environmental context:

{environmental_context}

User question:

{user_message}

Respond using only the supplied ClimaCare environmental context for numerical
environmental claims. You may use general knowledge for explanations and practical
guidance, but do not invent AQI, temperature, pollution, weather, or forecast values.
"""

    response = client.chat.completions.create(
        model="openrouter/free",
        messages=[
            {
                "role": "system",
                "content": SYSTEM_PROMPT
            },
            {
                "role": "user",
                "content": user_prompt
            }
        ],
        temperature=0.3,
        max_tokens=350
    )
   

    answer = response.choices[0].message.content

    if not answer:
        return "I could not generate a response at the moment. Please try again."

    return answer.strip()