from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from fastapi import Depends, APIRouter, status, HTTPException, Request, Header
from sqlalchemy.orm import Session

from backend.db.session import get_db
from backend.core.hashing import Hasher
from backend.db.repository.login import get_user_by_email
from backend.core.security import create_access_token
from jose import jwt, JWTError
from pydantic import BaseModel, EmailStr, Field
from backend.schemas.user import ShowUser

router = APIRouter()

def authenticate_user(email: str, password: str, db: Session):
    user = get_user_by_email(email=email, db=db)
    if not user:
        return False
    if not Hasher.verify_password(password, user.password):
        return False
    return user

class UserCredentials(BaseModel):
    email: str
    password: str


@router.post("/token")
def login_for_access_token(user: UserCredentials, db: Session = Depends(get_db)):
    user = authenticate_user(user.email, user.password, db)
    if not user:
        raise HTTPException(details="Incorect email or password", status_code=status.HTTP_401_UNAUTHORIZED)
    access_token = create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}    



def get_current_user(token: str = Header(default=None), db: Session = Depends(get_db)):
    credentials_exceptions = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credntials"
    )
    try:
        payload = jwt.decode(token, 'secret', algorithms=["HS256"])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exceptions
    except JWTError:
        raise credentials_exceptions

    user = get_user_by_email(email=email, db=db)
    if user is None:
        raise credentials_exceptions
    return user

@router.get("/user", response_model=ShowUser)
def get_user(token: str = Header(default=None), db: Session = Depends(get_db)):
    credentials_exceptions = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credntials"
    )
    try:
        payload = jwt.decode(token, 'secret', algorithms=["HS256"])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exceptions
    except JWTError:
        raise credentials_exceptions

    user = get_user_by_email(email=email, db=db)
    if user is None:
        raise credentials_exceptions
    return ShowUser(id=user.id, name=user.name, email=user.email, is_active=True)