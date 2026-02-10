from database import get_db
from sqlalchemy.orm import Session
from lighthouse import Lighthouse 
from fastapi import APIRouter, Depends 
from pydantic import BaseModel
from typing import List

lighthouse_router = APIRouter(
    prefix="/lighthouse",
    tags=["Companies"]
)

class LighthouseSchema(BaseModel):
    id: str
    company_id: str
    timestamp: int
    performance: int
    accessibility: int
    best_practices: int
    seo: int

@lighthouse_router.post("/")
def create_lighthouse(data: LighthouseSchema, db: Session = Depends(get_db)):
    new_company = Lighthouse(**data.dict())
    db.add(new_company)
    db.commit()
    db.refresh(new_company)
    return new_company

@lighthouse_router.get("/", response_model=List[LighthouseSchema])
def get_lighthouses(company_id: str = None, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    query = db.query(Lighthouse)
    if company_id:
        query = query.filter(Lighthouse.company_id == company_id)
    
    results = query.offset(skip).limit(limit).all()
    return results