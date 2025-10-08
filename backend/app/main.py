from fastapi import FastAPI

app = FastAPI(title="Intelligens Recept Ajánló API")

@app.get("/")
def root():
    return {"message": "API működik 🎉"}