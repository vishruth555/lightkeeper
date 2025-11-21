import logging.config
from app.core.config import settings

LOGGING_CONFIG = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "default": {
            # "format": "[%(asctime)s] [%(levelname)s] [%(filename)s:%(lineno)d] - %(message)s",
            "format": "[%(asctime)s] [%(levelname)s] - %(message)s",
        },
    },
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "formatter": "default",
            "level": "DEBUG",
        },
        "file": {
            "class": "logging.handlers.RotatingFileHandler",
            "formatter": "default",
            "filename": "logs/app.log",
            "maxBytes": 5_000_000,
            "backupCount": 3,
            "level": "INFO",
        },
        "slack": {
            "class": "app.core.slack_handler.SlackHandler", 
            "formatter": "default",
            "level": "ERROR",
            # "webhook_url": "https://hooks.slack.com/services/XXXX/YYYY/ZZZZ",
        }
    },
    "loggers": {
        "app": {
            "handlers": ["console","file","slack"],
            "level": "DEBUG",
        },
        "uvicorn": {
            "handlers": ["console", "file"],
            "level": "INFO",
            "propagate": False,
        },
        "uvicorn.access": {
            "handlers": ["console", "file"],
            "level": "INFO",
            "propagate": False,
        },
        "uvicorn.error": {
            "handlers": ["console", "file", "slack"],
            "level": "INFO",
            "propagate": False,
        },
    },
}

def setup_logging():
    LOGGING_CONFIG["handlers"]["slack"]["webhook_url"] = settings.slack_debug_webhook
    logging.config.dictConfig(LOGGING_CONFIG)
    logger = logging.getLogger("app")
    return logger

logger = setup_logging()