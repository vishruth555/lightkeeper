import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    app_name: str = "Lightkeeper-service"
    mongo_url: str = os.getenv("MONGO_URL")
    database_name: str = os.getenv("DATABASE_NAME")
    slack_debug_webhook: str = os.getenv("SLACK_DEBUG_WEBHOOK")


settings = Settings()
