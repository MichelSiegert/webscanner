from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import smtplib
from email.message import EmailMessage
import httpx
from jose import jwt, jwk, JWTError
from jose.utils import base64url_decode
from functools import lru_cache
from typing import Optional
import time

KEYCLOAK_URL = "http://keycloak:8080" 
REALM = "email-api"
CLIENT_ID = "python-backend"

ISSUER = f"{KEYCLOAK_URL}/realms/{REALM}"
JWKS_URL = f"{ISSUER}/protocol/openid-connect/certs"

app = FastAPI(
    title="Email API",
    description="API for sending emails",
    version="1.0",
    root_path="/email"
)

security = HTTPBearer(auto_error=False)

_jwks_cache = {"keys": None, "fetched_at": 0}

def get_jwks() -> dict:
    """Fetch and cache Keycloak's public keys"""
    if _jwks_cache["keys"] is None or time.time() - _jwks_cache["fetched_at"] > 300:
        response = httpx.get(JWKS_URL, timeout=10)
        response.raise_for_status()
        _jwks_cache["keys"] = response.json()
        _jwks_cache["fetched_at"] = time.time()
    return _jwks_cache["keys"]


def get_signing_key(token: str) -> dict:
    """Find the correct key from JWKS to verify the token"""
    jwks = get_jwks()
    
    header = jwt.get_unverified_header(token)
    kid = header.get("kid")
    
    for key in jwks.get("keys", []):
        if key.get("kid") == kid:
            return key
    
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Unable to find appropriate key"
    )


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
) -> dict:
    """Validate JWT token and return user info"""
    
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    token = credentials.credentials
    
    try:
        signing_key = get_signing_key(token)
        
        payload = jwt.decode(
            token,
            signing_key,
            algorithms=["RS256"],
            audience="account",  
            issuer=ISSUER,
            options={
                "verify_aud": False,
                "verify_iss": True,
                "verify_exp": True,
            }
        )
        
        return payload
        
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except JWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid token: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )



@app.get("/")
def send_test_mail(
    user: dict = Depends(get_current_user),
    email: str = "michel@siegert.online",
    website: str = "https://michel.siegert.online"
):
    """Protected endpoint - requires valid JWT"""
    msg = EmailMessage()
    msg.set_content(website)
    msg["Subject"] = "testing mail"
    msg["From"] = "sender@example.com"
    msg["To"] = email
    
    try:
        with smtplib.SMTP("maildev", 1025) as server:
            server.send_message(msg)
        return {
            "status": "success",
            "message": "message sent!",
            "sent_by": user.get("preferred_username")
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