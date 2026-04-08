"""
Agent System Utilities Module

Purpose: Provide system-level utility functions
Responsibilities:
  - System information retrieval
  - Process management utilities
  - File system operations
  - Environment variable management
  - System resource checking
  - Cross-platform compatibility helpers

Usage: Import and use utility functions as needed
Example: from agent.utils.system import get_system_info, check_disk_space
"""

import platform
import os
import psutil
import shutil
from typing import Dict, Any, Optional
from agent.core.logger import get_logger

logger = get_logger(__name__)


def get_system_info() -> Dict[str, Any]:
    """
    Get comprehensive system information
    
    Returns:
        Dictionary with system information
    """
    try:
        return {
            'platform': platform.system(),
            'platform_release': platform.release(),
            'platform_version': platform.version(),
            'architecture': platform.architecture(),
            'machine': platform.machine(),
            'processor': platform.processor(),
            'python_version': platform.python_version(),
            'python_implementation': platform.python_implementation()
        }
    except Exception as e:
        logger.error(f"System info error: {str(e)}")
        return {}


def check_disk_space(path: str = '/') -> Optional[Dict[str, Any]]:
    """
    Check disk space on a path
    
    Args:
        path: Path to check (default: root)
        
    Returns:
        Disk space information or None
    """
    try:
        usage = shutil.disk_usage(path)
        return {
            'total': usage.total,
            'used': usage.used,
            'free': usage.free,
            'percent_used': (usage.used / usage.total) * 100
        }
    except Exception as e:
        logger.warning(f"Disk space check error: {str(e)}")
        return None


def get_cpu_count() -> int:
    """
    Get number of CPUs
    
    Returns:
        Number of CPU cores
    """
    return psutil.cpu_count()


def get_memory_info() -> Optional[Dict[str, Any]]:
    """
    Get system memory information
    
    Returns:
        Memory information or None
    """
    try:
        mem = psutil.virtual_memory()
        return {
            'total': mem.total,
            'available': mem.available,
            'used': mem.used,
            'free': mem.free,
            'percent': mem.percent
        }
    except Exception as e:
        logger.warning(f"Memory info error: {str(e)}")
        return None


def is_windows() -> bool:
    """Check if running on Windows"""
    return platform.system() == 'Windows'


def is_linux() -> bool:
    """Check if running on Linux"""
    return platform.system() == 'Linux'


def is_macos() -> bool:
    """Check if running on macOS"""
    return platform.system() == 'Darwin'


def get_environment_variable(name: str, default: Optional[str] = None) -> Optional[str]:
    """
    Get environment variable safely
    
    Args:
        name: Variable name
        default: Default value if not found
        
    Returns:
        Variable value or default
    """
    return os.getenv(name, default)


def set_environment_variable(name: str, value: str) -> bool:
    """
    Set environment variable
    
    Args:
        name: Variable name
        value: Variable value
        
    Returns:
        True if successful
    """
    try:
        os.environ[name] = value
        return True
    except Exception as e:
        logger.error(f"Set environment variable error: {str(e)}")
        return False


def get_process_list() -> list:
    """
    Get list of running processes
    
    Returns:
        List of process information
    """
    try:
        processes = []
        for proc in psutil.process_iter(['pid', 'name', 'status', 'memory_percent']):
            try:
                processes.append({
                    'pid': proc.info['pid'],
                    'name': proc.info['name'],
                    'status': proc.info['status'],
                    'memory_percent': proc.info['memory_percent']
                })
            except (psutil.NoSuchProcess, psutil.AccessDenied):
                pass
        return processes
    except Exception as e:
        logger.warning(f"Process list error: {str(e)}")
        return []
