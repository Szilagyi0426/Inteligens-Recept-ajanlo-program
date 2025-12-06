from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field


class RecipeBase(BaseModel):
    id: int
    author_id: Optional[int] = Field(None, alias="authorID")
    author_name: Optional[str] = None
    name: str
    description: Optional[str] = None
    servings: Optional[int] = None
    total_minutes: Optional[int] = None
    visibility: Optional[str] = None
    dietary_tags: Optional[List[str]] = None
    allergens: Optional[List[str]] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    average_rating: Optional[float] = None
    is_favorite: Optional[bool] = None
    is_selected: Optional[bool] = None
    
    reviews_count: int = 0
    class Config:
        from_attributes = True
        populate_by_name = True
    

class RecipeStepOut(BaseModel):
    recipe_step_index: int = Field(..., description="1-based step index")
    text: str
    tip: Optional[str] = None

    class Config:
        from_attributes = True


class IngredientOut(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True


class UnitOut(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True


class RecipeIngredientOut(BaseModel):
    ingredient: IngredientOut
    unit: UnitOut
    quantity: float

    class Config:
        from_attributes = True


class RecipeOut(BaseModel):
    id: int
    author_id: Optional[int] = Field(None, alias="authorID")
    author_name: Optional[str] = None
    name: str
    description: Optional[str] = None
    servings: Optional[int] = None
    prep_minutes: Optional[int] = None
    cook_minutes: Optional[int] = None
    total_minutes: Optional[int] = None
    visibility: Optional[str] = None
    dietary_tags: Optional[List[str]] = None
    allergens: Optional[List[str]] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    is_favorite: Optional[bool] = None
    is_selected: Optional[bool] = None

    steps: List[RecipeStepOut] = Field(default_factory=list)
    ingredients: List[RecipeIngredientOut] = Field(default_factory=list)
    average_rating: Optional[float] = None
    reviews_count: int = 0

    class Config:
        from_attributes = True
        populate_by_name = True
