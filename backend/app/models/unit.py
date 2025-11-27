from sqlalchemy import Column, BigInteger, String
from sqlalchemy.orm import relationship
from . import Base

class Unit(Base):
    __tablename__ = "units"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    name = Column(String(50), nullable=False, unique=True)

    ingredient_links = relationship("RecipeIngredient", back_populates="unit")
    shopping_items = relationship("ShoppingListItem", back_populates="unit")