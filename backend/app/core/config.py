import secrets
from pathlib import Path
from typing import Annotated, Any, Literal

from pydantic import AnyUrl, BeforeValidator, HttpUrl, computed_field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


def parse_cors(value: Any) -> list[str] | str:
    if isinstance(value, str) and not value.startswith("["):
        return [origin.strip() for origin in value.split(",") if origin.strip()]
    if isinstance(value, (list, str)):
        return value
    raise ValueError(value)


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=str(Path(__file__).resolve().parents[3] / ".env"),
        env_ignore_empty=True,
        extra="ignore",
    )

    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Finance Dashboard Backend"
    ENVIRONMENT: Literal["local", "staging", "production"] = "local"
    SENTRY_DSN: HttpUrl | None = None

    SECRET_KEY: str = secrets.token_urlsafe(32)
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24

    FRONTEND_HOST: str = "http://localhost:3000"
    BACKEND_CORS_ORIGINS: Annotated[list[AnyUrl] | str, BeforeValidator(parse_cors)] = []

    DATABASE_URL: str = (
        "postgresql+psycopg://postgres:postgres@localhost:5432/finance_dashboard"
    )

    @field_validator("DATABASE_URL", mode="before")
    @classmethod
    def fix_database_url(cls, v: str | None) -> str | None:
        if isinstance(v, str) and v.startswith("postgresql://"):
            return v.replace("postgresql://", "postgresql+psycopg://", 1)
        return v

    FIRST_SUPERUSER_EMAIL: str = "admin@example.com"
    FIRST_SUPERUSER_PASSWORD: str = "adminadmin"
    FIRST_SUPERUSER_FULL_NAME: str = "System Admin"

    @computed_field  # type: ignore[prop-decorator]
    @property
    def all_cors_origins(self) -> list[str]:
        dynamic = [str(origin).rstrip("/") for origin in self.BACKEND_CORS_ORIGINS]
        return dynamic + [self.FRONTEND_HOST.rstrip("/")]


settings = Settings()  # type: ignore
