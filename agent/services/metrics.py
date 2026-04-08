"""
Agent Metrics Service Module

Purpose: Collect and report system and network metrics
Responsibilities:
  - Gather CPU, memory, disk usage metrics
  - Collect network interface statistics
  - Compile device information
  - Send metrics to backend at regular intervals
  - Calculate metrics trends and anomalies
  - Handle metric storage and persistence

Usage: Use to collect and report system metrics
Example: from agent.services.metrics import MetricsCollector
         collector = MetricsCollector()
         metrics = collector.collect()
"""

import time
import psutil
from typing import Dict, Any, Optional
from agent.core.logger import get_logger
from agent.core.auth import get_auth_token
from agent.core.config import get_config
import requests

logger = get_logger(__name__)


class MetricsCollector:
    """Collects system and network metrics"""
    
    def __init__(self):
        """Initialize metrics collector"""
        self.config = get_config()
        self.last_collection_time = 0
    
    def collect(self) -> Dict[str, Any]:
        """
        Collect system and network metrics
        
        Returns:
            Dictionary containing collected metrics
        """
        try:
            timestamp = time.time()
            
            metrics = {
                'timestamp': timestamp,
                'agent_id': self.config.agent_id,
                'cpu': self._collect_cpu_metrics(),
                'memory': self._collect_memory_metrics(),
                'disk': self._collect_disk_metrics(),
                'network': self._collect_network_metrics(),
                'system': self._collect_system_info()
            }
            
            self.last_collection_time = timestamp
            return metrics
            
        except Exception as e:
            logger.error(f"Metrics collection error: {str(e)}")
            return {}
    
    def _collect_cpu_metrics(self) -> Dict[str, Any]:
        """Collect CPU usage metrics"""
        try:
            return {
                'percent': psutil.cpu_percent(interval=1),
                'count': psutil.cpu_count(),
                'freq': psutil.cpu_freq().current if psutil.cpu_freq() else None
            }
        except Exception as e:
            logger.warning(f"CPU metrics error: {str(e)}")
            return {}
    
    def _collect_memory_metrics(self) -> Dict[str, Any]:
        """Collect memory usage metrics"""
        try:
            mem = psutil.virtual_memory()
            return {
                'total': mem.total,
                'used': mem.used,
                'available': mem.available,
                'percent': mem.percent
            }
        except Exception as e:
            logger.warning(f"Memory metrics error: {str(e)}")
            return {}
    
    def _collect_disk_metrics(self) -> Dict[str, Any]:
        """Collect disk usage metrics"""
        try:
            disk = psutil.disk_usage('/')
            return {
                'total': disk.total,
                'used': disk.used,
                'free': disk.free,
                'percent': disk.percent
            }
        except Exception as e:
            logger.warning(f"Disk metrics error: {str(e)}")
            return {}
    
    def _collect_network_metrics(self) -> Dict[str, Any]:
        """Collect network interface metrics"""
        try:
            net_io = psutil.net_io_counters()
            return {
                'bytes_sent': net_io.bytes_sent,
                'bytes_recv': net_io.bytes_recv,
                'packets_sent': net_io.packets_sent,
                'packets_recv': net_io.packets_recv,
                'errors_in': net_io.errin,
                'errors_out': net_io.errout
            }
        except Exception as e:
            logger.warning(f"Network metrics error: {str(e)}")
            return {}
    
    def _collect_system_info(self) -> Dict[str, Any]:
        """Collect system information"""
        try:
            import platform
            return {
                'os': platform.system(),
                'os_version': platform.release(),
                'platform': platform.platform(),
                'uptime': time.time() - psutil.boot_time()
            }
        except Exception as e:
            logger.warning(f"System info error: {str(e)}")
            return {}
    
    def report(self, metrics: Dict[str, Any]) -> bool:
        """
        Report metrics to backend
        
        Args:
            metrics: Collected metrics dictionary
            
        Returns:
            True if report successful
        """
        try:
            token = get_auth_token()
            if not token:
                logger.warning("Cannot report metrics: not authenticated")
                return False
            
            headers = {'Authorization': f'Bearer {token}'}
            
            response = requests.post(
                f"{self.config.api_url}/agent/metrics",
                json=metrics,
                headers=headers,
                timeout=self.config.api_timeout
            )
            
            if response.status_code == 200:
                logger.debug("Metrics reported successfully")
                return True
            else:
                logger.warning(f"Metrics report failed: {response.status_code}")
                return False
                
        except Exception as e:
            logger.error(f"Metrics report error: {str(e)}")
            return False
