from sqlalchemy import Column, BigInteger, String
from sqlalchemy.orm import relationship
from . import Base

class Ingredient(Base):
    __tablename__ = "ingredients"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    name = Column(String(150), nullable=False, unique=True)

    recipe_links = relationship("RecipeIngredient", back_populates="ingredient")