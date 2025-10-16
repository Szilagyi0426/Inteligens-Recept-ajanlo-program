from pydantic import BaseModel, EmailStr

class UserCreate(BaseModel): # Schema a felhasználó létrehozásához
    username: str
    email: EmailStr
    password: str

class UserOut(BaseModel): # Schema a felhasználó kimenetéhez
    id: int
    username: str
    email: EmailStr
    full_name: str
    phone: str
    class Config: from_attributes = True


class Token(BaseModel): # Schema a token kimenetéhez
    access_token: str
    token_type: str = "bearer"

class UserUpdate(BaseModel):
    current_password: str
    full_name: str | None = None
    phone: str | None = None


class ChangePassword(BaseModel):
    current_password: str
    new_password: str


class EmailChangeStart(BaseModel):
    current_password: str
    new_email: EmailStr


class EmailChangeConfirm(BaseModel):
    token: str