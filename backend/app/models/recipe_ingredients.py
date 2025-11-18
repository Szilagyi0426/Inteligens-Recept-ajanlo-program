from sqlalchemy import Column, BigInteger, DECIMAL, ForeignKey
from sqlalchemy.orm import relationship
from . import Base

class RecipeIngredient(Base):
    __tablename__ = "recipe_ingredients"

    # A te specifikációd szerint nincs külön id: composite PK
    ingredient_id = Column(BigInteger, ForeignKey("ingredients.id", ondelete="RESTRICT"), primary_key=True)
    recipe_id = Column(BigInteger, ForeignKey("recipes.id", ondelete="CASCADE"), primary_key=True)
    unit_id = Column(BigInteger, ForeignKey("units.id", ondelete="SET NULL"), nullable=True)
    quantity = Column(DECIMAL(10, 3))

    recipe = relationship("Recipe", back_populates="ingredients")
    ingredient = relationship("Ingredient", back_populates="recipe_links")
    unit = relationship("Unit", back_populates="ingredient_links")