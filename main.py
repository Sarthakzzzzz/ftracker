from pathlib import Path
import sys
from os import getenv

import uvicorn


def main() -> None:
    backend_path = Path(__file__).resolve().parent / "backend"
    if str(backend_path) not in sys.path:
        sys.path.insert(0, str(backend_path))

    from app.core.config import settings

    reload = settings.ENVIRONMENT == "local" or getenv("UVICORN_RELOAD", "").lower() in {
        "1",
        "true",
        "yes",
    }
    host = getenv("HOST", "0.0.0.0")
    port = int(getenv("PORT", "8000"))

    uvicorn.run("app.main:app", host=host, port=port, reload=reload)


if __name__ == "__main__":
    main()
