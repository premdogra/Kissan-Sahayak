import json
import time
from typing import Optional, Dict, Any
from datetime import datetime, timedelta

class SessionManager:
    """Simple in-memory session manager (no Redis needed)"""
    
    def __init__(self, session_timeout: int = 3600):
        self.sessions = {}  # session_id -> session_data
        self.user_sessions = {}  # user_id -> session_id
        self.session_timeout = session_timeout  # seconds
    
    def _generate_session_id(self, user_id: str) -> str:
        """Generate simple session ID"""
        import hashlib
        unique = f"{user_id}:{time.time()}:{hash(user_id)}"
        return hashlib.md5(unique.encode()).hexdigest()[:16]
    
    def create_session(self, user_id: str, initial_data: Dict = None) -> str:
        """Create new session for user"""
        # Clean old session if exists
        if user_id in self.user_sessions:
            old_session = self.user_sessions[user_id]
            if old_session in self.sessions:
                del self.sessions[old_session]
        
        # Create new session
        session_id = self._generate_session_id(user_id)
        
        self.sessions[session_id] = {
            'user_id': user_id,
            'created_at': time.time(),
            'last_active': time.time(),
            'context': initial_data or {}
        }
        
        self.user_sessions[user_id] = session_id
        return session_id
    
    def get_session(self, session_id: str) -> Optional[Dict]:
        """Get session data"""
        session = self.sessions.get(session_id)
        if not session:
            return None
        
        # Check timeout
        if time.time() - session['last_active'] > self.session_timeout:
            del self.sessions[session_id]
            return None
        
        # Update last active
        session['last_active'] = time.time()
        return session
    
    def get_session_by_user(self, user_id: str) -> Optional[Dict]:
        """Get session by user ID"""
        session_id = self.user_sessions.get(user_id)
        if session_id:
            return self.get_session(session_id)
        return None
    
    def update_session(self, session_id: str, updates: Dict):
        """Update session data"""
        session = self.get_session(session_id)
        if session:
            session['context'].update(updates)
    
    def get_context(self, session_id: str, key: str = None):
        """Get context from session"""
        session = self.get_session(session_id)
        if not session:
            return None
        
        if key:
            return session['context'].get(key)
        return session['context']
    
    def delete_session(self, session_id: str):
        """Delete session"""
        if session_id in self.sessions:
            user_id = self.sessions[session_id]['user_id']
            if user_id in self.user_sessions:
                del self.user_sessions[user_id]
            del self.sessions[session_id]
    
    def cleanup_expired(self):
        """Clean up expired sessions"""
        current_time = time.time()
        expired = []
        
        for session_id, session in self.sessions.items():
            if current_time - session['last_active'] > self.session_timeout:
                expired.append(session_id)
        
        for session_id in expired:
            self.delete_session(session_id)