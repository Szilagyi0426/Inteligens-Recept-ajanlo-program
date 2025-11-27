from datetime import datetime
from sqlalchemy import Column, BigInteger, DateTime, ForeignKey
from . import Base

class Favorite(Base):
    __tablename__ = "favorite"

    user_id = Column(BigInteger, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    recipe_id = Column(BigInteger, ForeignKey("recipes.id", ondelete="CASCADE"), primary_key=True)
    added = Column(DateTime, nullable=False, default=datetime.utcnow)