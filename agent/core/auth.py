"""
Agent Authentication Module

Purpose: Handle agent authentication with backend services
Responsibilities:
  - Manage API authentication tokens
  - Handle token refresh and expiration
  - Validate agent credentials
  - Manage secure storage of credentials
  - Track authentication state

Usage: Use to authenticate requests and manage sessions
Example: from agent.core.auth import get_auth_token
         token = get_auth_token()
"""

import time
from typing import Optional
import requests
from agent.core.config import get_config
from agent.core.logger import get_logger

logger = get_logger(__name__)


class AuthenticationManager:
    """Manages agent authentication and token lifecycle"""
    
    def __init__(self):
        """Initialize authentication manager"""
        self.config = get_config()
        self.token: Optional[str] = None
        self.token_expiry: float = 0
        self.refresh_token: Optional[str] = None
    
    def authenticate(self) -> bool:
        """
        Authenticate agent with backend
        
        Returns:
            True if authentication successful
        """
        try:
            payload = {
                'agent_id': self.config.agent_id,
                'api_key': self.config.api_key,
                'agent_version': self.config.agent_version
            }
            
            response = requests.post(
                f"{self.config.api_url}/auth/agent/login",
                json=payload,
                timeout=self.config.api_timeout
            )
            
            if response.status_code != 200:
                logger.error(f"Authentication failed: {response.status_code}")
                return False
            
            data = response.json()
            self.token = data.get('token')
            self.refresh_token = data.get('refresh_token')
            self.token_expiry = time.time() + data.get('expires_in', 3600)
            
            logger.info("Agent authenticated successfully")
            return True
            
        except Exception as e:
            logger.error(f"Authentication error: {str(e)}")
            return False
    
    def is_authenticated(self) -> bool:
        """
        Check if agent is currently authenticated
        
        Returns:
            True if token is valid and not expired
        """
        return self.token is not None and time.time() < self.token_expiry
    
    def get_token(self) -> Optional[str]:
        """
        Get current authentication token, refresh if needed
        
        Returns:
            Valid authentication token or None
        """
        if not self.is_authenticated():
            # Try to refresh token
            if not self.refresh():
                # If refresh fails, re-authenticate
                self.authenticate()
        
        return self.token
    
    def refresh(self) -> bool:
        """
        Refresh authentication token
        
        Returns:
            True if refresh successful
        """
        if not self.refresh_token:
            return False
        
        try:
            payload = {
                'refresh_token': self.refresh_token,
                'agent_id': self.config.agent_id
            }
            
            response = requests.post(
                f"{self.config.api_url}/auth/agent/refresh",
                json=payload,
                timeout=self.config.api_timeout
            )
            
            if response.status_code != 200:
                logger.warning(f"Token refresh failed: {response.status_code}")
                return False
            
            data = response.json()
            self.token = data.get('token')
            self.token_expiry = time.time() + data.get('expires_in', 3600)
            
            logger.debug("Token refreshed successfully")
            return True
            
        except Exception as e:
            logger.error(f"Token refresh error: {str(e)}")
            return False


# Global authentication manager instance
_auth_manager: Optional[AuthenticationManager] = None


def get_auth_manager() -> AuthenticationManager:
    """Get global authentication manager instance"""
    global _auth_manager
    if _auth_manager is None:
        _auth_manager = AuthenticationManager()
    return _auth_manager


def get_auth_token() -> Optional[str]:
    """Get current authentication token"""
    return get_auth_manager().get_token()


def is_authenticated() -> bool:
    """Check if agent is authenticated"""
    return get_auth_manager().is_authenticated()
