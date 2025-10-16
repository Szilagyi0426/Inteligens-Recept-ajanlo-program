from app.api.deps import get_db
from app.models.user import User
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import \
    OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.api.deps import get_db, create_access_token, get_current_user
from app.schemas.user import UserCreate, UserOut, Token, UserUpdate, ChangePassword, EmailChangeStart, EmailChangeConfirm
from app.models.user import User
from app.utils.password import hash_password, verify_password
from app.models.preference import MealPreference, UserMealPreference
from app.models.sensitivity import FoodSensitivity, UserSensitivity
from app.schemas.user import UserUpdateWithPassword

router = APIRouter()
# TODO: Jelszó módosítás, felhasználó adatok módosítása, felhasználó személyes nevének
# TODO: telefonszámának hozzáadása az adatbázishoz
# TODO: Jelszó változtatás, email cím változtatás (megerősítéssel)


# Az adott felhasználó étkezési preferenciáinak és érzékenységeinek kezelése

@router.post("/{user_id}/preferences/{pref_id}", status_code=204) # Felhasználói preferencia hozzáadása
def add_user_pref(user_id: int, pref_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)): 
    if current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Not allowed to modify another user's settings")
    if not db.get(User, user_id) or not db.get(MealPreference, pref_id): # Ellenőrzés, hogy létezik-e a user és a preference
        raise HTTPException(404, "user vagy preference nem létezik")
    link = UserMealPreference(user_id=user_id, preference_id=pref_id)
    db.merge(link)  
    db.commit()

@router.delete("/{user_id}/preferences/{pref_id}", status_code=204) # Felhasználói preferencia eltávolítása
def remove_user_pref(user_id: int, pref_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Not allowed to modify another user's settings")
    link = db.query(UserMealPreference).filter_by(user_id=user_id, preference_id=pref_id).first() # Lekérjük a kapcsolatot
    # Ha nincs ilyen kapcsolat, 404-et dobunk
    if not link:
        raise HTTPException(404, "kapcsolat nem létezik")
    db.delete(link); db.commit() # Kapcsolat törlése és commit

@router.post("/{user_id}/sensitivities/{sens_id}", status_code=204) # Felhasználói érzékenység hozzáadása
def add_user_sens(user_id: int, sens_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Not allowed to modify another user's settings")
    if not db.get(User, user_id) or not db.get(FoodSensitivity, sens_id):
        raise HTTPException(404, "user vagy sensitivity nem létezik")
    db.merge(UserSensitivity(user_id=user_id, sensitivity_id=sens_id)); db.commit()

@router.delete("/{user_id}/sensitivities/{sens_id}", status_code=204) # Felhasználói érzékenység eltávolítása
def remove_user_sens(user_id: int, sens_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Not allowed to modify another user's settings")
    link = db.query(UserSensitivity).filter_by(user_id=user_id, sensitivity_id=sens_id).first()
    if not link:
        raise HTTPException(404, "kapcsolat nem létezik")
    db.delete(link); db.commit()


# Felhasználói regisztráció, bejelentkezés, saját adatok lekérdezése

auth_router = APIRouter()

@auth_router.patch("/me", response_model=UserOut)
def update_me(payload: UserUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Require current password for any profile change
    if not verify_password(payload.current_password, current_user.password_hash):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    # Update allowed profile fields
    if payload.full_name is not None:
        current_user.full_name = payload.full_name
    if payload.phone is not None:
        current_user.phone = payload.phone
    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return current_user

@auth_router.post("/change-password", status_code=204)
def change_password(payload: ChangePassword, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Verify current password
    if not verify_password(payload.current_password, current_user.password_hash):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    # Optional: basic validation of new password length
    if len(payload.new_password) < 8:
        raise HTTPException(status_code=400, detail="New password must be at least 8 characters")
    current_user.password_hash = hash_password(payload.new_password)
    db.add(current_user)
    db.commit()

@auth_router.post("/email-change", status_code=204)
def email_change(payload: EmailChangeStart, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Require current password for email change
    if not verify_password(payload.current_password, current_user.password_hash):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    # Check new email uniqueness
    exists = db.query(User).filter(User.email == payload.new_email).first()
    if exists:
        raise HTTPException(status_code=409, detail="Email already in use")
    current_user.email = payload.new_email
    db.add(current_user)
    db.commit()

@auth_router.post("/register", response_model=UserOut, status_code=201)  # új felhasználó létrehozva
def register(payload: UserCreate, db: Session = Depends(get_db)):
    # ellenőrzés: egyedi username/email
    exists = db.query(User).filter((User.username == payload.username) | (User.email == payload.email)).first() 
    if exists: # Ha van ilyen felhasználó
        raise HTTPException(status_code=409, detail="username vagy email már létezik")

    user = User( # új felhasználó létrehozása
        username=payload.username,
        email=payload.email,
        password_hash=hash_password(payload.password),
        full_name=payload.full_name,
        phone=payload.phone,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@auth_router.post("/login", response_model=Token) # Bejelentkezés
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    # username vagy email alapján keresünk
    user = db.query(User).filter((User.username == form_data.username) | (User.email == form_data.username)).first()
    if not user or not verify_password(form_data.password, user.password_hash): # Ha nincs találat
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect username or password")
    token = create_access_token(subject=user.id)
    return {"access_token": token, "token_type": "bearer"} # OAuth2 szabvány

@auth_router.get("/me", response_model=UserOut) # Saját adatok lekérdezése
def read_me(current_user: User = Depends(get_current_user)):
    return current_user

@auth_router.put("/me", response_model=UserOut)
def update_me(
    payload: UserUpdateWithPassword,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Jelszó ellenőrzése
    if not verify_password(payload.current_password, current_user.password_hash):
        raise HTTPException(status_code=403, detail="Hibás jelszó")

    # Adatok frissítése
    if payload.username:
        current_user.username = payload.username
    if payload.email:
        current_user.email = payload.email

    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return current_user
# Felhasználó összes preferenciájának lekérdezése
@router.get("/{user_id}/preferences/", response_model=list[str])
def get_user_preferences(user_id: int, db: Session = Depends(get_db)):
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Lekérjük a userhez tartozó preferenciákat joinnal
    prefs = (
        db.query(MealPreference.name)
        .join(UserMealPreference, MealPreference.id == UserMealPreference.preference_id)
        .filter(UserMealPreference.user_id == user_id)
        .all()
    )
    # A lekérdezés tuple-öket ad vissza [(‘vegan’,), (‘vegetarian’,)], ezért flatteneljük
    return [p[0] for p in prefs]


# Felhasználó összes érzékenységének lekérdezése
@router.get("/{user_id}/sensitivities/", response_model=list[str])
def get_user_sensitivities(user_id: int, db: Session = Depends(get_db)):
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    sens = (
        db.query(FoodSensitivity.name)
        .join(UserSensitivity, FoodSensitivity.id == UserSensitivity.sensitivity_id)
        .filter(UserSensitivity.user_id == user_id)
        .all()
    )
    return [s[0] for s in sens]
