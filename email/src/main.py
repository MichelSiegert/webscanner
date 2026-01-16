from fastapi import FastAPI
import smtplib
from email.message import EmailMessage

app = FastAPI(
    title="Email Test API",
    description="A simple API to test sending emails via MailDev",
    version="1.0.0"
)

@app.get("/send-email", tags=["Email"], summary="Send a test email")
def send_email():
    """
    Sends a test email to your MailDev instance.
    """
    msg = EmailMessage()
    msg.set_content("This is a test email from FastAPI!")
    msg["Subject"] = "FastAPI MailDev Test"
    msg["From"] = "sender@example.com"
    msg["To"] = "receiver@example.com"
    
    try:
        with smtplib.SMTP("maildev", 1025, timeout=10) as server:
            server.send_message(msg)
        return {"status": "success", "message": "Email sent to MailDev successfully"}
    except smtplib.SMTPConnectError:
        return {"status": "error", "details": "Failed to connect to MailDev. Is the service running?"}
    except Exception as e:
        return {"status": "error", "details": str(e)}

@app.get("/health", tags=["Health"], summary="Health check endpoint")
def health_check():
    """
    Verify the API is operational.
    """
    return {"status": "ok", "service": "Email Test API", "version": "1.0.0"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000
    )