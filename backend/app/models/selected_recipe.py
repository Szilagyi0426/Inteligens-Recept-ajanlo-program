from datetime import datetime
from sqlalchemy import Column, BigInteger, Integer, DateTime, ForeignKey
from . import Base

class SelectedRecipe(Base):
    __tablename__ = "selected_recipe"

    user_id = Column(BigInteger, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    recipe_id = Column(BigInteger, ForeignKey("recipes.id", ondelete="CASCADE"), primary_key=True)
    servings = Column(Integer, nullable=False, default=1)
    added = Column(DateTime, nullable=False, default=datetime.utcnow)