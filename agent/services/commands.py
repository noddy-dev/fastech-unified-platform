"""
Agent Commands Service Module

Purpose: Handle command execution and remote operations
Responsibilities:
  - Execute system commands safely
  - Handle remote command requests from backend
  - Capture command output and status
  - Implement command timeouts and cancellation
  - Log all executed commands
  - Support background operations

Usage: Use to execute commands and handle remote requests
Example: from agent.services.commands import CommandExecutor
         executor = CommandExecutor()
         result = executor.execute('ls -la')
"""

import subprocess
import threading
from typing import Dict, Any, Optional, List
from datetime import datetime
from agent.core.logger import get_logger
from agent.core.config import get_config

logger = get_logger(__name__)


class CommandExecutor:
    """Handles command execution and monitoring"""
    
    def __init__(self):
        """Initialize command executor"""
        self.config = get_config()
        self.active_processes: Dict[str, subprocess.Popen] = {}
        self.command_history: List[Dict[str, Any]] = []
        self.max_history = 1000  # Keep last 1000 commands
    
    def execute(self, command: str, timeout: int = 30) -> Dict[str, Any]:
        """
        Execute a system command
        
        Args:
            command: Command to execute
            timeout: Command timeout in seconds
            
        Returns:
            Dictionary with command result
        """
        try:
            if not self.config.enable_remote_commands:
                return {
                    'success': False,
                    'error': 'Remote commands are disabled',
                    'command': command
                }
            
            logger.info(f"Executing command: {command}")
            
            process = subprocess.Popen(
                command,
                shell=True,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True
            )
            
            try:
                stdout, stderr = process.communicate(timeout=timeout)
                returncode = process.returncode
                
            except subprocess.TimeoutExpired:
                process.kill()
                logger.warning(f"Command timed out: {command}")
                return {
                    'success': False,
                    'error': f'Command timed out after {timeout} seconds',
                    'command': command,
                    'timeout': timeout
                }
            
            result = {
                'success': returncode == 0,
                'returncode': returncode,
                'stdout': stdout,
                'stderr': stderr,
                'command': command,
                'timestamp': datetime.now().isoformat()
            }
            
            # Keep command history (with limit)
            self.command_history.append(result)
            if len(self.command_history) > self.max_history:
                self.command_history.pop(0)
            
            return result
            
        except Exception as e:
            logger.error(f"Command execution error: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'command': command
            }
    
    def execute_async(self, command: str, callback=None) -> Optional[str]:
        """
        Execute command asynchronously
        
        Args:
            command: Command to execute
            callback: Optional callback function for completion
            
        Returns:
            Process ID or None
        """
        def run_command():
            try:
                result = self.execute(command)
                if callback:
                    callback(result)
            except Exception as e:
                logger.error(f"Async command error: {str(e)}")
        
        thread = threading.Thread(target=run_command)
        thread.daemon = True
        thread.start()
        
        return str(thread.ident)
    
    def get_history(self, limit: int = 100) -> List[Dict[str, Any]]:
        """
        Get command execution history
        
        Args:
            limit: Maximum number of history entries to return
            
        Returns:
            List of command execution records
        """
        return self.command_history[-limit:]
    
    def clear_history(self) -> None:
        """Clear command execution history"""
        self.command_history.clear()
        logger.info("Command history cleared")
