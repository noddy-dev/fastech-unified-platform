"""
Agent Configuration Module

Purpose: Centralized configuration management for the agent
Responsibilities:
  - Load environment variables and configuration files
  - Define default settings and constants
  - Validate configuration on startup
  - Provide config access to all agent components
  - Support environment-specific settings (dev, prod, etc)

Usage: Import config values as needed
Example: from agent.core.config import API_URL, LOG_LEVEL
"""

import os
from typing import Optional
from dataclasses import dataclass


@dataclass
class AgentConfig:
    """Agent configuration dataclass"""
    
    # API Configuration
    api_url: str = os.getenv('API_URL', 'http://localhost:3000')
    api_key: str = os.getenv('API_KEY', '')
    api_timeout: int = int(os.getenv('API_TIMEOUT', '30'))
    
    # Agent Configuration
    agent_name: str = os.getenv('AGENT_NAME', 'default-agent')
    agent_id: str = os.getenv('AGENT_ID', '')
    agent_version: str = os.getenv('AGENT_VERSION', '1.0.0')
    
    # Logging Configuration
    log_level: str = os.getenv('LOG_LEVEL', 'INFO')
    log_file: str = os.getenv('LOG_FILE', 'agent.log')
    log_format: str = '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    
    # Feature Toggles
    enable_metrics: bool = os.getenv('ENABLE_METRICS', 'true').lower() == 'true'
    enable_discovery: bool = os.getenv('ENABLE_DISCOVERY', 'true').lower() == 'true'
    enable_remote_commands: bool = os.getenv('ENABLE_REMOTE_COMMANDS', 'false').lower() == 'true'
    
    # Polling Configuration
    discovery_interval: int = int(os.getenv('DISCOVERY_INTERVAL', '300'))  # 5 minutes
    metrics_interval: int = int(os.getenv('METRICS_INTERVAL', '60'))  # 1 minute
    health_check_interval: int = int(os.getenv('HEALTH_CHECK_INTERVAL', '30'))  # 30 seconds
    
    # Resource Limits
    max_concurrent_operations: int = int(os.getenv('MAX_CONCURRENT_OPS', '10'))
    max_retry_attempts: int = int(os.getenv('MAX_RETRY_ATTEMPTS', '3'))
    
    # Database Configuration
    db_host: str = os.getenv('DB_HOST', 'localhost')
    db_port: int = int(os.getenv('DB_PORT', '5432'))
    db_name: str = os.getenv('DB_NAME', 'fastech')
    db_user: str = os.getenv('DB_USER', 'postgres')
    db_password: str = os.getenv('DB_PASSWORD', '')
    
    # Network Configuration
    enable_ipv6: bool = os.getenv('ENABLE_IPV6', 'false').lower() == 'true'
    network_interface: Optional[str] = os.getenv('NETWORK_INTERFACE', None)
    dns_server: str = os.getenv('DNS_SERVER', '8.8.8.8')
    
    def validate(self) -> bool:
        """Validate configuration is valid"""
        if not self.api_url:
            raise ValueError('API_URL is required')
        if not self.agent_id:
            raise ValueError('AGENT_ID is required')
        return True


# Global config instance
config = AgentConfig()


def get_config() -> AgentConfig:
    """Get global configuration instance"""
    return config


def reload_config() -> AgentConfig:
    """Reload configuration from environment variables"""
    global config
    config = AgentConfig()
    config.validate()
    return config
