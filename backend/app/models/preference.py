from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import BigInteger, String, ForeignKey, PrimaryKeyConstraint
from app.db.base import Base

class MealPreference(Base): # Étkezési preferencia modell
    __tablename__ = "meal_preference" # Tábla neve
    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True) # Egyedi azonosító
    name: Mapped[str] = mapped_column(String(100), nullable=False, unique=True) # Preferencia neve

class UserMealPreference(Base): # Felhasználó és étkezési preferencia közötti kapcsolat
    __tablename__ = "user_meal_preference" # Kapcsolótábla
    user_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("users.id", ondelete="CASCADE"), nullable=False) # Felhasználó azonosító
    preference_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("meal_preference.id", ondelete="CASCADE"), nullable=False) # Preferencia azonosító
    __table_args__ = (
        PrimaryKeyConstraint("user_id", "preference_id", name="pk_user_meal_preference"), # Összetett elsődleges kulcs
    )