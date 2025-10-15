from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.api.deps import get_db
from app.models.search_history import SearchHistory

router = APIRouter()

@router.post("/{user_id}") # Felhasználó keresési előzményeinek hozzáadása
def add_history(user_id: int, query: dict, db: Session = Depends(get_db)):
    rec = SearchHistory(user_id=user_id, query=query)
    db.add(rec); db.commit(); db.refresh(rec)
    return rec

@router.get("/{user_id}") # Felhasználó keresési előzményeinek lekérdezése
def get_history(user_id: int, db: Session = Depends(get_db)):
    return db.query(SearchHistory).filter(SearchHistory.user_id == user_id).all()