import { useEffect, useState, useRef } from 'react';
import api from '../api/axios';

function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications/my');
      setNotifications(res.data);
    } catch (err) {
      // silently ignore
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // poll every 30s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => n.is_read === 'No').length;

  const handleToggle = async () => {
    setOpen(!open);
    if (!open && unreadCount > 0) {
      try {
        await api.put('/notifications/read-all');
        fetchNotifications();
      } catch (err) {
        // ignore
      }
    }
  };

  const timeAgo = (isoString) => {
    const diff = Date.now() - new Date(isoString).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleToggle}
        className="relative p-2 rounded-lg hover:bg-white/5 text-indigo-200/80 hover:text-white transition"
      >
        <span className="text-lg">🔔</span>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-100 z-50 max-h-96 overflow-y-auto">
          <div className="p-3 border-b border-gray-100">
            <p className="text-sm font-semibold text-slate-800">Notifications</p>
          </div>
          {notifications.length === 0 ? (
            <p className="p-4 text-sm text-slate-400 text-center">No notifications yet</p>
          ) : (
            notifications.map((n) => (
              <div key={n.id} className="p-3 border-b border-gray-50 last:border-0 hover:bg-gray-50">
                <p className="text-sm text-slate-700">{n.message}</p>
                <p className="text-xs text-slate-400 mt-1">{timeAgo(n.created_at)}</p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default NotificationBell;