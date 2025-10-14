from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api.deps import get_db
from app.models.user import User
from app.schemas.user import ForgotPasswordRequest

reset_router = APIRouter()

@reset_router.post("/forgot-password")
def forgot_password(payload: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="Nincs ilyen email cím")
    
    # Itt generálnál egy token-t, de most csak egy szöveget adunk vissza
    reset_link = f"http://localhost:8000/reset-password/{user.id}"
    return {"message": "Jelszó módosítás", "reset_link": reset_link}