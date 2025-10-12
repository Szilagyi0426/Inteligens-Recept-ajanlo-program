from pydantic import BaseModel, EmailStr

class UserCreate(BaseModel): # Schema a felhasználó létrehozásához
    username: str
    email: EmailStr
    password: str

class UserOut(BaseModel): # Schema a felhasználó kimenetéhez
    id: int
    username: str
    email: EmailStr
    class Config: from_attributes = True


class Token(BaseModel): # Schema a token kimenetéhez
    access_token: str
    token_type: str = "bearer"