
import { useState, useEffect } from "react";
import { Bell, X, Clock, User, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Notice {
  id: string;
  title: string;
  message: string;
  target_type: string;
  target_roll_number: string | null;
  created_at: string;
  is_read: boolean;
}

const NoticesPanel = () => {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadNotices();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('notices-changes')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notices'
      }, () => {
        loadNotices();
        toast({
          title: "New Notice",
          description: "You have received a new notice",
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadNotices = async () => {
    try {
      const { data, error } = await supabase
        .from('notices')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      
      setNotices(data || []);
      setUnreadCount((data || []).filter(notice => !notice.is_read).length);
    } catch (error) {
      console.error('Error loading notices:', error);
    }
  };

  const markAsRead = async (noticeId: string) => {
    try {
      const { error } = await supabase
        .from('notices')
        .update({ is_read: true })
        .eq('id', noticeId);

      if (error) throw error;
      
      setNotices(prev => prev.map(notice => 
        notice.id === noticeId ? { ...notice, is_read: true } : notice
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notice as read:', error);
    }
  };

  return (
    <>
      {/* Notification Bell */}
      <div className="relative">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="relative"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs bg-red-500 text-white rounded-full flex items-center justify-center">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </div>

      {/* Notices Panel */}
      {isOpen && (
        <div className="absolute top-16 right-4 w-80 max-h-96 bg-white rounded-lg shadow-lg border z-50 overflow-hidden">
          <div className="p-4 border-b bg-gray-50">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-gray-900">Notices</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notices.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No notices yet
              </div>
            ) : (
              notices.map((notice) => (
                <div
                  key={notice.id}
                  className={`p-4 border-b hover:bg-gray-50 cursor-pointer ${
                    !notice.is_read ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                  }`}
                  onClick={() => !notice.is_read && markAsRead(notice.id)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-gray-900 text-sm">
                      {notice.title}
                    </h4>
                    <div className="flex items-center space-x-1">
                      {notice.target_type === 'individual' ? (
                        <User className="h-3 w-3 text-blue-500" />
                      ) : (
                        <Users className="h-3 w-3 text-green-500" />
                      )}
                      {!notice.is_read && (
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      )}
                    </div>
                  </div>
                  <p className="text-gray-600 text-xs mb-2 line-clamp-2">
                    {notice.message}
                  </p>
                  <div className="flex items-center text-xs text-gray-400">
                    <Clock className="h-3 w-3 mr-1" />
                    {new Date(notice.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default NoticesPanel;
