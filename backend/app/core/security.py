import base64
import hashlib
import hmac
import json
import secrets
from datetime import datetime, timedelta, timezone
from typing import Any

from app.core.config import settings

ALGORITHM = "HMAC-SHA256"
PASSWORD_HASH_ITERATIONS = 200_000


def _urlsafe_b64encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).decode("utf-8").rstrip("=")


def _urlsafe_b64decode(data: str) -> bytes:
    padding = "=" * ((4 - len(data) % 4) % 4)
    return base64.urlsafe_b64decode(data + padding)


def _sign(data: str) -> str:
    digest = hmac.new(
        settings.SECRET_KEY.encode("utf-8"), data.encode("utf-8"), hashlib.sha256
    ).digest()
    return _urlsafe_b64encode(digest)


def create_access_token(subject: str, role: str, expires_delta: timedelta) -> str:
    expire = datetime.now(timezone.utc) + expires_delta
    payload = {
        "sub": subject,
        "role": role,
        "exp": int(expire.timestamp()),
        "nonce": secrets.token_urlsafe(8),
    }
    payload_bytes = json.dumps(payload, separators=(",", ":"), sort_keys=True).encode(
        "utf-8"
    )
    payload_b64 = _urlsafe_b64encode(payload_bytes)
    signature = _sign(payload_b64)
    return f"{payload_b64}.{signature}"


def decode_access_token(token: str) -> dict[str, Any]:
    try:
        payload_b64, signature = token.split(".", maxsplit=1)
    except ValueError as exc:
        raise ValueError("Invalid token format") from exc

    expected_signature = _sign(payload_b64)
    if not hmac.compare_digest(signature, expected_signature):
        raise ValueError("Invalid token signature")

    try:
        payload = json.loads(_urlsafe_b64decode(payload_b64).decode("utf-8"))
    except (json.JSONDecodeError, UnicodeDecodeError) as exc:
        raise ValueError("Invalid token payload") from exc

    exp = payload.get("exp")
    if not isinstance(exp, int):
        raise ValueError("Invalid token expiry")

    now_ts = int(datetime.now(timezone.utc).timestamp())
    if exp < now_ts:
        raise ValueError("Token expired")

    return payload


def get_password_hash(password: str) -> str:
    salt = secrets.token_bytes(16)
    derived_key = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt,
        PASSWORD_HASH_ITERATIONS,
    )
    salt_b64 = _urlsafe_b64encode(salt)
    hash_b64 = _urlsafe_b64encode(derived_key)
    return f"pbkdf2_sha256${PASSWORD_HASH_ITERATIONS}${salt_b64}${hash_b64}"


def verify_password(plain_password: str, stored_hash: str) -> bool:
    try:
        scheme, iterations_str, salt_b64, expected_hash_b64 = stored_hash.split("$", maxsplit=3)
        if scheme != "pbkdf2_sha256":
            return False
        iterations = int(iterations_str)
    except (ValueError, AttributeError):
        return False

    derived_key = hashlib.pbkdf2_hmac(
        "sha256",
        plain_password.encode("utf-8"),
        _urlsafe_b64decode(salt_b64),
        iterations,
    )
    actual_hash_b64 = _urlsafe_b64encode(derived_key)
    return hmac.compare_digest(actual_hash_b64, expected_hash_b64)
