from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.api.deps import get_db
from app.models.sensitivity import FoodSensitivity

router = APIRouter()

@router.get("/") # Ételérzékenységek lekérdezése
def list_sensitivities(db: Session = Depends(get_db)):
    return db.query(FoodSensitivity).order_by(FoodSensitivity.name).all()