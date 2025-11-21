from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError
from app.core.logging import logger

_client = None
_db = None

async def init_mongo():
    global _client, _db
    try:
        _client = AsyncIOMotorClient(settings.mongo_url, serverSelectionTimeoutMS=5000)
        await _client.server_info()
        _db = _client[settings.database_name]
        audits = _db["audits"]
        await audits.create_index([("page_id", 1), ("created_at", -1)])
        logger.info(f"Connected to MongoDB Successfully")
    except (ConnectionFailure, ServerSelectionTimeoutError) as e:
        logger.error(f"Could not connect to MongoDB: {e}")
        raise RuntimeError(f"Could not connect to MongoDB: {e}")
    
async def get_db():
    global _client, _db

    if _client is None:
        try:
            _client = AsyncIOMotorClient(settings.mongo_url, serverSelectionTimeoutMS=5000)
            await _client.server_info()
            _db = _client[settings.database_name]
            logger.info("Connected to MongoDB")
        except (ConnectionFailure, ServerSelectionTimeoutError) as e:
            logger.error(f"Could not connect to MongoDB: {e}")
            raise RuntimeError("Mongo unavailable")
    
    return _db