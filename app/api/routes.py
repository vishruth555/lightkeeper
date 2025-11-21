from fastapi import APIRouter, HTTPException
from app.services.audits import run_audits, get_pages, run_audit
from app.models.page_score import PageScore
from app.models.page import DeviceType
from typing import Optional
from app.core.logging import logger
from app.db.mongo import get_db
from bson import ObjectId


router = APIRouter()

@router.get(
        "/", 
        summary="ping", 
        )
async def health():
    return {"message": "pong"}


@router.post(
        "/run",
        summary="Run lighthouse",
        description="run lighthouse on all the pages"
)
async def run(
    url: Optional[str] = None,
    device: Optional[DeviceType] = None,
    env: Optional[str] = None,
):
    query = {"isEnabled" : True}
    if url:
        query["url"] = url
    if device:
        query["device"] = device
    if env:
        query["env"] = env

    pages = await get_pages(query)
    if not pages:
        raise HTTPException(status_code=404, detail="No pages found for the given query")
    await run_audits(pages)
    return {"message": "audits ran successfully"}

@router.post(
        "/run/{id}",
        summary="Run lighthouse for a Page",
        description="runs an audit for the specified id",
)
async def run_once(id: str):
    if not ObjectId.is_valid(id):
        raise HTTPException(status_code=400, detail="Invalid ID")
    result = await run_audit(id)
    return result
    




@router.get(
        "/audits/{page_id}", 
        response_model=list[PageScore],
        summary="Get All Audits for a Page",
        description="fetches all audits ran for a specific page",
        )
async def get_page(page_id: str):
    if not ObjectId.is_valid(page_id):
        raise HTTPException(status_code=400, detail="Invalid ID")
    db = await get_db()
    pages = await db.audits.find({"page_id": ObjectId(page_id)}).to_list()
    if not pages:
        raise HTTPException(status_code=404, detail="Page not found")
    return [PageScore(**p) for p in pages]
    
