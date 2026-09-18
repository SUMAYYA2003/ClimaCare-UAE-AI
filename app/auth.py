from pathlib import Path
import sqlite3
import hashlib
import secrets
from datetime import datetime, timedelta, timezone

from passlib.context import CryptContext


# ---------------------------------------------------------
# Database location
# ---------------------------------------------------------

BASE_DIR = Path(__file__).resolve().parent.parent
DB_PATH = BASE_DIR / "climacare.db"


# ---------------------------------------------------------
# Password hashing
# ---------------------------------------------------------

pwd_context = CryptContext(
    schemes=["pbkdf2_sha256"],
    deprecated="auto"
)


# ---------------------------------------------------------
# Time helper
# ---------------------------------------------------------

def utc_now():
    return datetime.now(timezone.utc)


# ---------------------------------------------------------
# Database connection
# ---------------------------------------------------------

def get_db_connection():
    connection = sqlite3.connect(DB_PATH)
    connection.row_factory = sqlite3.Row

    # Enable foreign-key enforcement.
    connection.execute("PRAGMA foreign_keys = ON")

    return connection


# ---------------------------------------------------------
# Safe column migration helpers
# ---------------------------------------------------------

def column_exists(
    connection,
    table_name: str,
    column_name: str
) -> bool:

    rows = connection.execute(
        f"PRAGMA table_info({table_name})"
    ).fetchall()

    return any(
        row["name"] == column_name
        for row in rows
    )


def add_column_if_missing(
    connection,
    table_name: str,
    column_name: str,
    column_definition: str
):

    if not column_exists(
        connection,
        table_name,
        column_name
    ):
        connection.execute(
            f"""
            ALTER TABLE {table_name}
            ADD COLUMN {column_name} {column_definition}
            """
        )


# =========================================================
# CREATE / MIGRATE DATABASE TABLES
# =========================================================

def create_tables():
    connection = get_db_connection()
    cursor = connection.cursor()

    # -----------------------------------------------------
    # Users
    # -----------------------------------------------------

    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'user',
            created_at TEXT NOT NULL,
            email_verified INTEGER NOT NULL DEFAULT 0,
            verified_at TEXT
        )
        """
    )

    # Migration support for older ClimaCare databases.
    add_column_if_missing(
        connection,
        "users",
        "email_verified",
        "INTEGER NOT NULL DEFAULT 0"
    )

    add_column_if_missing(
        connection,
        "users",
        "verified_at",
        "TEXT"
    )

    # -----------------------------------------------------
    # Email verification OTP
    # -----------------------------------------------------

    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS email_verification (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL UNIQUE,
            otp_hash TEXT NOT NULL,
            expires_at TEXT NOT NULL,
            created_at TEXT NOT NULL,
            last_sent_at TEXT NOT NULL,
            attempts INTEGER NOT NULL DEFAULT 0,

            FOREIGN KEY (user_id)
                REFERENCES users(id)
                ON DELETE CASCADE
        )
        """
    )

    # -----------------------------------------------------
    # User interests
    # -----------------------------------------------------

    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS user_interests (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            interest TEXT NOT NULL,
            created_at TEXT NOT NULL,

            FOREIGN KEY (user_id)
                REFERENCES users(id)
                ON DELETE CASCADE,

            UNIQUE(user_id, interest)
        )
        """
    )

    # -----------------------------------------------------
    # Feedback
    # -----------------------------------------------------

    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS feedback (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            rating INTEGER,
            comment TEXT,
            created_at TEXT NOT NULL,
            ai_category TEXT,
            ai_sentiment TEXT,
            ai_priority TEXT,
            ai_summary TEXT,
            ai_suggested_action TEXT,

            FOREIGN KEY (user_id)
                REFERENCES users(id)
        )
        """
    )

    # Migration support for older feedback table.
    feedback_columns = {
        "ai_category": "TEXT",
        "ai_sentiment": "TEXT",
        "ai_priority": "TEXT",
        "ai_summary": "TEXT",
        "ai_suggested_action": "TEXT"
    }

    for column_name, definition in feedback_columns.items():
        add_column_if_missing(
            connection,
            "feedback",
            column_name,
            definition
        )

    connection.commit()
    connection.close()


# =========================================================
# PASSWORD HELPERS
# =========================================================

def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(
    plain_password: str,
    hashed_password: str
) -> bool:

    return pwd_context.verify(
        plain_password,
        hashed_password
    )


# =========================================================
# USER ACCOUNT HELPERS
# =========================================================

def create_user(
    name: str,
    email: str,
    password: str,
    role: str = "user"
):
    connection = get_db_connection()
    cursor = connection.cursor()

    password_hash = hash_password(password)

    cursor.execute(
        """
        INSERT INTO users (
            name,
            email,
            password_hash,
            role,
            created_at,
            email_verified
        )
        VALUES (?, ?, ?, ?, ?, 0)
        """,
        (
            name.strip(),
            email.strip().lower(),
            password_hash,
            role,
            utc_now().isoformat()
        )
    )

    connection.commit()

    user_id = cursor.lastrowid

    connection.close()

    return user_id


def get_user_by_email(email: str):
    connection = get_db_connection()

    user = connection.execute(
        """
        SELECT *
        FROM users
        WHERE email = ?
        """,
        (
            email.strip().lower(),
        )
    ).fetchone()

    connection.close()

    return user


def get_user_by_id(user_id: int):
    connection = get_db_connection()

    user = connection.execute(
        """
        SELECT *
        FROM users
        WHERE id = ?
        """,
        (
            user_id,
        )
    ).fetchone()

    connection.close()

    return user


# =========================================================
# EMAIL OTP VERIFICATION
# =========================================================

def generate_otp() -> str:
    """
    Generate a cryptographically secure 6-digit OTP.
    """

    return f"{secrets.randbelow(1_000_000):06d}"


def hash_otp(otp: str) -> str:
    """
    Hash the OTP before storing it in SQLite.
    """

    return hashlib.sha256(
        otp.encode("utf-8")
    ).hexdigest()


def create_email_verification(
    user_id: int,
    otp: str,
    expiry_minutes: int = 10
):
    connection = get_db_connection()

    now = utc_now()

    expires_at = now + timedelta(
        minutes=expiry_minutes
    )

    connection.execute(
        """
        INSERT INTO email_verification (
            user_id,
            otp_hash,
            expires_at,
            created_at,
            last_sent_at,
            attempts
        )
        VALUES (?, ?, ?, ?, ?, 0)

        ON CONFLICT(user_id)
        DO UPDATE SET
            otp_hash = excluded.otp_hash,
            expires_at = excluded.expires_at,
            created_at = excluded.created_at,
            last_sent_at = excluded.last_sent_at,
            attempts = 0
        """,
        (
            user_id,
            hash_otp(otp),
            expires_at.isoformat(),
            now.isoformat(),
            now.isoformat()
        )
    )

    connection.commit()
    connection.close()


def get_email_verification(user_id: int):
    connection = get_db_connection()

    verification = connection.execute(
        """
        SELECT *
        FROM email_verification
        WHERE user_id = ?
        """,
        (
            user_id,
        )
    ).fetchone()

    connection.close()

    return verification


def verify_email_otp(
    user_id: int,
    otp: str,
    max_attempts: int = 5
):
    """
    Possible results:

    (True, "verified")
    (False, "invalid")
    (False, "expired")
    (False, "too_many_attempts")
    (False, "not_found")
    """

    connection = get_db_connection()
    cursor = connection.cursor()

    verification = cursor.execute(
        """
        SELECT *
        FROM email_verification
        WHERE user_id = ?
        """,
        (
            user_id,
        )
    ).fetchone()

    if not verification:
        connection.close()

        return False, "not_found"

    # -----------------------------------------------------
    # Attempt limit
    # -----------------------------------------------------

    if verification["attempts"] >= max_attempts:
        connection.close()

        return False, "too_many_attempts"

    # -----------------------------------------------------
    # Check expiration
    # -----------------------------------------------------

    try:
        expires_at = datetime.fromisoformat(
            verification["expires_at"]
        )

    except (ValueError, TypeError):
        connection.close()

        return False, "expired"

    if utc_now() > expires_at:
        connection.close()

        return False, "expired"

    # -----------------------------------------------------
    # Compare hashed OTP
    # -----------------------------------------------------

    submitted_hash = hash_otp(
        otp.strip()
    )

    if not secrets.compare_digest(
        submitted_hash,
        verification["otp_hash"]
    ):
        cursor.execute(
            """
            UPDATE email_verification
            SET attempts = attempts + 1
            WHERE user_id = ?
            """,
            (
                user_id,
            )
        )

        connection.commit()
        connection.close()

        return False, "invalid"

    # -----------------------------------------------------
    # Correct OTP — verify user
    # -----------------------------------------------------

    cursor.execute(
        """
        UPDATE users
        SET
            email_verified = 1,
            verified_at = ?
        WHERE id = ?
        """,
        (
            utc_now().isoformat(),
            user_id
        )
    )

    # OTP is one-time-use.
    cursor.execute(
        """
        DELETE FROM email_verification
        WHERE user_id = ?
        """,
        (
            user_id,
        )
    )

    connection.commit()
    connection.close()

    return True, "verified"


def can_resend_otp(
    user_id: int,
    cooldown_seconds: int = 60
) -> bool:

    verification = get_email_verification(
        user_id
    )

    if not verification:
        return True

    try:
        last_sent = datetime.fromisoformat(
            verification["last_sent_at"]
        )

    except (ValueError, TypeError):
        return True

    elapsed = (
        utc_now() - last_sent
    ).total_seconds()

    return elapsed >= cooldown_seconds


# =========================================================
# USER INTERESTS
# =========================================================

ALLOWED_INTERESTS = {
    "air_quality",
    "health",
    "outdoor",
    "beaches",
    "desert",
    "family",
    "shopping",
    "culture",
    "environmental_trends",
    "sustainability"
}


def save_user_interests(
    user_id: int,
    interests: list[str]
):
    """
    Validate and save the user's selected interests.

    Existing selections are replaced with the newest
    selections.

    Returns the validated list of saved interests.
    """

    connection = get_db_connection()
    cursor = connection.cursor()

    cleaned_interests = []

    for interest in interests:

        clean_interest = (
            interest.strip().lower()
        )

        if (
            clean_interest in ALLOWED_INTERESTS
            and clean_interest not in cleaned_interests
        ):
            cleaned_interests.append(
                clean_interest
            )

    # -----------------------------------------------------
    # Remove old selections
    # -----------------------------------------------------

    cursor.execute(
        """
        DELETE FROM user_interests
        WHERE user_id = ?
        """,
        (
            user_id,
        )
    )

    # -----------------------------------------------------
    # Save new selections
    # -----------------------------------------------------

    for interest in cleaned_interests:

        cursor.execute(
            """
            INSERT INTO user_interests (
                user_id,
                interest,
                created_at
            )
            VALUES (?, ?, ?)
            """,
            (
                user_id,
                interest,
                utc_now().isoformat()
            )
        )

    connection.commit()
    connection.close()

    return cleaned_interests


def get_user_interests(
    user_id: int
) -> list[str]:

    connection = get_db_connection()

    rows = connection.execute(
        """
        SELECT interest
        FROM user_interests
        WHERE user_id = ?
        ORDER BY id ASC
        """,
        (
            user_id,
        )
    ).fetchall()

    connection.close()

    return [
        row["interest"]
        for row in rows
    ]


# =========================================================
# FEEDBACK
# =========================================================

def save_feedback(
    user_id: int,
    rating: int | None,
    comment: str | None,
    ai_category: str | None = None,
    ai_sentiment: str | None = None,
    ai_priority: str | None = None,
    ai_summary: str | None = None,
    ai_suggested_action: str | None = None
):
    connection = get_db_connection()
    cursor = connection.cursor()

    cursor.execute(
        """
        INSERT INTO feedback (
            user_id,
            rating,
            comment,
            created_at,
            ai_category,
            ai_sentiment,
            ai_priority,
            ai_summary,
            ai_suggested_action
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            user_id,
            rating,
            comment,
            utc_now().isoformat(),
            ai_category,
            ai_sentiment,
            ai_priority,
            ai_summary,
            ai_suggested_action
        )
    )

    connection.commit()

    feedback_id = cursor.lastrowid

    connection.close()

    return feedback_id


# =========================================================
# ADMIN — USERS
# =========================================================

def get_all_users():
    connection = get_db_connection()

    users = connection.execute(
        """
        SELECT
            id,
            name,
            email,
            role,
            email_verified,
            verified_at,
            created_at
        FROM users
        ORDER BY id DESC
        """
    ).fetchall()

    connection.close()

    return users


# =========================================================
# ADMIN — FEEDBACK
# =========================================================

def get_recent_feedback(
    limit: int = 50
):
    connection = get_db_connection()

    feedback_rows = connection.execute(
        """
        SELECT
            feedback.id,
            feedback.rating,
            feedback.comment,
            feedback.created_at,

            feedback.ai_category,
            feedback.ai_sentiment,
            feedback.ai_priority,
            feedback.ai_summary,
            feedback.ai_suggested_action,

            users.name AS user_name,
            users.email AS user_email

        FROM feedback

        JOIN users
            ON feedback.user_id = users.id

        ORDER BY feedback.id DESC

        LIMIT ?
        """,
        (
            limit,
        )
    ).fetchall()

    connection.close()

    return feedback_rows