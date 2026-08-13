from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    mysql_host: str
    mysql_port: int = 3306
    mysql_user: str
    mysql_password: str
    mysql_database: str
    jwt_secret: str

    google_client_id: str
    google_client_secret: str
    google_redirect_uri: str
    frontend_url: str

    admin_email: str | None = None
    admin_password: str | None = None

    model_config = SettingsConfigDict(env_file=".env.local", extra="ignore")

settings = Settings()