from database import get_db
from requirements import Requirements
from sqlalchemy.orm import Session, joinedload
from company import Company 
from fastapi import APIRouter, Depends, HTTPException

company_router = APIRouter(
    prefix="/companies",
    tags=["Companies"]
)

@company_router.post("/")
def create_company(data: dict, db: Session = Depends(get_db)):
    new_company = Company(**data)
    db.add(new_company)
    db.commit()
    db.refresh(new_company)
    return new_company

@company_router.post("/bulk")
def bulk_create_companies(data: list[dict], db: Session = Depends(get_db)):
    company_objects = []
    for entry in data:
        requirements_data = entry.pop('requirements', [])
        company = Company(**entry)
        company.requirements = [Requirements(**b) for b in requirements_data]
        company_objects.append(company)
    
    db.add_all(company_objects)
    db.commit()
    return {"message": f"Created {len(data)} companies"}

@company_router.get("/")
def get_companies(db: Session = Depends(get_db)):
    return db.query(Company).options(joinedload(Company.requirements)).all()

@company_router.get("/{id}")
def get_company(id: str, db: Session = Depends(get_db)):
    company = db.query(Company).filter(Company.id == id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    return company

@company_router.put("/{id}")
def update_company(id: str, data: dict, db: Session = Depends(get_db)):
    
    company = db.query(Company).filter(Company.id == id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    
    requirements_data = data.pop('requirements', None)

    for key, value in data.items():
        if hasattr(company, key):
            setattr(company, key, value)
    
    if requirements_data is not None:
        company.requirements = [Requirements(**b) for b in requirements_data]
    
    try:
        db.commit()
        db.refresh(company)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))
        
    return {"message": "Updated successfully", "id": company.id}

@company_router.delete("/{id}")
def delete_company(id: str, db: Session = Depends(get_db)):
    company = db.query(Company).filter(Company.id == id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Not found")
    
    db.delete(company)
    db.commit()
    return {"message": "Deleted"}
