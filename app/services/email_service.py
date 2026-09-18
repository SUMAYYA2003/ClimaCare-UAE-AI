import os

import resend
from dotenv import load_dotenv


load_dotenv()


RESEND_API_KEY = os.getenv(
    "RESEND_API_KEY"
)


def send_verification_email(
    recipient_email: str,
    recipient_name: str,
    otp: str
):
    """
    Send the ClimaCare email-verification OTP
    using the Resend HTTPS API.
    """

    if not RESEND_API_KEY:
        raise RuntimeError(
            "RESEND_API_KEY is missing."
        )

    resend.api_key = RESEND_API_KEY

    subject = (
        "Verify your ClimaCare UAE AI account"
    )

    text_content = f"""
Hello {recipient_name},

Welcome to ClimaCare UAE AI.

Your email verification code is:

{otp}

This code will expire in 10 minutes.

If you did not create a ClimaCare account,
you can ignore this email.

ClimaCare UAE AI
Climate-Health Intelligence Platform
    """.strip()

    html_content = f"""
    <!DOCTYPE html>
    <html>
    <body style="
        margin:0;
        padding:30px;
        background:#f4f8f5;
        font-family:Arial, sans-serif;
        color:#17352a;
    ">

        <div style="
            max-width:560px;
            margin:auto;
            background:white;
            border-radius:18px;
            padding:36px;
            box-shadow:0 8px 30px rgba(0,0,0,0.08);
        ">

            <div style="
                font-size:24px;
                font-weight:700;
                color:#176b45;
                margin-bottom:22px;
            ">
                ClimaCare UAE AI
            </div>

            <h2 style="
                margin-bottom:10px;
                color:#17352a;
            ">
                Verify your email
            </h2>

            <p>
                Hello {recipient_name},
            </p>

            <p>
                Use the verification code below
                to complete your ClimaCare account.
            </p>

            <div style="
                margin:30px 0;
                padding:20px;
                background:#edf8f1;
                border-radius:14px;
                text-align:center;
                font-size:34px;
                font-weight:700;
                letter-spacing:8px;
                color:#176b45;
            ">
                {otp}
            </div>

            <p>
                This code expires in
                <strong>10 minutes</strong>.
            </p>

            <p style="
                color:#6c7d75;
                font-size:13px;
                margin-top:30px;
            ">
                If you did not create this account,
                you can safely ignore this email.
            </p>

        </div>

    </body>
    </html>
    """

    try:
        response = resend.Emails.send(
            {
                "from": (
                    "ClimaCare UAE AI "
                    "<onboarding@resend.dev>"
                ),
                "to": [
                    recipient_email
                ],
                "subject": subject,
                "html": html_content,
                "text": text_content,
            }
        )

        print(
            "CLIMACARE EMAIL: "
            f"verification email sent to {recipient_email}",
            flush=True
        )

        return True

    except Exception as exc:
        print(
            "CLIMACARE EMAIL ERROR: "
            f"{type(exc).__name__}: {exc}",
            flush=True
        )
        raise