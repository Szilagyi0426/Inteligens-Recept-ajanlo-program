from app.db.base import Base
from .user import User
from .profile import UserProfile
from .preference import MealPreference, UserMealPreference
from .sensitivity import FoodSensitivity, UserSensitivity
from .search_history import SearchHistory
from .recipe import Recipe
from .recipe_step import RecipeStep
from .ingredietns import Ingredient
from .recipe_ingredients import RecipeIngredient
from .nutrition import Nutrition
from .review import Review
from .shopping_list_item import ShoppingListItem
from .unit import Unit
from .shopping_list import ShoppingList

target_metadata = Base.metadata