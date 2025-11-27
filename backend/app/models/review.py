from datetime import datetime
from sqlalchemy import Column, BigInteger, Integer, Text, DateTime, ForeignKey, UniqueConstraint, CheckConstraint
from sqlalchemy.orm import relationship
from . import Base

class Review(Base):
    __tablename__ = "review"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    user_id = Column(BigInteger, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    recipe_id = Column(BigInteger, ForeignKey("recipes.id", ondelete="CASCADE"), nullable=False, index=True)
    rating = Column(Integer, nullable=False)
    comment = Column(Text)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)

    __table_args__ = (
        UniqueConstraint("user_id", "recipe_id", name="uq_review_user_recipe"),
        CheckConstraint("rating BETWEEN 1 AND 5", name="ck_review_rating_range"),
    )

    recipe = relationship("Recipe", back_populates="reviews")