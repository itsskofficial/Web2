from fastapi import FastAPI
from loguru import logger

from app.api.v1 import endpoints
from app.core.firebase import initialize_firebase
from app.core.logging_config import setup_logging

# --- Logging Setup ---
# This must be called BEFORE the app is created to ensure
# all startup logs are captured correctly.
setup_logging()

# --- FastAPI App Initialization ---
app = FastAPI(
    title="CapMatch Market Data API",
    description="An API to fetch market context data for commercial real estate.",
    version="1.0.0",
)

# --- Event Handlers ---
@app.on_event("startup")
async def startup_event():
    logger.info("Application startup...")
    initialize_firebase()

@app.on_event("shutdown")
async def shutdown_event():
    logger.info("Application shutdown.")

# --- Router Inclusion ---
# Include the router from our endpoints module
# All routes in the router will be prefixed with /api/v1
app.include_router(endpoints.router, prefix="/api/v1", tags=["Market Data"])
logger.info("Router '/api/v1' included successfully.")


@app.get("/", tags=["Health Check"])
async def read_root():
    """A simple health check endpoint."""
    logger.debug("Health check endpoint '/' was hit.")
    return {"status": "ok", "message": "Welcome to the CapMatch API"}
