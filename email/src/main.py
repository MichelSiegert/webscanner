from http.client import HTTPException
import os

from .emailRequest import EmailRequest
from .crypto import get_current_user
from .emailtext import createHtml, createText
from fastapi import FastAPI, Depends
import smtplib
from email.message import EmailMessage
from dotenv import load_dotenv


load_dotenv()

email = os.getenv("EMAIL") or "test@user.com"
pw = os.getenv("PASSWORD") or "supersecret"
host = os.getenv("HOST") or "maildev"
hostPort = int(os.getenv("HOSTPORT") or "10255") 

app = FastAPI(
    title="Email API",
    description="API for sending emails",
    version="1.0",
    root_path="/email"
)

@app.post("/", status_code=201)
def send_test_mail(
emailRequest: EmailRequest
):
    msg = EmailMessage()
    msg["Subject"] = "Professionelle Website für Ihr Unternehmen - Erstberatung"
    msg["From"] = "sender@example.com"
    msg["To"] = emailRequest.companyEmail

    text_content = createText(emailRequest.website)
    html_content = createHtml(emailRequest.website)

    msg.set_content(text_content)
    msg.add_alternative(html_content, subtype='html')
    
    try:
        with smtplib.SMTP(host, hostPort) as server:
            server.send_message(msg)
        return {"message": "message sent!"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/healz")
def health_check():
    """Unprotected health check endpoint"""
    return {"status": "ok"}

@app.get("/me") 
def get_user_info(user: dict = Depends(get_current_user)):
    """Return current user's token claims"""
    return {    
        "username": user.get("preferred_username"),
        "email": user.get("email"),
        "roles": user.get("realm_access", {}).get("roles", []),
        "full_payload": user
    }
