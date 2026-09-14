# ---------------------------------------------------------
# ClimaCare UAE AI
# Main Application Entry Point
# ---------------------------------------------------------

from pathlib import Path
import os

from fastapi import FastAPI, Request, Form, HTTPException
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from starlette.middleware.sessions import SessionMiddleware
from pydantic import BaseModel
from app.services.chatbot_service import ask_climacare_ai
from app.services.model_service import get_model_status
from app.services.environment_service import get_current_environment
from app.services.forecast_service import generate_aqi_forecast

from app.auth import (
    create_tables,
    create_user,
    get_user_by_email,
    verify_password,
    save_feedback,
    get_all_users,
    get_recent_feedback
)
class ExploreChatRequest(BaseModel):
    message: str


# ---------------------------------------------------------
# Application paths
# ---------------------------------------------------------

BASE_DIR = Path(__file__).resolve().parent

TEMPLATES_DIR = BASE_DIR / "templates"
STATIC_DIR = BASE_DIR / "static"

# ---------------------------------------------------------
# Create ClimaCare FastAPI application
# ---------------------------------------------------------

app = FastAPI(
    title="ClimaCare UAE AI",
    description=(
        "AI-driven climate, air-quality and "
        "environmental health intelligence for the UAE."
    ),
    version="1.0.0"
)

# ---------------------------------------------------------
# Secure user session middleware
# ---------------------------------------------------------

SESSION_SECRET = os.getenv(
    "CLIMACARE_SESSION_SECRET",
    "climacare-development-secret-change-before-deployment"
)

app.add_middleware(
    SessionMiddleware,
    secret_key=SESSION_SECRET,
    same_site="lax",
    https_only=False
)

app.mount(
    "/static",
    StaticFiles(directory=str(STATIC_DIR)),
    name="static"
)


# ---------------------------------------------------------
# HTML templates
# ---------------------------------------------------------

templates = Jinja2Templates(
    directory=str(TEMPLATES_DIR)
)

# ---------------------------------------------------------
# Initialise authentication database
# ---------------------------------------------------------

create_tables()

# ---------------------------------------------------------
# User registration
# ---------------------------------------------------------

@app.get(
    "/register",
    response_class=HTMLResponse
)
def register_page(request: Request):

    return templates.TemplateResponse(
        request=request,
        name="register.html",
        context={
            "error": None
        }
    )


@app.post("/register")
def register_user(
    request: Request,
    name: str = Form(...),
    email: str = Form(...),
    password: str = Form(...),
    confirm_password: str = Form(...)
):

    name = name.strip()
    email = email.strip().lower()

    if not name:
        return templates.TemplateResponse(
            request=request,
            name="register.html",
            context={
                "error": "Please enter your name."
            },
            status_code=400
        )

    if password != confirm_password:
        return templates.TemplateResponse(
            request=request,
            name="register.html",
            context={
                "error": "Passwords do not match."
            },
            status_code=400
        )

    if len(password) < 8:
        return templates.TemplateResponse(
            request=request,
            name="register.html",
            context={
                "error": "Password must contain at least 8 characters."
            },
            status_code=400
        )

    existing_user = get_user_by_email(email)

    if existing_user:
        return templates.TemplateResponse(
            request=request,
            name="register.html",
            context={
                "error": "An account with this email already exists."
            },
            status_code=400
        )

    create_user(
        name=name,
        email=email,
        password=password,
        role="user"
    )

    return RedirectResponse(
        url="/login?registered=1",
        status_code=303
    )


# ---------------------------------------------------------
# User login page
# ---------------------------------------------------------

@app.get(
    "/login",
    response_class=HTMLResponse
)
def login_page(
    request: Request,
    registered: int | None = None
):

    return templates.TemplateResponse(
        request=request,
        name="login.html",
        context={
            "error": None,
            "registered": registered
        }
    )

# ---------------------------------------------------------
# User login authentication
# ---------------------------------------------------------

@app.post("/login")
def login_user(
    request: Request,
    email: str = Form(...),
    password: str = Form(...)
):

    email = email.strip().lower()

    user = get_user_by_email(email)

    if not user:
        return templates.TemplateResponse(
            request=request,
            name="login.html",
            context={
                "error": "Invalid email or password.",
                "registered": None
            },
            status_code=400
        )

    if not verify_password(
        password,
        user["password_hash"]
    ):
        return templates.TemplateResponse(
            request=request,
            name="login.html",
            context={
                "error": "Invalid email or password.",
                "registered": None
            },
            status_code=400
        )

    request.session["user_id"] = user["id"]
    request.session["user_name"] = user["name"]
    request.session["user_email"] = user["email"]
    request.session["user_role"] = user["role"]

    return RedirectResponse(
        url="/",
        status_code=303
    )

# ---------------------------------------------------------
# User logout
# ---------------------------------------------------------

@app.get("/logout")
async def logout(request: Request):
    request.session.clear()

    return RedirectResponse(
        url="/login",
        status_code=303
    )

# ---------------------------------------------------------
# Admin dashboard
# ---------------------------------------------------------

@app.get(
    "/admin",
    response_class=HTMLResponse
)
def admin_dashboard(request: Request):

    if not request.session.get("user_id"):
        return RedirectResponse(
            url="/login",
            status_code=303
        )

    if request.session.get("user_role") != "admin":
        raise HTTPException(
            status_code=403,
            detail="Admin access required."
        )

    users = get_all_users()
    feedback = get_recent_feedback()

    return templates.TemplateResponse(
        request=request,
        name="admin.html",
        context={
            "users": users,
            "feedback": feedback,
            "total_users": len(users),
            "total_feedback": len(feedback)
        }
    )

# ---------------------------------------------------------
# Health-check endpoint
# ---------------------------------------------------------

@app.get("/api/health")
def health_check():

    return {
        "status": "healthy",
        "application": "ClimaCare UAE AI",
        "location": "Dubai, UAE",
        "ai_engine": "ready"
    }

# ---------------------------------------------------------
# User feedback endpoint
# ---------------------------------------------------------

@app.post("/api/feedback")
def submit_feedback(
    request: Request,
    rating: int = Form(...),
    comment: str = Form("")
):

    user_id = request.session.get("user_id")

    if not user_id:
        raise HTTPException(
            status_code=401,
            detail="Please sign in to submit feedback."
        )

    if rating < 1 or rating > 5:
        raise HTTPException(
            status_code=400,
            detail="Rating must be between 1 and 5."
        )

    save_feedback(
        user_id=user_id,
        rating=rating,
        comment=comment.strip()
    )

    return {
        "success": True,
        "message": "Thank you for your feedback."
    }

# ---------------------------------------------------------
# Main application page
# ---------------------------------------------------------

@app.get(
    "/",
    response_class=HTMLResponse
)
def home(request: Request):

    if not request.session.get("user_id"):
        return RedirectResponse(
            url="/login",
            status_code=303
        )

    return templates.TemplateResponse(
        request=request,
        name="index.html",
        context={
            "project_name": "ClimaCare UAE AI",
            "location": "Dubai, UAE",
            "user_name": request.session.get("user_name"),
            "user_email": request.session.get("user_email"),
            "user_role": request.session.get("user_role")
        }
    )
# =========================================================
# Health guidance page
# =========================================================

@app.get(
    "/health",
    response_class=HTMLResponse
)
def health_page(request: Request):

    return templates.TemplateResponse(
        request=request,
        name="health.html",
        context={
            "project_name": "ClimaCare UAE AI",
            "location": "Dubai, UAE"
        }
    )
# ---------------------------------------------------------
# Detailed AI forecast page
# ---------------------------------------------------------

@app.get(
    "/forecast",
    response_class=HTMLResponse
)
def forecast_page(request: Request):

    return templates.TemplateResponse(
        request=request,
        name="forecast.html",
        context={
            "project_name": "ClimaCare UAE AI",
            "location": "Dubai, UAE"
        }
    )
# -------------------------------------------------------
# Trends page
# -------------------------------------------------------

@app.get(
    "/trends",
    response_class=HTMLResponse
)
def trends_page(request: Request):

    return templates.TemplateResponse(
        request=request,
        name="trends.html",
        context={
            "project_name": "ClimaCare UAE AI",
            "location": "Dubai, UAE"
        }
    )
# ---------------------------------------------------------
# AI model status endpoint
# ---------------------------------------------------------

@app.get("/api/model/status")
def model_status():

    return get_model_status()
# ---------------------------------------------------------
# Current Dubai environmental data
# ---------------------------------------------------------

@app.get("/api/environment/current")
def current_environment():

    return get_current_environment()
# ---------------------------------------------------------
# ClimaCare AI forecast endpoint
# ---------------------------------------------------------

@app.get("/api/forecast")
def forecast():

    return generate_aqi_forecast()


@app.post("/api/explore/assistant")
def explore_ai_assistant(
    payload: ExploreChatRequest,
    request: Request
):
    if not request.session.get("user_id"):
        raise HTTPException(
            status_code=401,
            detail="Please sign in to use the AI assistant."
        )

    message = payload.message.strip()

    if not message:
        raise HTTPException(
            status_code=400,
            detail="Please enter a question."
        )

    try:
        current_environment = get_current_environment()
        forecast = generate_aqi_forecast()

        environmental_context = f"""
CURRENT CLIMACARE ENVIRONMENT DATA:
{current_environment}

CLIMACARE NEXT-DAY MACHINE-LEARNING FORECAST:
{forecast}

FORECAST SCOPE:
The next-day AQI prediction is produced by the ClimaCare Dubai pilot model.
"""

        answer = ask_climacare_ai(
            user_message=message,
            environmental_context=environmental_context
        )

        return {
            "success": True,
            "answer": answer
        }

    except Exception as exc:
        raise HTTPException(
            status_code=502,
            detail=f"AI assistant temporarily unavailable: {str(exc)}"
        )

# -------------------------------------------------------
# Trends data endpoint
# -------------------------------------------------------

@app.get("/api/trends")
def trends_data():
    import pandas as pd

    data_path = BASE_DIR.parent / "data" / "processed" / "climacare_clean.csv"

    df = pd.read_csv(data_path)

    df["date"] = pd.to_datetime(df["date"])

    df = df.sort_values("date")

    recent = df.tail(30).copy()

    recent["date"] = recent["date"].dt.strftime("%Y-%m-%d")

    return {
        "location": "Dubai, UAE",
        "period_days": len(recent),
        "dates": recent["date"].tolist(),
        "aqi": recent["us_aqi"].round(1).tolist(),
        "pm2_5": recent["pm2_5"].round(1).tolist(),
        "pm10": recent["pm10"].round(1).tolist()
    }
# ---------------------------------------------------------
# AI Insights page
# ---------------------------------------------------------

@app.get(
    "/insights",
    response_class=HTMLResponse
)
def insights_page(request: Request):

    return templates.TemplateResponse(
        request=request,
        name="insights.html",
        context={
            "project_name": "ClimaCare UAE AI",
            "location": "Dubai, UAE"
        }
    )
@app.get("/explore", response_class=HTMLResponse)
async def explore_page(request: Request):
    return templates.TemplateResponse(
        request=request,
        name="explore.html"
    )