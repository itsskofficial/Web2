import logging
import sys

from loguru import logger

from app.core.config import settings

class InterceptHandler(logging.Handler):
    """
    Default handler from loguru documentation.
    This handler intercepts standard logging messages and redirects them to Loguru.
    See: https://loguru.readthedocs.io/en/stable/overview.html#entirely-compatible-with-standard-logging
    """

    def emit(self, record: logging.LogRecord):
        # Get corresponding Loguru level if it exists
        try:
            level = logger.level(record.levelname).name
        except ValueError:
            level = record.levelno

        # Find caller from where originated the logged message
        frame, depth = logging.currentframe(), 2
        while frame and frame.f_code.co_filename == logging.__file__:
            frame = frame.f_back
            depth += 1

        logger.opt(depth=depth, exception=record.exc_info).log(
            level, record.getMessage()
        )

def setup_logging():
    """
    Configures the Loguru logger and intercepts standard logging.
    This function should be called once at application startup.
    """
    # Disable existing handlers from other libraries to avoid duplicate logs
    logging.basicConfig(handlers=[InterceptHandler()], level=0, force=True)
    
    # Remove the default loguru handler to add our custom one
    logger.remove()

    # Add a new handler with a rich, colorful format for better readability
    log_format = (
        "<green>{time:YYYY-MM-DD HH:mm:ss.SSS}</green> | "
        "<level>{level: <8}</level> | "
        "<cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - "
        "<level>{message}</level>"
    )
    
    # Configure the logger sink to output to stderr
    # In development, we enable backtrace and diagnose for richer error reports.
    logger.add(
        sys.stderr,
        level=settings.LOG_LEVEL.upper(),
        format=log_format,
        colorize=True,
        backtrace=settings.ENVIRONMENT == "development",
        diagnose=settings.ENVIRONMENT == "development",
    )

    logger.info("--- Logging configured successfully ---")
    logger.info(f"Log level set to: {settings.LOG_LEVEL.upper()}")
    logger.info(f"Running in '{settings.ENVIRONMENT}' environment.")