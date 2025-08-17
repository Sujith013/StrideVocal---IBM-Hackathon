from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    APP_NAME: str = "My API"
    AZURE_WHISPER_ENDPOINT: str
    AZURE_API_KEY: str
    API_VERSION: str
    TOKEN_REQUEST_URL: str
    TTS_MODEL_URL: str
    IBM_WATSON_API_KEY: str
    IBM_WATSON_AGENT_URL: str
    

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
    )

settings = Settings()