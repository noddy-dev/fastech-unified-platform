"""
Agent Logging Module

Purpose: Centralized logging configuration and utilities
Responsibilities:
  - Configure logging with file and console handlers
  - Provide logger instances to all components
  - Rotate log files to manage disk space
  - Support different log levels
  - Format logs consistently across the application

Usage: Import logger and use in any module
Example: from agent.core.logger import get_logger
         logger = get_logger(__name__)
         logger.info('Agent started')
"""

import logging
import logging.handlers
from typing import Optional
from agent.core.config import get_config


# Global logger cache
_loggers = {}


def configure_logging() -> None:
    """Configure root logger with file and console handlers"""
    config = get_config()
    
    root_logger = logging.getLogger()
    root_logger.setLevel(config.log_level)
    
    # Console handler (always at INFO or higher)
    console_handler = logging.StreamHandler()
    console_handler.setLevel(logging.INFO)
    console_formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    console_handler.setFormatter(console_formatter)
    
    # File handler with rotation
    file_handler = logging.handlers.RotatingFileHandler(
        config.log_file,
        maxBytes=10 * 1024 * 1024,  # 10MB
        backupCount=5
    )
    file_handler.setLevel(config.log_level)
    file_formatter = logging.Formatter(config.log_format)
    file_handler.setFormatter(file_formatter)
    
    # Add handlers to root logger
    root_logger.addHandler(console_handler)
    root_logger.addHandler(file_handler)


def get_logger(name: Optional[str] = None) -> logging.Logger:
    """
    Get a logger instance for a module
    Caches loggers to avoid recreating them
    
    Args:
        name: Module name (typically __name__)
        
    Returns:
        Configured logger instance
    """
    if name is None:
        name = 'agent'
    
    if name not in _loggers:
        logger = logging.getLogger(name)
        _loggers[name] = logger
    
    return _loggers[name]


def set_log_level(level: str) -> None:
    """
    Set log level for all loggers
    
    Args:
        level: Log level (DEBUG, INFO, WARNING, ERROR, CRITICAL)
    """
    logging.getLogger().setLevel(level)
    for logger in _loggers.values():
        logger.setLevel(level)


# Initialize logging on module import
configure_logging()
