from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user
from app.models.user import User
from pydantic import BaseModel

router = APIRouter()

# DTO-k
class RoleUpdate(BaseModel):
    role_id: int

class StatusUpdate(BaseModel):
    disabled: bool

# Csak moderátorok és adminok érhetik el
def require_moderator(current_user: User = Depends(get_current_user)):
    if current_user.role_id < 1:  # 1: moderator, 2: admin
        raise HTTPException(status_code=403, detail="Nincs jogosultságod ehhez a művelethez")
    return current_user

# Összes felhasználó listázása
@router.get("/users")
def list_all_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_moderator)
):
    users = db.query(User).all()
    return [
        {
            "id": u.id,
            "username": u.username,
            "email": u.email,
            "full_name": u.full_name,
            "phone": u.phone,
            "role_id": u.role_id,
            "created_at": u.created_at.isoformat(),
            "updated_at": u.updated_at.isoformat(),
        }
        for u in users
    ]

# Felhasználó szerepkör módosítása
@router.patch("/users/{user_id}/role", status_code=204)
def update_user_role(
    user_id: int,
    payload: RoleUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_moderator)
):
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Felhasználó nem található")
    
    # Ne lehessen saját magad szerepkörét módosítani
    if user.id == current_user.id:
        raise HTTPException(status_code=400, detail="Nem módosíthatod a saját szerepkörödet")
    
    # Csak admin módosíthat admin jogot (adhat vagy elvehet)
    if payload.role_id >= 2 and current_user.role_id < 2:
        raise HTTPException(status_code=403, detail="Csak admin adhat admin jogosultságot")
    
    # Csak admin vehet el admin jogot
    if user.role_id >= 2 and current_user.role_id < 2:
        raise HTTPException(status_code=403, detail="Csak admin vehet el admin jogosultságot")
    
    user.role_id = payload.role_id
    db.add(user)
    db.commit()

# Felhasználó státusz módosítása (tiltás/engedélyezés)
@router.patch("/users/{user_id}/status", status_code=204)
def update_user_status(
    user_id: int,
    payload: StatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_moderator)
):
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Felhasználó nem található")
    
    # Ne lehessen saját magad tiltani
    if user.id == current_user.id:
        raise HTTPException(status_code=400, detail="Nem tilthatod le saját magad")
    
    # Státusz módosítása: -1 = tiltott, 0+ = aktív
    if payload.disabled:
        user.role_id = -1  # Tiltott státusz
    else:
        user.role_id = 0  # Visszaállítás user szerepkörre
    
    db.add(user)
    db.commit()

# Felhasználó törlése
@router.delete("/users/{user_id}", status_code=204)
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_moderator)
):
    # Csak admin törölhet felhasználót
    if current_user.role_id < 2:
        raise HTTPException(status_code=403, detail="Csak admin törölhet felhasználót")
    
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Felhasználó nem található")
    
    # Ne lehessen saját magad törölni
    if user.id == current_user.id:
        raise HTTPException(status_code=400, detail="Nem törölheted saját magad")
    
    db.delete(user)
    db.commit()
