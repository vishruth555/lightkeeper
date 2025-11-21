from fastapi import FastAPI
from app.api import routes, page_routes
from app.core.config import settings
from app.core.logging import logger
from app.db.mongo import init_mongo
from contextlib import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware

origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

@asynccontextmanager
async def lifespan(app: FastAPI):
    #startup
    logger.info("Starting up lightkeeper-service...")
    await init_mongo()

    yield

    #shutdown
    logger.info("Shutting down lightkeeper-service...")

def create_app() -> FastAPI:
    app = FastAPI(title=settings.app_name, lifespan=lifespan)
    app.include_router(routes.router, prefix="")
    app.include_router(page_routes.router, prefix="/pages")
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    return app


app = create_app()


