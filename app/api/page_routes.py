from fastapi import APIRouter, HTTPException
from app.models.page import Page, PageUpdate
from app.db.mongo import get_db
from datetime import datetime
from bson import ObjectId


router = APIRouter()

@router.post(
        "/",
        response_model=Page,
        summary="Create a new page",
        description="This page will be used to run lighthouse tests periodically",
        )
async def create_page(page: Page):
    page_data = page.model_dump(by_alias=True)
    page_data["created_at"] = datetime.now()
    db = await get_db()
    result = await db.pages.insert_one(page_data)
    new_page = await db.pages.find_one({"_id": result.inserted_id})
    return Page(**new_page)

@router.get(
        "/{page_id}", 
        response_model=Page,
        summary="Get Page by ID",
        description="Retrieve a specific page by its ID."
        )
async def get_page(page_id: str):
    db = await get_db()
    page = await db.pages.find_one({"_id": ObjectId(page_id)})
    if not page:
        raise HTTPException(status_code=404, detail="Page not found")
    return Page(**page)

@router.get(
        "/", 
        response_model=list[Page],
        summary="List All Pages",
        description="Retrieve a list of all pages."
        )
async def list_pages():
    db = await get_db()
    pages = await db.pages.find().to_list(100)
    return [Page(**p) for p in pages]

@router.put(
        "/{page_id}", 
        response_model=Page,
        summary="Update Page by ID",
        description="Update a specific page by its ID."
        )
async def update_page(page_id: str, update_data: PageUpdate):
    if not ObjectId.is_valid(page_id):
        raise HTTPException(status_code=400, detail="Invalid ID")
    
    update_dict = update_data.model_dump(exclude_unset=True)
    if not update_dict:
        raise HTTPException(status_code=400, detail="No fields provided for update")
    
    db = await get_db()
    result = await db.pages.update_one(
        {"_id": ObjectId(page_id)},
        {"$set": update_dict}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Page not found")

    updated = await db.pages.find_one({"_id": ObjectId(page_id)})
    return Page(**updated)

@router.delete(
        "/{page_id}",
        summary="Delete Page by ID",
        description="Delete a specific page by its ID."
        )
async def delete_page(page_id: str):
    db = await get_db()
    result = await db.pages.delete_one({"_id": ObjectId(page_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Page not found")

