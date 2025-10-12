from datetime import datetime
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import BigInteger, DateTime, text, JSON, ForeignKey
from app.db.base import Base

class SearchHistory(Base):
    __tablename__ = "search_history" # Keresési előzmények táblázat

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True) # Egyedi azonosító
    user_id: Mapped[int] = mapped_column( 
        BigInteger, ForeignKey("users.id", ondelete="CASCADE"), # Felhasználó azonosító
        nullable=False, index=True
    )
    query: Mapped[dict] = mapped_column(JSON, nullable=False) # Keresési lekérdezés JSON formátumban
    created_at: Mapped[datetime] = mapped_column( # Létrehozás dátuma és időpontja
        DateTime(timezone=True),
        server_default=text("CURRENT_TIMESTAMP")
    )