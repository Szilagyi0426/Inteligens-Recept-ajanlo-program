from datetime import datetime
from sqlalchemy import Column, BigInteger, Integer, String, Text, Enum, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from . import Base
from .recipe_step import RecipeStep

class Recipe(Base):
    __tablename__ = "recipes"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    authorID = Column(BigInteger, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(200), nullable=False)
    description = Column(Text)
    servings = Column(Integer, nullable=False, default=1)
    prep_minutes = Column(Integer)
    cook_minutes = Column(Integer)
    total_minutes = Column(Integer)  # opcionálisan számolható
    visibility = Column(Enum("public", "pending", "hidden", name="recipe_visibility"),
                        nullable=False, default="public")
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Kapcsolatok (nem kötelezőek, de hasznosak)
    steps = relationship("RecipeStep", back_populates="recipe", cascade="all, delete-orphan",
                         order_by=lambda: RecipeStep.recipe_step_index)
    ingredients = relationship("RecipeIngredient", back_populates="recipe", cascade="all, delete-orphan")
    nutrition = relationship("Nutrition", back_populates="recipe", uselist=False, cascade="all, delete-orphan")
    reviews = relationship("Review", back_populates="recipe", cascade="all, delete-orphan")
    shopping_items = relationship("ShoppingListItem", back_populates="recipe")