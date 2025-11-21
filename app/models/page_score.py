from pydantic import BaseModel, Field
from typing import Dict, Any, Optional
from datetime import datetime
from app.models.page import PyObjectId,Page, DeviceType
from bson import ObjectId

class PageScore(BaseModel):
    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias='_id')
    page_id: PyObjectId
    created_at: datetime = Field(default_factory=datetime.now)
    url: str
    device: DeviceType
    psi_score: int
    seo_score: int
    # performance_score: int
    # accessibility_score: int
    # best_practices_score: int
    metrics: Dict[str, Any]

    class Config:
        json_encoders = {ObjectId: str}


def parse_page_score(data, page: Page) -> PageScore:
    
    metrics_dict = {}
    metrics_dict["first_contentful_paint"] = int(data["audits"]["first-contentful-paint"]["numericValue"])
    metrics_dict["speed_index"] = int(data["audits"]["speed-index"]["numericValue"])
    metrics_dict["largest_contentful_paint"] = int(data["audits"]["largest-contentful-paint"]["numericValue"])
    metrics_dict["time_to_interactive"] = int(data["audits"]["interactive"]["numericValue"])
    metrics_dict["total_blocking_time"] = int(data["audits"]["total-blocking-time"]["numericValue"])
    metrics_dict["cumulative_layout_shift"] = round(data["audits"]["cumulative-layout-shift"]["numericValue"],4)

    return PageScore(
        url = data["finalUrl"],
        page_id = page.id,
        device = page.device,
        psi_score = int(data["categories"]["performance"]["score"] * 100),
        seo_score= int(data["categories"]["seo"]["score"] * 100),
        # performance_score= int(data["categories"]["performance"]["score"] * 100),
        # accessibility_score= int(data["categories"]["accessibility"]["score"] * 100),
        # best_practices_score= int(data["categories"]["best-practices"]["score"] * 100),
        metrics=metrics_dict
    )

