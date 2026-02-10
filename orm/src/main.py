import os
from fastapi import FastAPI
import uvicorn
from endpoints.company import company_router
from endpoints.lighthouse import lighthouse_router

app = FastAPI()
PORT = os.getenv("PORT", 8000)
app.include_router(company_router)
app.include_router(lighthouse_router)

@app.get("/healz")
def health_check():
    return {"status": "ok"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=PORT)
