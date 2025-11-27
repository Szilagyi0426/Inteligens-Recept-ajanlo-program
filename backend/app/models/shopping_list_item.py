from sqlalchemy import Column, BigInteger, String, DECIMAL, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from . import Base

class ShoppingListItem(Base):
    __tablename__ = "shopping_list_item"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    shopping_list_id = Column(BigInteger, ForeignKey("shopping_list.id", ondelete="CASCADE"),
                              nullable=False, index=True)
    ingredient_id = Column(BigInteger, ForeignKey("ingredients.id", ondelete="SET NULL"),
                           nullable=True, index=True)
    text = Column(String(255))  # szabad szöveges név, ha nincs ingredient_id
    quantity = Column(DECIMAL(10, 3))
    unit_id = Column(BigInteger, ForeignKey("units.id", ondelete="SET NULL"), nullable=True)
    is_checked = Column(Boolean, nullable=False, default=False)
    recipe_id = Column(BigInteger, ForeignKey("recipes.id", ondelete="SET NULL"), nullable=True)
    auto_generated = Column(Boolean, nullable=False, default=True)

    shopping_list = relationship("ShoppingList", back_populates="items")
    ingredient = relationship("Ingredient")
    unit = relationship("Unit", back_populates="shopping_items")
    recipe = relationship("Recipe", back_populates="shopping_items")