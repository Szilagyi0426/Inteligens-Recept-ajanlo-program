from datetime import datetime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, BigInteger, SmallInteger, DateTime, text
from datetime import datetime
from app.db.base import Base

class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True) # Egyedi azonosító
    username: Mapped[str] = mapped_column(String(50), nullable=False, index=True) # Felhasználónév
    email: Mapped[str] = mapped_column(String(254), nullable=False, index=True) # Email cím
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False) # Jelszó hashelve
    role_id: Mapped[int] = mapped_column(SmallInteger, nullable=False, server_default="0") # Felhasználói szerepkör
    created_at: Mapped[datetime] = mapped_column( # Létrehozás dátuma
        DateTime(timezone=True),
        server_default=text("CURRENT_TIMESTAMP") # Alapértelmezett érték a létrehozás időpontja
    )
    updated_at: Mapped[datetime] = mapped_column( # Utolsó frissítés dátuma
        DateTime(timezone=True),
        server_default=text("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP") # Alapértelmezett érték a létrehozás időpontja, frissül minden módosításnál
    )

    profile: Mapped["UserProfile"] = relationship(back_populates="user", uselist=False, cascade="all, delete-orphan") # Egy-az-egyhez kapcsolat a felhasználói profillal
    preferences: Mapped[list["UserMealPreference"]] = relationship(cascade="all, delete-orphan") # Egy-a-többhöz kapcsolat az étkezési preferenciákkal
    sensitivities: Mapped[list["UserSensitivity"]] = relationship(cascade="all, delete-orphan") # Egy-a-többhöz kapcsolat az érzékenységekkel
    searches: Mapped[list["SearchHistory"]] = relationship(cascade="all, delete-orphan") # Egy-a-többhöz kapcsolat a keresési előzményekkel