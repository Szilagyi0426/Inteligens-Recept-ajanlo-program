from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import BigInteger, String, ForeignKey, PrimaryKeyConstraint
from app.db.base import Base

class FoodSensitivity(Base): # Ételérzékenység modell
    __tablename__ = "food_sensitivity"
    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True) # Egyedi azonosító
    name: Mapped[str] = mapped_column(String(100), nullable=False, unique=True) # Ételérzékenység neve

class UserSensitivity(Base):
    __tablename__ = "user_sensitivity" # Felhasználó és ételérzékenység közötti kapcsolat
    user_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("users.id", ondelete="CASCADE"), nullable=False) # Felhasználó azonosító
    sensitivity_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("food_sensitivity.id", ondelete="CASCADE"), nullable=False) # Ételérzékenység azonosító
    __table_args__ = (
        PrimaryKeyConstraint("user_id", "sensitivity_id", name="pk_user_sensitivity"), # Összetett elsődleges kulcs
    )