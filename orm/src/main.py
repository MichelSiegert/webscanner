import os
from database import engine, Base
from company import Company 
from fastapi import FastAPI
import uvicorn

app = FastAPI()
PORT = os.getenv("PORT", 8000)

@app.on_event("startup")
def on_startup():
    print("Checking/Creating tables...")
    Base.metadata.create_all(bind=engine)
    print("Database is ready")

@app.get("/healz")
def health_check():
    return {"status": "online"}

@app.get("/companies")
def get_companies():
    return [{"id": 1, "name": "Example Corp"}]

def init_db():
    print("Creating tables in Postgres...")
    Base.metadata.create_all(bind=engine)
    print("Tables created successfully!")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=PORT)
