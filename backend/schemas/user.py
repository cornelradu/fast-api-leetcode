from pydantic import BaseModel, EmailStr, Field

class UserCreate(BaseModel):
    email: EmailStr
    name: str
    password: str = Field(...,min_length=4)

class ShowUser(BaseModel):
    id: int
    email: EmailStr
    name: str
    is_active: bool

    class Config():
        orm_mode = True