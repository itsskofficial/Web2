import json
import firebase_admin
from firebase_admin import credentials
from loguru import logger
from app.core.config import settings

def initialize_firebase():
    """
    Initializes the Firebase Admin SDK.
    """
    service_account_json_str = settings.FIREBASE_SERVICE_ACCOUNT_JSON
    if not service_account_json_str:
        logger.warning("FIREBASE_SERVICE_ACCOUNT_BASE64 not set. Firebase Admin SDK not initialized. API will not be protected.")
        return

    try:
        service_account_info = json.loads(service_account_json_str)
        cred = credentials.Certificate(service_account_info)
        firebase_admin.initialize_app(cred, {
            'projectId': settings.FIREBASE_PROJECT_ID,
        })
        logger.info("Firebase Admin SDK initialized successfully.")
    except Exception as e:
        logger.critical(f"Failed to initialize Firebase Admin SDK: {e}")
        # Depending on policy, you might want to exit the application
        # raise SystemExit("Could not initialize Firebase Admin SDK.")