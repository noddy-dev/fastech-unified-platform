"""
Agent Device Discovery Service Module

Purpose: Discover and inventory connected devices and services
Responsibilities:
  - Scan network for connected devices
  - Identify device types and services
  - Collect device information and capabilities
  - Monitor device connectivity
  - Track discovered devices over time
  - Report discovery results to backend

Usage: Use to discover and monitor network devices
Example: from agent.services.discovery import DeviceDiscovery
         discovery = DeviceDiscovery()
         devices = discovery.scan()
"""

import socket
import threading
from typing import Dict, List, Any, Optional
from datetime import datetime
from agent.core.logger import get_logger
from agent.core.config import get_config
from agent.core.auth import get_auth_token
from agent.utils.network import scan_network, ping_host
import requests

logger = get_logger(__name__)


class DeviceDiscovery:
    """Handles device discovery and monitoring"""
    
    def __init__(self):
        """Initialize device discovery"""
        self.config = get_config()
        self.discovered_devices: Dict[str, Dict[str, Any]] = {}
        self.discovery_lock = threading.Lock()
    
    def scan(self) -> List[Dict[str, Any]]:
        """
        Scan network for devices
        
        Returns:
            List of discovered devices
        """
        if not self.config.enable_discovery:
            logger.info("Device discovery is disabled")
            return []
        
        try:
            logger.info("Starting device discovery scan")
            devices = []
            
            # Scan common port ranges for services
            ports = [22, 80, 443, 3306, 5432, 5900, 8080, 8443]
            
            # Get list of hosts to scan (implement your network scanning logic)
            hosts = self._get_scan_targets()
            
            for host in hosts:
                device_info = self._probe_host(host, ports)
                if device_info:
                    devices.append(device_info)
                    self.discovered_devices[host] = device_info
            
            logger.info(f"Discovery scan found {len(devices)} devices")
            return devices
            
        except Exception as e:
            logger.error(f"Device discovery error: {str(e)}")
            return []
    
    def _get_scan_targets(self) -> List[str]:
        """
        Get list of hosts to scan
        Can be customized based on configuration
        
        Returns:
            List of IP addresses to scan
        """
        # This is a placeholder - implement actual network scanning
        return []
    
    def _probe_host(self, host: str, ports: List[int]) -> Optional[Dict[str, Any]]:
        """
        Probe a host for services and information
        
        Args:
            host: Host IP or hostname
            ports: List of ports to check
            
        Returns:
            Device information dictionary or None
        """
        try:
            if not ping_host(host):
                return None
            
            device_info = {
                'host': host,
                'hostname': self._get_hostname(host),
                'open_ports': [],
                'services': [],
                'last_seen': datetime.now().isoformat(),
                'is_online': True
            }
            
            # Check open ports
            for port in ports:
                if self._check_port(host, port):
                    device_info['open_ports'].append(port)
                    service = self._identify_service(host, port)
                    if service:
                        device_info['services'].append(service)
            
            return device_info if device_info['open_ports'] else None
            
        except Exception as e:
            logger.debug(f"Host probe error for {host}: {str(e)}")
            return None
    
    def _get_hostname(self, ip: str) -> Optional[str]:
        """
        Get hostname for IP address
        
        Args:
            ip: IP address
            
        Returns:
            Hostname or None
        """
        try:
            hostname, _, _ = socket.gethostbyaddr(ip)
            return hostname
        except Exception:
            return None
    
    def _check_port(self, host: str, port: int, timeout: int = 2) -> bool:
        """
        Check if port is open on host
        
        Args:
            host: Host IP or hostname
            port: Port number
            timeout: Connection timeout in seconds
            
        Returns:
            True if port is open
        """
        try:
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.settimeout(timeout)
            result = sock.connect_ex((host, port))
            sock.close()
            return result == 0
        except Exception:
            return False
    
    def _identify_service(self, host: str, port: int) -> Optional[Dict[str, Any]]:
        """
        Identify service running on port
        
        Args:
            host: Host IP or hostname
            port: Port number
            
        Returns:
            Service information or None
        """
        # Map common ports to services
        port_mapping = {
            22: 'SSH',
            80: 'HTTP',
            443: 'HTTPS',
            3306: 'MySQL',
            5432: 'PostgreSQL',
            5900: 'VNC',
            8080: 'HTTP-Alt',
            8443: 'HTTPS-Alt'
        }
        
        return {
            'port': port,
            'name': port_mapping.get(port, 'Unknown'),
            'last_checked': datetime.now().isoformat()
        }
    
    def report(self, devices: List[Dict[str, Any]]) -> bool:
        """
        Report discovered devices to backend
        
        Args:
            devices: List of discovered devices
            
        Returns:
            True if report successful
        """
        try:
            token = get_auth_token()
            if not token:
                logger.warning("Cannot report devices: not authenticated")
                return False
            
            headers = {'Authorization': f'Bearer {token}'}
            
            payload = {
                'agent_id': self.config.agent_id,
                'discovered_devices': devices,
                'timestamp': datetime.now().isoformat()
            }
            
            response = requests.post(
                f"{self.config.api_url}/agent/discovered-devices",
                json=payload,
                headers=headers,
                timeout=self.config.api_timeout
            )
            
            if response.status_code == 200:
                logger.debug(f"Reported {len(devices)} discovered devices")
                return True
            else:
                logger.warning(f"Device report failed: {response.status_code}")
                return False
                
        except Exception as e:
            logger.error(f"Device report error: {str(e)}")
            return False
