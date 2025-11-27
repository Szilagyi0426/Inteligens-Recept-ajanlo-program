from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from app.core.config import settings
from app.utils.password import hash_password
import smtplib
from email.message import EmailMessage
from sqlalchemy.orm import Session
from app.api.deps import get_db
from app.models.user import User
from app.schemas.reset import ResetPasswordPayload, ForgotPasswordRequest
from itsdangerous import URLSafeTimedSerializer, BadSignature, SignatureExpired

reset_router = APIRouter(tags=["auth"])

serializer = URLSafeTimedSerializer(settings.SECRET_KEY)

# Helper function to send reset email
def send_reset_email(to_email: str, reset_link: str):
    msg = EmailMessage()
    msg["Subject"] = "Password reset"
    msg["From"] = getattr(settings, "EMAIL_FROM", None)
    msg["To"] = to_email
    msg.set_content(f"Click the following link to reset your password:\n{reset_link}")

    smtp_host = getattr(settings, "SMTP_HOST", None)
    smtp_port = getattr(settings, "SMTP_PORT", 587)
    smtp_user = getattr(settings, "SMTP_USER", None)
    smtp_pass = getattr(settings, "SMTP_PASSWORD", None)

    print(f"[reset] SMTP_HOST={smtp_host}")
    print(f"[reset] SMTP_USER={smtp_user}")
    print(f"[reset] password set? {'yes' if smtp_pass else 'no'}")

    if not smtp_host:
        print(f"[reset] Would send email to {to_email} with link: {reset_link}")
        return

    try:
        with smtplib.SMTP(smtp_host, smtp_port) as server:
            server.starttls()
            print("[reset] TLS ok")

            if smtp_user and smtp_pass:
                try:
                    server.login(smtp_user, smtp_pass)
                    print("[reset] login ok")
                except smtplib.SMTPAuthenticationError as e:
                    print(f"[reset][AUTH ERROR] {e} -> NOT sending mail")
                    return

            server.send_message(msg)
            print("[reset] email sent")
    except Exception as e:
        print(f"[reset][ERROR] could not send email: {type(e).__name__}: {e}")


@reset_router.post("/forgot-password")
def forgot_password(
        payload: ForgotPasswordRequest,
        background_tasks: BackgroundTasks,
        db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="Email address not found")

    # 👇 titkos/aláírt token generálása
    token = serializer.dumps({"user_id": user.id}, salt=settings.RESET_PASSWORD_TOKEN)

    # frontend URL (olvassuk settingsből, de legyen default)
    frontend_base = getattr(settings, "FRONTEND_BASE", "http://localhost:3000")
    # token query paramban megy
    reset_link = f"{frontend_base}/reset-password?token={token}"

    background_tasks.add_task(send_reset_email, user.email, reset_link)
    return {"message": "Password reset link generated", "reset_link": reset_link}


@reset_router.post("/reset-password")
def reset_password(payload: ResetPasswordPayload, db: Session = Depends(get_db)):
    # token visszafejtése
    try:
        data = serializer.loads(
            payload.token,
            salt=settings.RESET_PASSWORD_TOKEN,
            max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES,
        )
    except SignatureExpired:
        raise HTTPException(status_code=400, detail="Reset link expired")
    except BadSignature:
        raise HTTPException(status_code=400, detail="Invalid reset token")

    user_id = data.get("user_id")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.password_hash = hash_password(payload.new_password)
    db.add(user)
    db.commit()
    db.refresh(user)

    return {"message": "Password updated successfully"}