from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from app.db.session import SessionLocal
from app.core.config import settings
from app.models.user import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login") # OAuth2 jelszavas bejelentkezés token URL-je
optional_oauth2_scheme = HTTPBearer(auto_error=False) # Opcionális OAuth2 séma

def get_db(): # Adatbázis kapcsolat kezelése
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def create_access_token(subject: str | int, expires_minutes: Optional[int] = None) -> str: # Hozzáférési token létrehozása
    expire = datetime.now(tz=timezone.utc) + timedelta(minutes=expires_minutes or settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode = {"sub": str(subject), "exp": expire} # A "sub" mező a felhasználó azonosítóját tartalmazza
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM) # JWT token visszaadása

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User: # Aktuális felhasználó lekérdezése a token alapján
    credentials_exception = HTTPException( 
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]) # Token dekódolása
        sub: str | None = payload.get("sub")
        if sub is None:
            raise credentials_exception # Ha nincs "sub" mező, kivétel dobása
    except JWTError:
        raise credentials_exception # JWT hiba esetén kivétel dobása
    user = db.get(User, int(sub)) # Felhasználó lekérdezése az adatbázisból a "sub" mező alapján
    if user is None:
        raise credentials_exception # Ha a felhasználó nem létezik, kivétel dobása
    return user

def get_current_user_optional(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(optional_oauth2_scheme),
    db: Session = Depends(get_db)
) -> Optional[User]:
    """Opcionális user lekérés - nem dob hibát, ha nincs token"""
    if credentials is None:
        return None
    
    try:
        token = credentials.credentials
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        sub: str | None = payload.get("sub")
        if sub is None:
            return None
        user = db.get(User, int(sub))
        return user
    except (JWTError, ValueError):
        return None