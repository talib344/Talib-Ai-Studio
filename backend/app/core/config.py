"""Application configuration loaded from environment variables."""
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "Talib AI Studio"
    database_url: str = "sqlite:///./talib.db"

    # AI provider keys (all optional — never commit real values)
    openai_api_key: str = ""
    image_api_key: str = ""
    voice_api_key: str = ""

    # OAuth (YouTube / Facebook)
    youtube_client_id: str = ""
    youtube_client_secret: str = ""
    facebook_app_id: str = ""
    facebook_app_secret: str = ""

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
