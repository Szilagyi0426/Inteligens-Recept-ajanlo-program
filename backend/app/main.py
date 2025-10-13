from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.router import api_router

app = FastAPI( #App inicializálása
    title="Recipe Recommender API",
    redirect_slashes=False,
    docs_url="/api/docs",
    openapi_url="/api/openapi.json",
)

# CORS
app.add_middleware( #Middleware hozzáadása a CORS kezeléséhez
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(api_router, prefix="/api/v1") #API router hozzáadása a /api/v1 prefix-szel

# Health & root
@app.get("/healthz") # Health ellenőrző végpont
def healthz():
    return {"status": "ok"}

@app.get("/") # Gyökér végpont
def root():
    return {
        "name": "Recipe Recommender API",
        "docs": "/api/docs",
        "openapi": "/api/openapi.json",
        "api": "/api/v1",
    }