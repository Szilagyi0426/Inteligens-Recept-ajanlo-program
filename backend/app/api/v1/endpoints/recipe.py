from typing import List, Optional
import random
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_, or_, func
import sqlalchemy as sa
from app.api.deps import get_db, get_current_user, get_current_user_optional
from app.schemas.recipe import RecipeOut, RecipeBase
from app.models.recipe import Recipe
from app.models.user import User
from app.models.review import Review
from app.models.favorite import Favorite
from app.models.selected_recipe import SelectedRecipe
from app.models.shopping_list import ShoppingList
from app.models.shopping_list_item import ShoppingListItem
from app.models.preference import UserMealPreference, MealPreference
from app.models.sensitivity import UserSensitivity, FoodSensitivity
from pydantic import BaseModel
from sqlalchemy.exc import IntegrityError

router = APIRouter()


class FavoriteUpdate(BaseModel):
    is_favorite: bool


class SelectedUpdate(BaseModel):
    selected: bool

@router.get("/", response_model=List[RecipeOut])
def list_recipes_full(
        db: Session = Depends(get_db),
        user_id: int | None = None,
):
    recipes = db.query(Recipe).all()

    if user_id is not None:
        favorite_ids = {
            row[0]
            for row in db.query(Favorite.recipe_id)
            .filter(Favorite.user_id == user_id)
            .all()
        }
        selected_ids = {
            row[0]
            for row in db.query(SelectedRecipe.recipe_id)
            .filter(SelectedRecipe.user_id == user_id)
            .all()
        }
    else:
        favorite_ids = set()
        selected_ids = set()

    for recipe in recipes:
        user = db.get(User, recipe.authorID)
        recipe.author_name = user.full_name if user and user.full_name else None
        reviews = db.query(Review).filter(Review.recipe_id == recipe.id).all()
        if reviews:
            recipe.average_rating = sum(r.rating for r in reviews) / len(reviews)
        else:
            recipe.average_rating = None
        recipe.reviews_count = len(reviews)

        # set is_favorite / is_selected depending on whether user_id was provided
        if user_id is not None:
            recipe.is_favorite = recipe.id in favorite_ids
            recipe.is_selected = recipe.id in selected_ids
        else:
            recipe.is_favorite = None
            recipe.is_selected = None

    return recipes


@router.get("/search", response_model=List[RecipeBase])
def search_recipes_by_profile(
        limit: int = 20,
        offset: int = 0,
        search_query: Optional[str] = Query(None, description="Keresési szöveg a recept nevében"),
        use_user_profile: bool = Query(False, description="Felhasználói profil szerinti szűrés"),
        db: Session = Depends(get_db),
        current_user: Optional[User] = Depends(get_current_user_optional),
):
    """
    Receptek keresése és szűrése a felhasználó profiljának megfelelően.
    - Kiszűri azokat a recepteket, amelyek tartalmazzák a felhasználó érzékenységeit (allergiáit)
    - Szűrhet a felhasználó étkezési preferenciái szerint (vegetáriánus, vegán, stb.)
    - Ha nincs bejelentkezett user, csak az alapvető keresés működik
    """
    query = db.query(Recipe).filter(Recipe.visibility == "public")
    
    # Szöveges keresés a recept nevében vagy leírásában
    if search_query:
        search_pattern = f"%{search_query}%"
        query = query.filter(
            or_(
                Recipe.name.ilike(search_pattern),
                Recipe.description.ilike(search_pattern)
            )
        )
    
    # Felhasználói profil alapú szűrés
    if use_user_profile and current_user:
        # Lekérjük a felhasználó érzékenységeit
        user_sensitivities = (
            db.query(FoodSensitivity.name)
            .join(UserSensitivity, UserSensitivity.sensitivity_id == FoodSensitivity.id)
            .filter(UserSensitivity.user_id == current_user.id)
            .all()
        )
        sensitivity_names = [s[0] for s in user_sensitivities]
        
        # Lekérjük a felhasználó preferenciáit
        user_preferences = (
            db.query(MealPreference.name)
            .join(UserMealPreference, UserMealPreference.preference_id == MealPreference.id)
            .filter(UserMealPreference.user_id == current_user.id)
            .all()
        )
        preference_names = [p[0] for p in user_preferences]
        
        # Kiszűrjük azokat a recepteket, amelyek tartalmazzák a felhasználó allergiáit
        # Használjunk SQL LIKE operátort JSON string kereséshez (kompatibilis minden adatbázissal)
        if sensitivity_names:
            for sensitivity in sensitivity_names:
                # Keressük meg a JSON tömbben a sensitivity értéket
                query = query.filter(
                    or_(
                        Recipe.allergens.is_(None),
                        ~Recipe.allergens.cast(sa.String).like(f'%"{sensitivity}"%')
                    )
                )
        
        # Szűrés preferenciák szerint (ha van preferencia, csak azokat a recepteket mutatja, amelyek megfelelnek)
        if preference_names:
            # Ha van preferencia, akkor a receptnek tartalmaznia kell legalább egy preferenciát
            pref_filters = []
            for pref in preference_names:
                # JSON string keresés LIKE operátorral
                pref_filters.append(
                    Recipe.dietary_tags.cast(sa.String).like(f'%"{pref}"%')
                )
            if pref_filters:
                query = query.filter(or_(*pref_filters))
    
    # Lekérjük a favorite és selected állapotokat (csak ha be van jelentkezve a user)
    if current_user:
        favorite_ids = {
            row[0]
            for row in db.query(Favorite.recipe_id)
            .filter(Favorite.user_id == current_user.id)
            .all()
        }
        selected_ids = {
            row[0]
            for row in db.query(SelectedRecipe.recipe_id)
            .filter(SelectedRecipe.user_id == current_user.id)
            .all()
        }
    else:
        favorite_ids = set()
        selected_ids = set()
    
    # Lapozás
    recipes = query.offset(offset).limit(limit).all()
    
    # Kiegészítő adatok hozzáadása
    for recipe in recipes:
        user = db.get(User, recipe.authorID)
        recipe.author_name = user.full_name if user and user.full_name else None
        reviews = db.query(Review).filter(Review.recipe_id == recipe.id).all()
        if reviews:
            recipe.average_rating = sum(r.rating for r in reviews) / len(reviews)
        else:
            recipe.average_rating = None
        recipe.reviews_count = len(reviews)
        recipe.is_favorite = recipe.id in favorite_ids if current_user else None
        recipe.is_selected = recipe.id in selected_ids if current_user else None
    
    return recipes


@router.get("/list", response_model=List[RecipeBase])
def list_recipes_brief(
        limit: int = 10,
        offset: int = 0,
        random_flag: bool = Query(False, alias="random"),
        db: Session = Depends(get_db),
        user_id: int | None = None,
):
    query = db.query(Recipe)

    if user_id is not None:
        favorite_ids = {
            row[0]
            for row in db.query(Favorite.recipe_id)
            .filter(Favorite.user_id == user_id)
            .all()
        }
        selected_ids = {
            row[0]
            for row in db.query(SelectedRecipe.recipe_id)
            .filter(SelectedRecipe.user_id == user_id)
            .all()
        }
    else:
        favorite_ids = set()
        selected_ids = set()

    if random_flag:
        total = query.count()
        if total == 0:
            raise HTTPException(status_code=404, detail="No recipes available")
        start = 0 if total <= limit else random.randint(0, total - limit)
        recipes = query.offset(start).limit(limit).all()
        for recipe in recipes:
            user = db.get(User, recipe.authorID)
            recipe.author_name = user.full_name if user and user.full_name else None
            reviews = db.query(Review).filter(Review.recipe_id == recipe.id).all()
            if reviews:
                recipe.average_rating = sum(r.rating for r in reviews) / len(reviews)
            else:
                recipe.average_rating = None
            recipe.reviews_count = len(reviews)

            if user_id is not None:
                recipe.is_favorite = recipe.id in favorite_ids
                recipe.is_selected = recipe.id in selected_ids
            else:
                recipe.is_favorite = None
                recipe.is_selected = None

        return recipes

    recipes = query.offset(offset).limit(limit).all()
    for recipe in recipes:
        user = db.get(User, recipe.authorID)
        recipe.author_name = user.full_name if user and user.full_name else None
        reviews = db.query(Review).filter(Review.recipe_id == recipe.id).all()
        if reviews:
            recipe.average_rating = sum(r.rating for r in reviews) / len(reviews)
        else:
            recipe.average_rating = None
        recipe.reviews_count = len(reviews)

        if user_id is not None:
            recipe.is_favorite = recipe.id in favorite_ids
            recipe.is_selected = recipe.id in selected_ids
        else:
            recipe.is_favorite = None
            recipe.is_selected = None

    return recipes

@router.get("/{recipe_id}", response_model=RecipeOut)
def get_recipe(
        recipe_id: int,
        db: Session = Depends(get_db),
):
    recipe = (
        db.query(Recipe)
        .options(
            joinedload(Recipe.ingredients),
            joinedload(Recipe.steps),
        )
        .filter(Recipe.id == recipe_id)
        .first()
    )
    if recipe:
        user = db.get(User, recipe.authorID)
        recipe.author_name = user.full_name if user and user.full_name else None
        reviews = db.query(Review).filter(Review.recipe_id == recipe.id).all()
        if reviews:
            recipe.average_rating = sum(r.rating for r in reviews) / len(reviews)
        else:
            recipe.average_rating = None
        recipe.reviews_count = len(reviews)

    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")
    return recipe



@router.post("/{recipe_id}/favorite")
def set_recipe_favorite(
    recipe_id: int,
    payload: FavoriteUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Mark or unmark a recipe as favorite for the current user.
    """
    recipe = db.query(Recipe).filter(Recipe.id == recipe_id).first()
    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")

    favorite = (
        db.query(Favorite)
        .filter(
            Favorite.user_id == current_user.id,
            Favorite.recipe_id == recipe_id,
        )
        .first()
    )

    try:
        if payload.is_favorite:
            # Add to favorites if not already there
            if not favorite:
                favorite = Favorite(user_id=current_user.id, recipe_id=recipe_id)
                db.add(favorite)
        else:
            # Remove from favorites if it exists
            if favorite:
                db.delete(favorite)

        db.commit()
    except IntegrityError:
        # If we hit a duplicate key error, rollback and treat it as already-favorited
        db.rollback()

    return {"recipe_id": recipe_id, "is_favorite": payload.is_favorite}


@router.post("/{recipe_id}/selected")
def set_recipe_selected(
    recipe_id: int,
    payload: SelectedUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Add or remove a recipe from the user's 'selectedRecipe' list.
    """
    recipe = db.query(Recipe).filter(Recipe.id == recipe_id).first()
    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")

    selected_entry = (
        db.query(SelectedRecipe)
        .filter(
            SelectedRecipe.user_id == current_user.id,
            SelectedRecipe.recipe_id == recipe_id,
        )
        .first()
    )
    try:
        if payload.selected:
            # Add to selected_recipe if not already there
            if not selected_entry:
                selected_entry = SelectedRecipe(
                    user_id=current_user.id,
                    recipe_id=recipe_id,
                    # servings will default to 1 from the model default
                )
                db.add(selected_entry)

            # Also add all ingredients of this recipe to the shopping list for the current user.
            # We avoid duplicates by checking for existing entries per shopping list + recipe + ingredient.
            # First, find or create an active shopping list for this user.
            shopping_list = (
                db.query(ShoppingList)
                .filter(
                    ShoppingList.user_id == current_user.id,
                    ShoppingList.is_active == True,
                )
                .order_by(ShoppingList.created_at.desc())
                .first()
            )
            if not shopping_list:
                shopping_list = ShoppingList(
                    user_id=current_user.id,
                    name="Bevásárlólista",
                )
                db.add(shopping_list)
                db.flush()  # ensure shopping_list.id is available

            if recipe.ingredients:
                for ing in recipe.ingredients:
                    # ing is a RecipeIngredient object, so it has ingredient_id (and typically quantity, unit_id),
                    # not a direct id field.
                    existing_item = (
                        db.query(ShoppingListItem)
                        .filter(
                            ShoppingListItem.shopping_list_id == shopping_list.id,
                            ShoppingListItem.recipe_id == recipe_id,
                            ShoppingListItem.ingredient_id == ing.ingredient_id,
                        )
                        .first()
                    )
                    if not existing_item:
                        ingredient_name = None
                        if getattr(ing, "ingredient", None) is not None:
                            ingredient_name = getattr(ing.ingredient, "name", None)

                        item = ShoppingListItem(
                            shopping_list_id=shopping_list.id,
                            ingredient_id=ing.ingredient_id,
                            recipe_id=recipe_id,
                            text=ingredient_name,
                            # quantity and unit_id are propagated from the recipe ingredient if available
                            quantity=getattr(ing, "quantity", None),
                            unit_id=getattr(ing, "unit_id", None),
                            auto_generated=True,
                        )
                        db.add(item)
        else:
            # Remove from selected_recipe if it exists
            if selected_entry:
                db.delete(selected_entry)
            # Also remove all shopping list items generated for this recipe
            shopping_list = (
                db.query(ShoppingList)
                .filter(
                    ShoppingList.user_id == current_user.id,
                    ShoppingList.is_active == True,
                )
                .order_by(ShoppingList.created_at.desc())
                .first()
            )
            if shopping_list:
                db.query(ShoppingListItem).filter(
                    ShoppingListItem.shopping_list_id == shopping_list.id,
                    ShoppingListItem.recipe_id == recipe_id,
                    ShoppingListItem.auto_generated == True
                ).delete(synchronize_session=False)
    
        db.commit()
    except IntegrityError:
        db.rollback()

    return {"recipe_id": recipe_id, "selected": payload.selected}
