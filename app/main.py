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
    get_user_by_id,
    verify_password,
    save_feedback,
    get_all_users,
    get_recent_feedback,
    save_user_interests,
    get_user_interests,
    generate_otp,
    create_email_verification,
    verify_email_otp,
    can_resend_otp,
)

from app.services.email_service import send_verification_email


# ---------------------------------------------------------
# Request models
# ---------------------------------------------------------

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
    version="1.0.0",
)


# ---------------------------------------------------------
# Secure user session middleware
# ---------------------------------------------------------

SESSION_SECRET = os.getenv(
    "CLIMACARE_SESSION_SECRET",
    "climacare-development-secret-change-before-deployment",
)

app.add_middleware(
    SessionMiddleware,
    secret_key=SESSION_SECRET,
    same_site="lax",
    https_only=False,
)


# ---------------------------------------------------------
# Static files
# ---------------------------------------------------------

app.mount(
    "/static",
    StaticFiles(directory=str(STATIC_DIR)),
    name="static",
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


# =========================================================
# USER REGISTRATION
# =========================================================

@app.get(
    "/register",
    response_class=HTMLResponse,
)
def register_page(request: Request):

    return templates.TemplateResponse(
        request=request,
        name="register.html",
        context={
            "error": None,
        },
    )


@app.post(
    "/register",
    response_class=HTMLResponse,
)
def register_user(
    request: Request,
    name: str = Form(...),
    email: str = Form(...),
    password: str = Form(...),
    confirm_password: str = Form(...),
):

    name = name.strip()
    email = email.strip().lower()

    # -----------------------------------------------------
    # Basic registration validation
    # -----------------------------------------------------

    if not name:
        return templates.TemplateResponse(
            request=request,
            name="register.html",
            context={
                "error": "Please enter your name.",
            },
            status_code=400,
        )

    if "@" not in email or "." not in email:
        return templates.TemplateResponse(
            request=request,
            name="register.html",
            context={
                "error": "Please enter a valid email address.",
            },
            status_code=400,
        )

    if password != confirm_password:
        return templates.TemplateResponse(
            request=request,
            name="register.html",
            context={
                "error": "Passwords do not match.",
            },
            status_code=400,
        )

    if len(password) < 8:
        return templates.TemplateResponse(
            request=request,
            name="register.html",
            context={
                "error": (
                    "Password must contain at least "
                    "8 characters."
                ),
            },
            status_code=400,
        )

    # -----------------------------------------------------
    # Prevent duplicate accounts
    # -----------------------------------------------------

    existing_user = get_user_by_email(email)

    if existing_user:
        return templates.TemplateResponse(
            request=request,
            name="register.html",
            context={
                "error": (
                    "An account with this email "
                    "already exists."
                ),
            },
            status_code=400,
        )

    # -----------------------------------------------------
    # Create user
    # -----------------------------------------------------

    user_id = create_user(
        name=name,
        email=email,
        password=password,
        role="user",
    )

    # -----------------------------------------------------
    # Create email verification OTP
    # -----------------------------------------------------

    otp = generate_otp()

    create_email_verification(
        user_id=user_id,
        otp=otp,
        expiry_minutes=10,
    )

    # Store the pending user before attempting email.
    request.session[
        "pending_verification_user_id"
    ] = user_id

    # -----------------------------------------------------
    # Send verification email
    # -----------------------------------------------------

    try:
        send_verification_email(
            recipient_email=email,
            recipient_name=name,
            otp=otp,
        )

    except Exception:
        return templates.TemplateResponse(
            request=request,
            name="register.html",
            context={
                "error": (
                    "Your account was created, but "
                    "the verification email could not "
                    "be sent. Please try resending "
                    "the verification code."
                ),
            },
            status_code=500,
        )

    return RedirectResponse(
        url="/verify-email",
        status_code=303,
    )


# =========================================================
# EMAIL VERIFICATION PAGE
# =========================================================

@app.get(
    "/verify-email",
    response_class=HTMLResponse,
)
def verify_email_page(request: Request):

    user_id = request.session.get(
        "pending_verification_user_id"
    )

    if not user_id:
        return RedirectResponse(
            url="/register",
            status_code=303,
        )

    user = get_user_by_id(user_id)

    if not user:
        request.session.pop(
            "pending_verification_user_id",
            None,
        )

        return RedirectResponse(
            url="/register",
            status_code=303,
        )

    if user["email_verified"]:
        return RedirectResponse(
            url="/interests",
            status_code=303,
        )

    return templates.TemplateResponse(
        request=request,
        name="verify_email.html",
        context={
            "email": user["email"],
            "error": None,
            "message": None,
        },
    )


# =========================================================
# VERIFY EMAIL OTP
# =========================================================

@app.post(
    "/verify-email",
    response_class=HTMLResponse,
)
def verify_email(
    request: Request,
    otp: str = Form(...),
):

    user_id = request.session.get(
        "pending_verification_user_id"
    )

    if not user_id:
        return RedirectResponse(
            url="/register",
            status_code=303,
        )

    user = get_user_by_id(user_id)

    if not user:
        request.session.pop(
            "pending_verification_user_id",
            None,
        )

        return RedirectResponse(
            url="/register",
            status_code=303,
        )

    otp = otp.strip()

    # -----------------------------------------------------
    # OTP format validation
    # -----------------------------------------------------

    if len(otp) != 6 or not otp.isdigit():
        return templates.TemplateResponse(
            request=request,
            name="verify_email.html",
            context={
                "email": user["email"],
                "error": (
                    "Please enter the complete "
                    "6-digit verification code."
                ),
                "message": None,
            },
            status_code=400,
        )

    # -----------------------------------------------------
    # Verify OTP
    # -----------------------------------------------------

    success, status = verify_email_otp(
        user_id=user_id,
        otp=otp,
    )

    if success:
        return RedirectResponse(
            url="/interests",
            status_code=303,
        )

    error_messages = {
        "invalid": (
            "Incorrect verification code. "
            "Please try again."
        ),
        "expired": (
            "This verification code has expired. "
            "Please request a new code."
        ),
        "too_many_attempts": (
            "Too many incorrect attempts. "
            "Please request a new code."
        ),
        "not_found": (
            "No active verification code was found. "
            "Please request a new code."
        ),
    }

    return templates.TemplateResponse(
        request=request,
        name="verify_email.html",
        context={
            "email": user["email"],
            "error": error_messages.get(
                status,
                "Verification failed.",
            ),
            "message": None,
        },
        status_code=400,
    )


# =========================================================
# RESEND EMAIL VERIFICATION OTP
# =========================================================

@app.post(
    "/resend-otp",
    response_class=HTMLResponse,
)
def resend_otp(request: Request):

    user_id = request.session.get(
        "pending_verification_user_id"
    )

    if not user_id:
        return RedirectResponse(
            url="/register",
            status_code=303,
        )

    user = get_user_by_id(user_id)

    if not user:
        request.session.pop(
            "pending_verification_user_id",
            None,
        )

        return RedirectResponse(
            url="/register",
            status_code=303,
        )

    if user["email_verified"]:
        return RedirectResponse(
            url="/interests",
            status_code=303,
        )

    # -----------------------------------------------------
    # Prevent excessive OTP resend requests
    # -----------------------------------------------------

    if not can_resend_otp(
        user_id,
        cooldown_seconds=60,
    ):
        return templates.TemplateResponse(
            request=request,
            name="verify_email.html",
            context={
                "email": user["email"],
                "error": (
                    "Please wait 60 seconds before "
                    "requesting another code."
                ),
                "message": None,
            },
            status_code=429,
        )

    otp = generate_otp()

    create_email_verification(
        user_id=user_id,
        otp=otp,
        expiry_minutes=10,
    )

    try:
        send_verification_email(
            recipient_email=user["email"],
            recipient_name=user["name"],
            otp=otp,
        )

    except Exception:
        return templates.TemplateResponse(
            request=request,
            name="verify_email.html",
            context={
                "email": user["email"],
                "error": (
                    "The verification email could "
                    "not be sent. Please try again."
                ),
                "message": None,
            },
            status_code=500,
        )

    return templates.TemplateResponse(
        request=request,
        name="verify_email.html",
        context={
            "email": user["email"],
            "error": None,
            "message": (
                "A new verification code has "
                "been sent."
            ),
        },
    )


# =========================================================
# USER INTEREST ONBOARDING
# =========================================================

@app.get(
    "/interests",
    response_class=HTMLResponse,
)
def interests_page(request: Request):

    # -----------------------------------------------------
    # During registration:
    # pending_verification_user_id is used.
    #
    # For an already logged-in user:
    # user_id is used.
    # -----------------------------------------------------

    pending_user_id = request.session.get(
        "pending_verification_user_id"
    )

    logged_in_user_id = request.session.get(
        "user_id"
    )

    user_id = pending_user_id or logged_in_user_id

    if not user_id:
        return RedirectResponse(
            url="/login",
            status_code=303,
        )

    user = get_user_by_id(user_id)

    if not user:
        return RedirectResponse(
            url="/login",
            status_code=303,
        )

    # Registration onboarding requires verification.
    if pending_user_id and not user["email_verified"]:
        return RedirectResponse(
            url="/verify-email",
            status_code=303,
        )

    selected_interests = get_user_interests(
        user_id
    )

    return templates.TemplateResponse(
        request=request,
        name="interests.html",
        context={
            "user_name": user["name"],
            "selected_interests": selected_interests,
            "error": None,
        },
    )


@app.post(
    "/interests",
    response_class=HTMLResponse,
)
async def save_interests_route(request: Request):

    pending_user_id = request.session.get(
        "pending_verification_user_id"
    )

    logged_in_user_id = request.session.get(
        "user_id"
    )

    user_id = pending_user_id or logged_in_user_id

    if not user_id:
        return RedirectResponse(
            url="/login",
            status_code=303,
        )

    user = get_user_by_id(user_id)

    if not user:
        return RedirectResponse(
            url="/login",
            status_code=303,
        )

    if pending_user_id and not user["email_verified"]:
        return RedirectResponse(
            url="/verify-email",
            status_code=303,
        )

    # -----------------------------------------------------
    # Read checkbox selections
    # -----------------------------------------------------

    form = await request.form()

    interests = form.getlist(
        "interests"
    )

    if not interests:
        return templates.TemplateResponse(
            request=request,
            name="interests.html",
            context={
                "user_name": user["name"],
                "selected_interests": [],
                "error": (
                    "Please select at least "
                    "one interest."
                ),
            },
            status_code=400,
        )

    saved_interests = save_user_interests(
        user_id=user_id,
        interests=interests,
    )

    if not saved_interests:
        return templates.TemplateResponse(
            request=request,
            name="interests.html",
            context={
                "user_name": user["name"],
                "selected_interests": [],
                "error": (
                    "Please select at least "
                    "one valid interest."
                ),
            },
            status_code=400,
        )

    # -----------------------------------------------------
    # Registration onboarding completed
    # -----------------------------------------------------

    if pending_user_id:
        request.session.pop(
            "pending_verification_user_id",
            None,
        )

        return RedirectResponse(
            url="/login?verified=1",
            status_code=303,
        )

    # Existing logged-in user updating interests.
    request.session[
        "user_interests"
    ] = saved_interests

    return RedirectResponse(
        url="/",
        status_code=303,
    )


# =========================================================
# USER LOGIN PAGE
# =========================================================

@app.get(
    "/login",
    response_class=HTMLResponse,
)
def login_page(
    request: Request,
    registered: int | None = None,
    verified: int | None = None,
):

    return templates.TemplateResponse(
        request=request,
        name="login.html",
        context={
            "error": None,
            "registered": registered,
            "verified": verified,
        },
    )


# =========================================================
# USER LOGIN AUTHENTICATION
# =========================================================

@app.post(
    "/login",
    response_class=HTMLResponse,
)
def login_user(
    request: Request,
    email: str = Form(...),
    password: str = Form(...),
):

    email = email.strip().lower()

    user = get_user_by_email(email)

    # -----------------------------------------------------
    # Validate account
    # -----------------------------------------------------

    if not user:
        return templates.TemplateResponse(
            request=request,
            name="login.html",
            context={
                "error": "Invalid email or password.",
                "registered": None,
                "verified": None,
            },
            status_code=400,
        )

    if not verify_password(
        password,
        user["password_hash"],
    ):
        return templates.TemplateResponse(
            request=request,
            name="login.html",
            context={
                "error": "Invalid email or password.",
                "registered": None,
                "verified": None,
            },
            status_code=400,
        )

    # -----------------------------------------------------
    # Block login until email verification is completed
    # -----------------------------------------------------

    if not user["email_verified"]:

        request.session[
            "pending_verification_user_id"
        ] = user["id"]

        # Create another OTP only when resend cooldown allows.
        if can_resend_otp(
            user["id"],
            cooldown_seconds=60,
        ):

            otp = generate_otp()

            create_email_verification(
                user_id=user["id"],
                otp=otp,
                expiry_minutes=10,
            )

            try:
                send_verification_email(
                    recipient_email=user["email"],
                    recipient_name=user["name"],
                    otp=otp,
                )

            except Exception:
                # The verification page can still allow
                # the user to request another OTP.
                pass

        return RedirectResponse(
            url="/verify-email",
            status_code=303,
        )

    # -----------------------------------------------------
    # Successful login
    # -----------------------------------------------------

    request.session["user_id"] = user["id"]
    request.session["user_name"] = user["name"]
    request.session["user_email"] = user["email"]
    request.session["user_role"] = user["role"]

    request.session[
        "user_interests"
    ] = get_user_interests(
        user["id"]
    )

    return RedirectResponse(
        url="/",
        status_code=303,
    )


# =========================================================
# USER LOGOUT
# =========================================================

@app.get("/logout")
async def logout(request: Request):

    request.session.clear()

    return RedirectResponse(
        url="/login",
        status_code=303,
    )


# =========================================================
# ADMIN DASHBOARD
# =========================================================

@app.get(
    "/admin",
    response_class=HTMLResponse,
)
def admin_dashboard(request: Request):

    if not request.session.get("user_id"):
        return RedirectResponse(
            url="/login",
            status_code=303,
        )

    if request.session.get("user_role") != "admin":
        raise HTTPException(
            status_code=403,
            detail="Admin access required.",
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
            "total_feedback": len(feedback),
        },
    )


# =========================================================
# HEALTH CHECK API
# =========================================================

@app.get("/api/health")
def health_check():

    return {
        "status": "healthy",
        "application": "ClimaCare UAE AI",
        "location": "Dubai, UAE",
        "ai_engine": "ready",
    }


# =========================================================
# USER FEEDBACK API
# =========================================================

@app.post("/api/feedback")
def submit_feedback(
    request: Request,
    rating: int = Form(...),
    comment: str = Form(""),
):

    user_id = request.session.get(
        "user_id"
    )

    if not user_id:
        raise HTTPException(
            status_code=401,
            detail=(
                "Please sign in to submit feedback."
            ),
        )

    if rating < 1 or rating > 5:
        raise HTTPException(
            status_code=400,
            detail=(
                "Rating must be between 1 and 5."
            ),
        )

    save_feedback(
        user_id=user_id,
        rating=rating,
        comment=comment.strip(),
    )

    return {
        "success": True,
        "message": "Thank you for your feedback.",
    }


# =========================================================
# MAIN APPLICATION DASHBOARD
# =========================================================

@app.get(
    "/",
    response_class=HTMLResponse,
)
def home(request: Request):

    if not request.session.get("user_id"):
        return RedirectResponse(
            url="/login",
            status_code=303,
        )

    return templates.TemplateResponse(
        request=request,
        name="index.html",
        context={
            "project_name": "ClimaCare UAE AI",
            "location": "Dubai, UAE",
            "user_name": request.session.get(
                "user_name"
            ),
            "user_email": request.session.get(
                "user_email"
            ),
            "user_role": request.session.get(
                "user_role"
            ),
        },
    )


# =========================================================
# HEALTH GUIDANCE PAGE
# =========================================================

@app.get(
    "/health",
    response_class=HTMLResponse,
)
def health_page(request: Request):

    return templates.TemplateResponse(
        request=request,
        name="health.html",
        context={
            "project_name": "ClimaCare UAE AI",
            "location": "Dubai, UAE",
        },
    )


# =========================================================
# AI FORECAST PAGE
# =========================================================

@app.get(
    "/forecast",
    response_class=HTMLResponse,
)
def forecast_page(request: Request):

    return templates.TemplateResponse(
        request=request,
        name="forecast.html",
        context={
            "project_name": "ClimaCare UAE AI",
            "location": "Dubai, UAE",
        },
    )


# =========================================================
# TRENDS PAGE
# =========================================================

@app.get(
    "/trends",
    response_class=HTMLResponse,
)
def trends_page(request: Request):

    return templates.TemplateResponse(
        request=request,
        name="trends.html",
        context={
            "project_name": "ClimaCare UAE AI",
            "location": "Dubai, UAE",
        },
    )


# =========================================================
# AI INSIGHTS PAGE
# =========================================================

@app.get(
    "/insights",
    response_class=HTMLResponse,
)
def insights_page(request: Request):

    return templates.TemplateResponse(
        request=request,
        name="insights.html",
        context={
            "project_name": "ClimaCare UAE AI",
            "location": "Dubai, UAE",
        },
    )


# =========================================================
# AI EXPLORE PAGE
# =========================================================

@app.get(
    "/explore",
    response_class=HTMLResponse,
)
async def explore_page(request: Request):

    return templates.TemplateResponse(
        request=request,
        name="explore.html",
        context={
            "project_name": "ClimaCare UAE AI",
            "location": "Dubai, UAE",
        },
    )


# =========================================================
# AI MODEL STATUS API
# =========================================================

@app.get("/api/model/status")
def model_status():

    return get_model_status()


# =========================================================
# CURRENT ENVIRONMENT API
# =========================================================

@app.get("/api/environment/current")
def current_environment():

    return get_current_environment()


# =========================================================
# AQI FORECAST API
# =========================================================

@app.get("/api/forecast")
def forecast():

    return generate_aqi_forecast()


# =========================================================
# AI EXPLORE ASSISTANT API
# =========================================================

@app.post("/api/explore/assistant")
def explore_ai_assistant(
    payload: ExploreChatRequest,
    request: Request,
):

    # -----------------------------------------------------
    # Require authentication
    # -----------------------------------------------------

    if not request.session.get("user_id"):
        raise HTTPException(
            status_code=401,
            detail="Please sign in to use the AI assistant.",
        )

    message = payload.message.strip()

    if not message:
        raise HTTPException(
            status_code=400,
            detail="Please enter a question.",
        )

    try:

        # -------------------------------------------------
        # Gather live environmental information
        # -------------------------------------------------

        current_environment_data = get_current_environment()

        forecast_data = generate_aqi_forecast()

        user_id = request.session.get("user_id")

        user_interests = (
            get_user_interests(user_id)
            if user_id
            else []
        )

        # -------------------------------------------------
        # Build ClimaCare context for generative AI
        # -------------------------------------------------

        environmental_context = f"""
CURRENT CLIMACARE ENVIRONMENT DATA:
{current_environment_data}

CLIMACARE NEXT-DAY MACHINE-LEARNING FORECAST:
{forecast_data}

USER INTERESTS:
{user_interests}

PERSONALIZATION INSTRUCTION:
When relevant, tailor the answer to the user's saved interests.

Use current environmental conditions when the user's question
relates to current conditions, health guidance, travel or
outdoor activities.

Use the next-day machine-learning forecast when the user's
question relates to tomorrow or future activity planning.

Do not force the forecast into answers when it is not relevant.

Do not recommend something merely because it matches an interest.
Environmental suitability should also be considered.

FORECAST SCOPE:
The next-day AQI prediction is produced by the
ClimaCare Dubai pilot model.
"""

        # -------------------------------------------------
        # Ask the generative OpenRouter AI
        # -------------------------------------------------

        answer = ask_climacare_ai(
            user_message=message,
            environmental_context=environmental_context,
        )

        return {
            "success": True,
            "answer": answer,
        }

    except Exception as exc:

        # Technical information stays in the terminal.
        print(
            "ClimaCare AI provider error:",
            repr(exc),
        )

        # Never expose OpenRouter/provider errors to users.
        return {
            "success": False,
            "answer": (
                "ClimaCare AI is temporarily unavailable. "
                "Please try again shortly."
            ),
        }


# =========================================================
# TRENDS DATA API
# =========================================================

@app.get("/api/trends")
def trends_data():

    import pandas as pd

    data_path = (
        BASE_DIR.parent
        / "data"
        / "processed"
        / "climacare_clean.csv"
    )

    if not data_path.exists():
        raise HTTPException(
            status_code=500,
            detail="ClimaCare trends dataset not found.",
        )

    df = pd.read_csv(
        data_path
    )

    df["date"] = pd.to_datetime(
        df["date"]
    )

    df = df.sort_values(
        "date"
    )

    recent = df.tail(
        30
    ).copy()

    recent["date"] = recent[
        "date"
    ].dt.strftime(
        "%Y-%m-%d"
    )

    return {
        "location": "Dubai, UAE",
        "period_days": len(recent),
        "dates": recent[
            "date"
        ].tolist(),
        "aqi": recent[
            "us_aqi"
        ].round(1).tolist(),
        "pm2_5": recent[
            "pm2_5"
        ].round(1).tolist(),
        "pm10": recent[
            "pm10"
        ].round(1).tolist(),
    }