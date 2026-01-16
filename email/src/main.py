from fastapi import FastAPI
import smtplib
from email.message import EmailMessage

app = FastAPI()

@app.get("/")
def send_test_mail():
    msg = EmailMessage()
    msg.set_content("test mail!")
    msg["Subject"] = "testing mail from "
    msg["From"] = "sender@example.com"
    msg["To"] = "receiver@example.com"
    try:
        with smtplib.SMTP("maildev", 1025) as server:
            server.send_message(msg)
        return {"status": "success", "message": "Email sent to MailDev"}
    except Exception as e:
        return {"status": "error", "details": str(e)}
