from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    google_client_id: str
    google_client_secret: str
    google_redirect_uri: str
    frontend_url: str
    mysql_host: str
    mysql_port: int = 3306
    mysql_user: str
    mysql_password: str
    mysql_database: str
    jwt_secret: str

    class Config:
        env_file = ".env"
        
        
settings = Settings()