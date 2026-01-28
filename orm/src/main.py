import os
from database import engine, Base, get_db
from sqlalchemy.orm import Session
from company import Company 
from fastapi import FastAPI, Depends, HTTPException
import uvicorn

app = FastAPI()
PORT = os.getenv("PORT", 8000)

# generic endpoints
@app.on_event("startup")
def on_startup():
    print("Checking/Creating tables...")
    Base.metadata.create_all(bind=engine)
    print("Database is ready")

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
    db.bulk_insert_mappings(Company, data)
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
    company_query = db.query(Company).filter(Company.id == id)
    if not company_query.first():
        raise HTTPException(status_code=404, detail="Not found")
    
    company_query.update(data)
    db.commit()
    return {"message": "Updated successfully"}

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
