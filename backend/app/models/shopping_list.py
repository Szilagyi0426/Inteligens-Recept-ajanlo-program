from datetime import datetime
from sqlalchemy import Column, BigInteger, String, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from . import Base

class ShoppingList(Base):
    __tablename__ = "shopping_list"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    user_id = Column(BigInteger, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(120), nullable=False, default="Bevásárlólista")
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    is_active = Column(Boolean, nullable=False, default=True)
    last_generated_at = Column(DateTime)

    items = relationship("ShoppingListItem", back_populates="shopping_list", cascade="all, delete-orphan")