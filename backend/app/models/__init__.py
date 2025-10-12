from app.db.base import Base
from .user import User
from .profile import UserProfile
from .preference import MealPreference, UserMealPreference
from .sensitivity import FoodSensitivity, UserSensitivity
from .search_history import SearchHistory

target_metadata = Base.metadata