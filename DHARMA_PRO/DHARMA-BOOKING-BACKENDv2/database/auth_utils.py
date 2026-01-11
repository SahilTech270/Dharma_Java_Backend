from datetime import datetime, timedelta
from jose import jwt, JWTError

SECRET_KEY = "secret_key"   # used to sign tokens
ALGORITHM = "HS256"                    # hashing algorithm for JWT
ACCESS_TOKEN_EXPIRE_MINUTES = 100      # token expiry time

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})     
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def verify_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None
