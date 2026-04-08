"""
Agent Network Utilities Module

Purpose: Provide network-level utility functions
Responsibilities:
  - Network connectivity checking
  - DNS resolution and validation
  - IP address utilities
  - Network interface enumeration
  - Port scanning and checking
  - Network performance monitoring
  - Proxy and VPN detection

Usage: Import and use utility functions as needed
Example: from agent.utils.network import ping_host, get_network_interfaces
"""

import socket
import subprocess
import platform
from typing import Dict, List, Optional, Tuple
from agent.core.logger import get_logger
import psutil

logger = get_logger(__name__)


def ping_host(host: str, timeout: int = 3) -> bool:
    """
    Ping a host to check connectivity
    
    Args:
        host: Host IP or hostname
        timeout: Ping timeout in seconds
        
    Returns:
        True if host is reachable
    """
    try:
        if platform.system().lower() == 'windows':
            cmd = ['ping', '-n', '1', '-w', str(timeout * 1000), host]
        else:
            cmd = ['ping', '-c', '1', '-W', str(timeout * 1000), host]
        
        result = subprocess.run(cmd, capture_output=True, timeout=timeout + 1)
        return result.returncode == 0
    except Exception as e:
        logger.debug(f"Ping error for {host}: {str(e)}")
        return False


def resolve_hostname(hostname: str) -> Optional[str]:
    """
    Resolve hostname to IP address
    
    Args:
        hostname: Hostname to resolve
        
    Returns:
        IP address or None
    """
    try:
        return socket.gethostbyname(hostname)
    except Exception as e:
        logger.debug(f"DNS resolution error for {hostname}: {str(e)}")
        return None


def reverse_dns(ip: str) -> Optional[str]:
    """
    Reverse DNS lookup
    
    Args:
        ip: IP address
        
    Returns:
        Hostname or None
    """
    try:
        hostname, _, _ = socket.gethostbyaddr(ip)
        return hostname
    except Exception as e:
        logger.debug(f"Reverse DNS error for {ip}: {str(e)}")
        return None


def check_port_open(host: str, port: int, timeout: int = 2) -> bool:
    """
    Check if a port is open on a host
    
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
    except Exception as e:
        logger.debug(f"Port check error for {host}:{port}: {str(e)}")
        return False


def get_network_interfaces() -> Dict[str, Dict[str, any]]:
    """
    Get information about network interfaces
    
    Returns:
        Dictionary of network interface information
    """
    try:
        interfaces = {}
        for interface_name, interface_addrs in psutil.net_if_addrs().items():
            interfaces[interface_name] = []
            for addr in interface_addrs:
                interfaces[interface_name].append({
                    'family': str(addr.family),
                    'address': addr.address,
                    'netmask': addr.netmask,
                    'broadcast': addr.broadcast
                })
        return interfaces
    except Exception as e:
        logger.warning(f"Network interfaces error: {str(e)}")
        return {}


def get_gateway() -> Optional[str]:
    """
    Get default gateway IP address
    
    Returns:
        Gateway IP address or None
    """
    try:
        gateways = psutil.net_if_gateways()
        default_gw = gateways.get('default')
        if default_gw:
            # Get the first default gateway
            for gw_info in default_gw:
                if gw_info[0]:  # Check if gateway address exists
                    return gw_info[0]
        return None
    except Exception as e:
        logger.debug(f"Gateway lookup error: {str(e)}")
        return None


def get_local_ip(hostname: Optional[str] = None) -> Optional[str]:
    """
    Get local IP address
    
    Args:
        hostname: Optional hostname to get IP for
        
    Returns:
        Local IP address or None
    """
    try:
        if hostname:
            return socket.gethostbyname(hostname)
        
        # Connect to external host to determine local IP
        sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        sock.connect(('8.8.8.8', 80))
        local_ip = sock.getsockname()[0]
        sock.close()
        return local_ip
    except Exception as e:
        logger.debug(f"Local IP lookup error: {str(e)}")
        return None


def scan_network(network: str = None) -> List[Tuple[str, bool]]:
    """
    Scan network for active hosts
    
    Args:
        network: Network CIDR to scan (e.g., '192.168.1.0/24')
        
    Returns:
        List of (IP, is_online) tuples
    """
    # This is a placeholder - implement actual network scanning
    # using libraries like python-nmap if needed
    logger.debug("Network scanning requires additional configuration")
    return []


def get_connection_info() -> Dict[str, any]:
    """
    Get comprehensive network connection information
    
    Returns:
        Dictionary with network information
    """
    try:
        return {
            'local_ip': get_local_ip(),
            'gateway': get_gateway(),
            'interfaces': get_network_interfaces(),
            'connections': len(psutil.net_connections())
        }
    except Exception as e:
        logger.warning(f"Connection info error: {str(e)}")
        return {}
