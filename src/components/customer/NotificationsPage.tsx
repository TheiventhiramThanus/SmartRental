import { useState, useEffect } from 'react';
import { Bell, CheckCircle, AlertCircle, Gift, Clock, Loader2, Trash2, MailOpen, ShieldAlert } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { formatCurrency } from '../ui/utils';
import { getDocuments, updateDocument, where, deleteDocument } from '../../firebase';

interface NotificationsPageProps {
  user: any;
}

export function NotificationsPage({ user }: NotificationsPageProps) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    fetchNotifications();
  }, [user.id]);

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      // Fetch user-specific notifications and general announcements
      const [userNotifs, generalNotifs] = await Promise.all([
        getDocuments('notifications', where('userId', '==', user.id)),
        getDocuments('notifications', where('userId', '==', 'all'))
      ]);

      const allNotifs = [...userNotifs, ...generalNotifs].sort((a, b) => {
        const dateA = a.createdAt?.seconds ? a.createdAt.seconds * 1000 : new Date(a.createdAt).getTime();
        const dateB = b.createdAt?.seconds ? b.createdAt.seconds * 1000 : new Date(b.createdAt).getTime();
        return dateB - dateA;
      });

      setNotifications(allNotifs);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await updateDocument('notifications', id, { read: true });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unread = notifications.filter(n => !n.read);
      await Promise.all(unread.map(n => updateDocument('notifications', n.id, { read: true })));
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      if (confirm('Permanently delete this secure notification?')) {
        await deleteDocument('notifications', id);
        setNotifications(prev => prev.filter(n => n.id !== id));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const getIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'booking': return CheckCircle;
      case 'payment': return AlertCircle;
      case 'announcement': return Gift;
      case 'maintenance': return ShieldAlert;
      default: return Bell;
    }
  };

  const getIconColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'booking': return 'text-green-500 bg-green-50';
      case 'payment': return 'text-yellow-500 bg-yellow-50';
      case 'announcement': return 'text-accent bg-accent/10';
      case 'maintenance': return 'text-blue-500 bg-blue-50';
      default: return 'text-gray-500 bg-gray-50';
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="h-12 w-12 text-accent animate-spin mb-4" />
        <p className="text-muted-foreground font-bold italic tracking-widest uppercase">Fetching secure transmission...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b-2">
        <div className="flex items-center gap-4">
          <div>
            <h2 className="text-3xl font-black text-gray-900 tracking-tight uppercase">Security Comms</h2>
            <p className="text-muted-foreground font-medium">End-to-end encrypted system notifications</p>
          </div>
          {unreadCount > 0 && (
            <Badge className="bg-accent px-3 py-1 text-xs font-black animate-pulse shadow-lg shadow-red-200">
              {unreadCount} UNREAD
            </Badge>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={markAllAsRead}
          disabled={unreadCount === 0}
          className="font-black border-2 rounded-xl hover:bg-slate-900 hover:text-white transition-all uppercase text-[10px] tracking-widest px-6"
        >
          <MailOpen className="h-4 w-4 mr-2" />
          Mark all as read
        </Button>
      </div>

      <div className="space-y-4">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed">
            <Bell className="h-16 w-16 text-slate-200 mb-4" />
            <p className="text-slate-400 font-black italic uppercase tracking-widest">Inbox Clear / No Signals</p>
          </div>
        ) : (
          notifications.map((notification) => {
            const Icon = getIcon(notification.type);
            const colorClass = getIconColor(notification.type);
            const date = notification.createdAt?.seconds
              ? new Date(notification.createdAt.seconds * 1000).toLocaleString()
              : new Date(notification.createdAt).toLocaleString();

            return (
              <Card
                key={notification.id}
                className={`group transition-all rounded-2xl overflow-hidden border-2 ${notification.read ? 'bg-gray-50/50 grayscale-[0.5] opacity-80 border-transparent' : 'bg-white border-accent/20 shadow-xl'}`}
              >
                <CardContent className="p-0">
                  <div className="flex items-stretch gap-0">
                    <div className={`w-2 ${notification.read ? 'bg-gray-200' : 'bg-accent animate-pulse'}`} />
                    <div className="p-6 flex items-start gap-6 flex-1">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm border-2 border-white transition-transform group-hover:scale-110 ${colorClass}`}>
                        <Icon className="h-7 w-7" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div>
                            <h4 className="font-black text-slate-900 uppercase tracking-tight text-lg leading-none">{notification.title}</h4>
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{date}</span>
                          </div>
                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            {!notification.read && (
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 text-accent hover:bg-accent/10 rounded-full"
                                onClick={() => markAsRead(notification.id)}
                              >
                                <MailOpen className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-red-500 hover:bg-red-50 rounded-full"
                              onClick={() => deleteNotification(notification.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <p className={`text-sm mb-4 leading-relaxed ${notification.read ? 'text-muted-foreground' : 'text-slate-700 font-medium'}`}>
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="text-[9px] font-black uppercase tracking-[0.2em] px-3 py-0.5 rounded-full">
                            ID: {notification.id.toUpperCase().slice(0, 10)}
                          </Badge>
                          <Badge variant="outline" className={`text-[9px] font-black uppercase tracking-[0.2em] px-3 py-0.5 rounded-full border-2 ${notification.type === 'announcement' ? 'border-accent text-accent' : ''}`}>
                            {notification.type}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
