from pydantic import BaseModel, EmailStr

class ResetPasswordPayload(BaseModel):
    token: str
    new_password: str

class ForgotPasswordRequest(BaseModel):
    email: EmailStr