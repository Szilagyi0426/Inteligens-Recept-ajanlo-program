from sqlalchemy import Column, BigInteger, DECIMAL, ForeignKey
from sqlalchemy.orm import relationship
from . import Base

class Nutrition(Base):
    __tablename__ = "nutrition"  # kisbetűs táblanév javasolt

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    recipe_id = Column(BigInteger, ForeignKey("recipes.id", ondelete="CASCADE"),
                       nullable=False, unique=True)
    kcal = Column(DECIMAL(8, 2))
    protein = Column(DECIMAL(8, 2))
    fat = Column(DECIMAL(8, 2))
    carbs = Column(DECIMAL(8, 2))
    sugar = Column(DECIMAL(8, 2))
    fiber = Column(DECIMAL(8, 2))

    recipe = relationship("Recipe", back_populates="nutrition")