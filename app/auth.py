from pathlib import Path
import sqlite3
from datetime import datetime

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
# Database connection
# ---------------------------------------------------------

def get_db_connection():
    connection = sqlite3.connect(DB_PATH)
    connection.row_factory = sqlite3.Row
    return connection


# ---------------------------------------------------------
# Create database tables
# ---------------------------------------------------------

def create_tables():
    connection = get_db_connection()
    cursor = connection.cursor()

    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'user',
            created_at TEXT NOT NULL
        )
        """
    )

    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS feedback (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            rating INTEGER,
            comment TEXT,
            created_at TEXT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
        """
    )

    connection.commit()
    connection.close()


# ---------------------------------------------------------
# Password helpers
# ---------------------------------------------------------

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


# ---------------------------------------------------------
# Create user
# ---------------------------------------------------------

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
            created_at
        )
        VALUES (?, ?, ?, ?, ?)
        """,
        (
            name.strip(),
            email.strip().lower(),
            password_hash,
            role,
            datetime.now().isoformat()
        )
    )

    connection.commit()

    user_id = cursor.lastrowid

    connection.close()

    return user_id


# ---------------------------------------------------------
# Find user by email
# ---------------------------------------------------------

def get_user_by_email(email: str):
    connection = get_db_connection()
    cursor = connection.cursor()

    cursor.execute(
        """
        SELECT *
        FROM users
        WHERE email = ?
        """,
        (
            email.strip().lower(),
        )
    )

    user = cursor.fetchone()

    connection.close()

    return user


# ---------------------------------------------------------
# Find user by ID
# ---------------------------------------------------------

def get_user_by_id(user_id: int):
    connection = get_db_connection()
    cursor = connection.cursor()

    cursor.execute(
        """
        SELECT *
        FROM users
        WHERE id = ?
        """,
        (
            user_id,
        )
    )

    user = cursor.fetchone()

    connection.close()

    return user


# ---------------------------------------------------------
# Save feedback
# ---------------------------------------------------------

def save_feedback(
    user_id: int,
    rating: int | None,
    comment: str | None
):
    connection = get_db_connection()
    cursor = connection.cursor()

    cursor.execute(
        """
        INSERT INTO feedback (
            user_id,
            rating,
            comment,
            created_at
        )
        VALUES (?, ?, ?, ?)
        """,
        (
            user_id,
            rating,
            comment,
            datetime.now().isoformat()
        )
    )

    connection.commit()
    connection.close()


# ---------------------------------------------------------
# Get all users for admin dashboard
# ---------------------------------------------------------

def get_all_users():
    connection = get_db_connection()
    cursor = connection.cursor()

    cursor.execute(
        """
        SELECT
            id,
            name,
            email,
            role,
            created_at
        FROM users
        ORDER BY id DESC
        """
    )

    users = cursor.fetchall()

    connection.close()

    return users


# ---------------------------------------------------------
# Get recent feedback for admin dashboard
# ---------------------------------------------------------

def get_recent_feedback(limit: int = 20):
    connection = get_db_connection()
    cursor = connection.cursor()

    cursor.execute(
        """
        SELECT
            feedback.id,
            feedback.rating,
            feedback.comment,
            feedback.created_at,
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
    )

    feedback_rows = cursor.fetchall()

    connection.close()

    return feedback_rows
