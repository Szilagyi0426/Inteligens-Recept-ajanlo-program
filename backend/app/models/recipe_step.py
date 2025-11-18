from sqlalchemy import Column, BigInteger, Integer, Text, String, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from . import Base

class RecipeStep(Base):
    __tablename__ = "recipe_step"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    recipe_id = Column(BigInteger, ForeignKey("recipes.id", ondelete="CASCADE"), nullable=False, index=True)
    recipe_step_index = Column(Integer, nullable=False)  # 1,2,3...
    text = Column(Text, nullable=False)
    tip = Column(String(255))

    __table_args__ = (
        UniqueConstraint("recipe_id", "recipe_step_index", name="uq_recipe_step_recipe_pos"),
    )

    recipe = relationship("Recipe", back_populates="steps")