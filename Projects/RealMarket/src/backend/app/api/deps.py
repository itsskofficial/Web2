from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from firebase_admin import auth, exceptions
from loguru import logger

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token") # tokenUrl is not used, but required

async def get_current_user(token: str = Depends(oauth2_scheme)):
    """
    Dependency to verify Firebase ID token and get user data.
    """
    try:
        decoded_token = auth.verify_id_token(token)
        return decoded_token
    except exceptions.FirebaseError as e:
        logger.warning(f"Invalid Firebase token: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except ValueError as e:
        # This can happen if the token is malformed
        logger.warning(f"Malformed Firebase token: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Malformed authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )