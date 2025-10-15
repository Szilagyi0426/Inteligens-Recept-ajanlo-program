from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.api.deps import get_db
from app.models.preference import MealPreference

router = APIRouter()

@router.get("/") # Étkezési preferenciák lekérdezése
def list_preferences(db: Session = Depends(get_db)):
    return db.query(MealPreference).order_by(MealPreference.name).all()