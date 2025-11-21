from app.core.logging import logger
from app.db.mongo import get_db
from app.models.page import Page
from app.models.page_score import PageScore, parse_page_score
from app.services.lighthouse import run_lighthouse
from bson import ObjectId




async def get_pages(query: dict = {}):
    db = await get_db()
    try:
        cursor = db.pages.find(query)
        pages = await cursor.to_list(length=None)
    except Exception as e:
        logger.error(f"unable to fetch records for {query}, error -> {e}")
    finally:
        pages = [Page(**p) for p in pages]
        return pages


async def run_audits(pages: list[Page]):
    db = await get_db()
    
    for page in pages:
        page_score = run_lighthouse(page)
        try:             
            result = await db.audits.insert_one(page_score)
            logger.info(f"saved audit for {page.url}")
        
        except Exception as e:
            logger.error(f"unable to save record for {page.url}, error -> {e}")
    
async def run_audit(id: str):
    db = await get_db()
    page = await db.pages.find_one({"_id": ObjectId(id)})
    page = Page(**page)
    page_score = run_lighthouse(page)
    try:
        result = await db.audits.insert_one(page_score)
        logger.info(f"saved audit for {page.url}")
        page_score["_id"] = str(page_score["_id"])
        page_score["page_id"] = str(page_score["page_id"])
        return page_score

    except Exception as e:
        logger.error(f"unable to save record for {page.url}, error -> {e}")
    
