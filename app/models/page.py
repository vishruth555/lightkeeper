from pydantic import BaseModel,  Field
from bson import ObjectId
from enum import Enum
from typing import Optional, Any
from datetime import datetime
from pydantic_core import core_schema

class DeviceType(str, Enum):
    mobile = "mobile"
    desktop = "desktop"


class PyObjectId(ObjectId):
    @classmethod
    def __get_pydantic_core_schema__(cls, source_type, handler):
        def validate(value):
            if isinstance(value, ObjectId):
                return value
            if isinstance(value, str) and ObjectId.is_valid(value):
                return ObjectId(value)
            raise TypeError("Invalid ObjectId")
        return core_schema.no_info_plain_validator_function(validate)

    @classmethod
    def __get_pydantic_json_schema__(cls, schema, handler):
        return {"type": "string", "example": "671fb60b3dcd7f6acb34b9a1"}

class Page(BaseModel):
    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias='_id')
    created_at: datetime = Field(default_factory=datetime.now)
    isEnabled: bool
    url: str
    name: str
    env: str
    device: DeviceType
    benchmarkScore: int
    thresholdPercentage: int
    auth: Optional[Any] = None

    class Config:
        json_encoders = {ObjectId: str}

class PageUpdate(BaseModel):
    isEnabled: Optional[bool] = None
    name: Optional[str] = None
    env: Optional[str] = None
    device: Optional[DeviceType] = None
    benchmarkScore: Optional[int] = None
    thresholdPercentage: Optional[int] = None
    auth: Optional[Any] = None
