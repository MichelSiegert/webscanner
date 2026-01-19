from .crypto import get_current_user
from fastapi import FastAPI, Depends
import smtplib
from email.message import EmailMessage

app = FastAPI(
    title="Email API",
    description="API for sending emails",
    version="1.0",
    root_path="/email"
)

@app.get("/")
def send_test_mail(
    #user: dict = Depends(get_current_user),
    email: str = "michel@siegert.online",
    website: str = "https://michel.siegert.online"
):
    """Protected endpoint - requires valid JWT"""
    msg = EmailMessage()
    msg["Subject"] = "Professionelle Website für Ihr Unternehmen - Erstberatung"
    msg["From"] = "sender@example.com"
    msg["To"] = email

    text_content = """
    Sehr geehrte Damen und Herren,

    viele Kunden suchen heute online nach Dienstleistungen und treffen ihre Entscheidung oft basierend auf dem ersten Eindruck einer Website.
    
    Ich habe bemerkt, dass Ihr Unternehmen bisher noch keine eigene Website hat. Als erfahrener Web-Entwickler unterstütze ich Unternehmen dabei, online professionell sichtbar zu werden und neue Kunden zu gewinnen.

    Über mich:
    - 4 Jahre Erfahrung im Web Development
    - Bachelor in Informatik
    - Spezialisiert auf den Mittelstand und kleine Unternehmen

    Gerne unterstütze ich Sie dabei, eine ansprechende Seite zu gestalten, die bei Google gut gefunden wird. Hätten Sie Interesse an einem kurzen, kostenlosen Beratungsgespräch?

    Beste Grüße,

    Michel Siegert
    Waisenhofstraße 27, 24103 Kiel
    Mobil: +49 177 8720796
    Website: https://siegert.online/
    """

    html_content = f"""
    <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px;">
                <p>    Sehr geehrte Damen und Herren,</p>
                
                <p>viele Kunden suchen heute online nach Dienstleistungen. Dabei entscheidet oft der <strong>erste digitale Eindruck</strong> darüber, wer den Zuschlag erhält.</p>
                
                <p>Mir ist aufgefallen, dass Ihr Unternehmen aktuell noch nicht mit einer eigenen Website vertreten ist. Ich helfe Betrieben wie Ihrem dabei, diesen wichtigen Schritt zu gehen und professionell sichtbar zu werden.</p>
                
                <h3 style="color: #2c3e50;">Warum mit mir zusammenarbeiten?</h3>
                <ul>
                    <li><strong>Erfahrung:</strong> 4 Jahre Web Development & Bachelor in Informatik.</li>
                    <li><strong>Fokus:</strong> Maßgeschneiderte Lösungen für kleine und mittelständische Unternehmen.</li>
                    <li><strong>Sichtbarkeit:</strong> Optimierung für Google (SEO), damit Sie gefunden werden.</li>
                </ul>

                <p>Hätten Sie Zeit für ein kurzes, unverbindliches Beratungsgespräch?</p>

                <p>Beste Grüße<br>
                <strong>Michel Siegert</strong></p>
                
                <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                
                <div style="font-size: 0.85em; color: #777;">
                    Waisenhofstraße 27, 24103 Kiel<br>
                    Mobil: <a href="tel:+491778720796" style="color: #3498db;">+49 177 8720796</a><br>
                    Web: <a href="https://siegert.online/" style="color: #3498db;">siegert.online</a><br>
                </div>
            </div>
        </body>
    </html>
    """

    msg.set_content(text_content)

    msg.add_alternative(html_content, subtype='html')
    
    try:
        with smtplib.SMTP("maildev", 10255) as server:
            server.send_message(msg)
        return {
            "status": "success",
            "message": "message sent!",
            #"sent_by": user.get("preferred_username")
        }
    except Exception as e:
        return {"status": "error", "details": str(e)}


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