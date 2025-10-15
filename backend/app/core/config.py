from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings): #BaseSettings beállítása
    DATABASE_URL: str
    SECRET_KEY: str = "change-me-in-.env"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    ALGORITHM: str = "HS256"

    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore",
    )

settings = Settings()