from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session, joinedload
from app.api.deps import get_db, get_current_user
from app.models import ShoppingList, ShoppingListItem, Recipe, Unit
from pydantic import BaseModel
from datetime import datetime

router = APIRouter()

class ShoppingListItemCreate(BaseModel):
    text: str
    recipe_id: int | None = None
    quantity: float | None = None
    unit_id: int | None = None

class ShoppingListItemUpdate(BaseModel):
    done: bool

@router.get("/", response_model=list[dict])  # ha van pydantic modelled, arra cseréld
def get_user_shopping_list(
        db: Session = Depends(get_db),
        current_user = Depends(get_current_user),
):
    # 1) user aktuális shopping listje
    shopping_list = (
        db.query(ShoppingList)
        .filter(ShoppingList.user_id == current_user.id)
        .first()
    )
    if not shopping_list:
        return []  # nincs listája

    # 2) hozzá tartozó tételek
    items = (
        db.query(ShoppingListItem)
        .options(joinedload(ShoppingListItem.recipe), joinedload(ShoppingListItem.unit))  # ha van relationship
        .filter(ShoppingListItem.shopping_list_id == shopping_list.id)
        .all()
    )

    # 3) csoportosítás recept szerint
    groups: dict[int | None, dict] = {}

    for item in items:
        recipe_id = item.recipe_id  # lehet None
        if recipe_id not in groups:
            # ha van recept, próbáld kinyerni a nevét
            recipe_name = (
                item.recipe.name if getattr(item, "recipe", None) is not None else None
            )
            groups[recipe_id] = {
                "id": str(recipe_id) if recipe_id is not None else "others",
                "name": recipe_name if recipe_name else "Others",
                "items": [],
            }

        groups[recipe_id]["items"].append(
            {
                "id": item.id,
                # ha ingredient_id van, akkor ingredient.name-et is ki lehetne nézni,
                # de most legyen a text, mert az biztosan van
                "name": item.text,
                "done": item.is_checked,
                # opcionálisan:
                "quantity": round(item.quantity, 1) if item.quantity is not None else None,
                "unit": item.unit.name if getattr(item, "unit", None) is not None else None,
            }
        )

    # 4) listává alakítás
    return list(groups.values())


@router.post("/item", response_model=dict)
def add_shopping_list_item(
        payload: ShoppingListItemCreate,
        db: Session = Depends(get_db),
        current_user = Depends(get_current_user),
):
    # user shopping listje ...
    shopping_list = (
        db.query(ShoppingList)
        .filter(ShoppingList.user_id == current_user.id)
        .first()
    )
    if not shopping_list:
        shopping_list = ShoppingList(
            user_id=current_user.id,
            created_at=datetime.utcnow(),
            last_generated_at=datetime.utcnow(),
        )
        db.add(shopping_list)
        db.flush()

    # ha 0-t kaptunk, tegyük None-ra, hogy ne sértsen FK-t
    unit_id = payload.unit_id if payload.unit_id not in (0, "0") else None
    recipe_id = payload.recipe_id if payload.recipe_id not in (0, "0") else None

    new_item = ShoppingListItem(
        shopping_list_id=shopping_list.id,
        text=payload.text,
        recipe_id=recipe_id,
        quantity=payload.quantity if payload.quantity not in (0, 0.0) else None,
        unit_id=unit_id,
        is_checked=False,
        # ha van ilyen oszlopod:
        # auto_generated=False,
    )
    db.add(new_item)
    db.commit()
    db.refresh(new_item)


    return {
        "id": new_item.id,
        "shopping_list_id": new_item.shopping_list_id,
        "name": new_item.text,
        "done": new_item.is_checked,
        "recipe_id": new_item.recipe_id,
        "quantity": new_item.quantity,
        "unit_id": new_item.unit_id,
    }


# DELETE endpoint to delete a shopping list item belonging to the current user
@router.delete("/item/{item_id}", response_model=dict)
def delete_shopping_list_item(
        item_id: int,
        db: Session = Depends(get_db),
        current_user = Depends(get_current_user),
):
    # find the item first
    item = db.query(ShoppingListItem).filter(ShoppingListItem.id == item_id).first()
    if not item:
        return {"deleted": False, "reason": "not found"}

    # check that the item's shopping list belongs to the current user
    shopping_list = db.query(ShoppingList).filter(ShoppingList.id == item.shopping_list_id).first()
    if not shopping_list or shopping_list.user_id != current_user.id:
        # do not delete items of another user
        return {"deleted": False, "reason": "forbidden"}

    db.delete(item)
    db.commit()
    return {"deleted": True}

@router.patch("/item/{item_id}", response_model=dict)
def update_shopping_list_item(
        item_id: int,
        payload: ShoppingListItemUpdate,
        db: Session = Depends(get_db),
        current_user = Depends(get_current_user),
):
    item = db.query(ShoppingListItem).filter(ShoppingListItem.id == item_id).first()
    if not item:
        return {"updated": False, "reason": "not found"}

    # csak a saját listáját módosíthatja
    shopping_list = db.query(ShoppingList).filter(ShoppingList.id == item.shopping_list_id).first()
    if not shopping_list or shopping_list.user_id != current_user.id:
        return {"updated": False, "reason": "forbidden"}

    item.is_checked = payload.done
    db.add(item)
    db.commit()
    db.refresh(item)

    return {
        "updated": True,
        "id": item.id,
        "done": item.is_checked,
    }


# New endpoint to list all units
@router.get("/units", response_model=list[dict])
def list_units(
        db: Session = Depends(get_db),
        current_user = Depends(get_current_user),
):
    units = db.query(Unit).order_by(Unit.id.asc()).all()
    return [
        {
            "id": u.id,
            "name": u.name,
        }
        for u in units
    ]