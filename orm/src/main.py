import os
from database import get_db
from benchmark import Benchmark
from sqlalchemy.orm import Session
from company import Company 
from fastapi import FastAPI, Depends, HTTPException
import uvicorn

app = FastAPI()
PORT = os.getenv("PORT", 8000)

@app.get("/healz")
def health_check():
    return {"status": "ok"}

# db integration
@app.post("/companies")
def create_company(data: dict, db: Session = Depends(get_db)):
    new_company = Company(**data)
    db.add(new_company)
    db.commit()
    db.refresh(new_company)
    return new_company

@app.post("/companies/bulk")
def bulk_create_companies(data: list[dict], db: Session = Depends(get_db)):
    company_objects = []
    for entry in data:
        benchmarks_data = entry.pop('benchmarks', [])
        company = Company(**entry)
        company.benchmarks = [Benchmark(**b) for b in benchmarks_data]
        company_objects.append(company)
    
    db.add_all(company_objects)
    db.commit()
    return {"message": f"Created {len(data)} companies"}

@app.get("/companies")
def get_companies(db: Session = Depends(get_db)):
    return db.query(Company).all()

@app.get("/companies/{id}")
def get_company(id: str, db: Session = Depends(get_db)):
    company = db.query(Company).filter(Company.id == id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    return company

@app.put("/companies/{id}")
def update_company(id: str, data: dict, db: Session = Depends(get_db)):
    company = db.query(Company).filter(Company.id == id).first()
    
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    
    benchmarks_data = data.pop('benchmarks', None)
    for key, value in data.items():
        if hasattr(company, key):
            setattr(company, key, value)
    
    if benchmarks_data is not None:
        company.benchmarks = [Benchmark(**b) for b in benchmarks_data]
    
    try:
        db.commit()
        db.refresh(company)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))
        
    return {"message": "Updated successfully", "id": company.id}

@app.delete("/companies/{id}")
def delete_company(id: str, db: Session = Depends(get_db)):
    company = db.query(Company).filter(Company.id == id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Not found")
    
    db.delete(company)
    db.commit()
    return {"message": "Deleted"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=PORT)
