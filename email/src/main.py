from fastapi import FastAPI
import smtplib
from email.message import EmailMessage

app = FastAPI(
    title="Email API",
    description="API for sending emails",
    version="1.0",
    root_path="/email"
)

@app.get("/")
def send_test_mail(email:str = "michel@siegert.online", website: str= "https://michel.siegert.online" ):
    msg = EmailMessage()
    msg.set_content(website)
    msg["Subject"] = "testing mail"
    msg["From"] = "sender@example.com"
    msg["To"] = email
    try:
        with smtplib.SMTP("maildev", 1025) as server:
            server.send_message(msg)
        return {"status": "success", "message": "message sent!"}
    except Exception as e:
        return {"status": "error", "details": str(e)}

@app.get("/healz")
def send_test_mail():
    return {"status": "ok"}
