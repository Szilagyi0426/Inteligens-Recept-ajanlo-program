from fastapi import APIRouter
from .endpoints import users, prefs, sens, history
from .endpoints.users import auth_router as auth

api_router = APIRouter()

# feature routers
api_router.include_router(users.router, prefix="/users", tags=["users"]) # Felhasználóhoz kapcsolódó végpontok
api_router.include_router(prefs.router, prefix="/preferences", tags=["preferences"]) # Étkezési preferenciákhoz kapcsolódó végpontok
api_router.include_router(sens.router, prefix="/sensitivities", tags=["sensitivities"]) # Ételérzékenységekhez kapcsolódó végpontok
api_router.include_router(history.router, prefix="/search-history", tags=["search-history"]) # Keresési előzményekhez kapcsolódó végpontok

# auth
api_router.include_router(auth, prefix="/auth", tags=["auth"]) # Hitelesítéshez kapcsolódó végpontok