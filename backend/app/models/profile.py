from datetime import datetime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import BigInteger, String, DateTime, text, ForeignKey
from app.db.base import Base

class UserProfile(Base): # Felhasználói profil modell
    __tablename__ = "user_profile" # Tábla neve

    user_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("users.id", ondelete="CASCADE"), # Felhasználó azonosító
        primary_key=True
    )
    area_code: Mapped[str | None] = mapped_column(String(10)) # Országkód
    updated_at: Mapped[datetime] = mapped_column( # Utolsó frissítés időpontja
        DateTime(timezone=True),
        server_default=text("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP") # Automatikus frissítés
    )

    user: Mapped["User"] = relationship(back_populates="profile") # Kapcsolat a User modellel