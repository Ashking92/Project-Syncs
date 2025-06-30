
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, User, Edit, Home, Folder, Settings, LogOut, Menu, Bell, CheckCircle, Clock, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface StudentProfile {
  id: string;
  roll_number: string;
  name?: string;
  phone_number?: string;
  email?: string;
  photo_url?: string;
}

interface Submission {
  id: string;
  project_title: string;
  status: 'pending' | 'approved' | 'rejected';
  submitted_at: string;
  remarks?: string;
  technologies: string;
  estimated_cost: string;
}

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('home');
  const [hasNewNotification, setHasNewNotification] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    phone_number: "",
    email: "",
    photo_url: ""
  });

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (profile) {
      loadSubmissions();
      
      // Set up real-time subscription for submissions
      const channel = supabase
        .channel('user-submissions')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'submissions',
          filter: `roll_number=eq.${user?.rollNumber}`
        }, (payload) => {
          console.log('Real-time update:', payload);
          loadSubmissions();
          
          if (payload.eventType === 'UPDATE') {
            const newStatus = payload.new.status;
            const oldStatus = payload.old?.status;
            
            if (newStatus !== oldStatus && (newStatus === 'approved' || newStatus === 'rejected')) {
              setHasNewNotification(true);
              toast({
                title: `Project ${newStatus === 'approved' ? 'Approved! 🎉' : 'Update'}`,
                description: `Your project "${payload.new.project_title}" has been ${newStatus}.`,
                variant: newStatus === 'approved' ? 'default' : 'destructive',
              });
            }
          }
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [profile, user]);

  const checkAuth = () => {
    const userData = localStorage.getItem('proposync-user');
    if (!userData) {
      navigate('/auth');
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (parsedUser.type !== 'student') {
      navigate('/auth');
      return;
    }

    setUser(parsedUser);
    loadProfile(parsedUser.rollNumber);
  };

  const loadProfile = async (rollNumber: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('roll_number', rollNumber)
        .single();

      if (error) throw error;

      setProfile(data);
      setFormData({
        name: data.name || "",
        phone_number: data.phone_number || "",
        email: data.email || "",
        photo_url: data.photo_url || ""
      });

      // If profile is incomplete, enable editing mode
      if (!data.name || !data.phone_number || !data.email) {
        setIsEditing(true);
        setActiveTab('profile');
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSubmissions = async () => {
    if (!user?.rollNumber) return;

    try {
      const { data, error } = await supabase
        .from('submissions')
        .select('*')
        .eq('roll_number', user.rollNumber)
        .order('submitted_at', { ascending: false });

      if (error) throw error;

      const typedData = (data || []).map(item => ({
        ...item,
        status: item.status as 'pending' | 'approved' | 'rejected'
      }));
      
      setSubmissions(typedData);
    } catch (error) {
      console.error('Error loading submissions:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: formData.name,
          phone_number: formData.phone_number,
          email: formData.email,
          photo_url: formData.photo_url,
          updated_at: new Date().toISOString()
        })
        .eq('roll_number', user.rollNumber);

      if (error) throw error;

      toast({
        title: "Profile Updated! 🎉",
        description: "Your profile has been saved successfully.",
      });

      setIsEditing(false);
      loadProfile(user.rollNumber);
      setActiveTab('home');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('proposync-user');
    navigate('/auth');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
    }
  };

  if (isLoading && !profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const renderProfileTab = () => (
    <div className="min-h-screen bg-gray-50">
      <div className="flex items-center p-4 border-b bg-white">
        <button
          onClick={() => setActiveTab('home')}
          className="mr-4"
        >
          <ArrowLeft className="h-6 w-6 text-gray-700" />
        </button>
        <h1 className="text-xl font-semibold text-gray-900">Profile</h1>
      </div>

      <div className="p-4">
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-gradient-to-br from-orange-200 to-orange-300 rounded-full mx-auto mb-4 flex items-center justify-center">
            {profile?.photo_url ? (
              <img 
                src={profile.photo_url} 
                alt="Profile" 
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <User className="h-12 w-12 text-gray-600" />
            )}
          </div>
          <h2 className="text-2xl font-bold text-gray-900">{profile?.name || 'Student'}</h2>
          <p className="text-gray-600">Student ID: {user?.rollNumber}</p>
        </div>

        {isEditing ? (
          <form onSubmit={handleSaveProfile} className="space-y-6">
            <div>
              <Label htmlFor="name" className="text-base font-medium text-gray-900 mb-2 block">
                Name
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="h-12 text-base rounded-xl border-gray-200 bg-gray-100"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="phone_number" className="text-base font-medium text-gray-900 mb-2 block">
                Phone
              </Label>
              <Input
                id="phone_number"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleInputChange}
                className="h-12 text-base rounded-xl border-gray-200 bg-gray-100"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="email" className="text-base font-medium text-gray-900 mb-2 block">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                className="h-12 text-base rounded-xl border-gray-200 bg-gray-100"
                required
              />
            </div>
            
            <Button
              type="submit"
              className="w-full h-12 bg-blue-500 hover:bg-blue-600 rounded-xl text-white font-medium text-base"
              disabled={isLoading}
            >
              {isLoading ? "Saving..." : "Save"}
            </Button>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h3>
              <div className="space-y-4">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Name</span>
                  <span className="font-medium">{profile?.name || 'Not provided'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Email</span>
                  <span className="font-medium">{profile?.email || 'Not provided'}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Phone</span>
                  <span className="font-medium">{profile?.phone_number || 'Not provided'}</span>
                </div>
              </div>
            </div>
            
            <Button
              onClick={() => setIsEditing(true)}
              className="w-full h-12 bg-blue-500 hover:bg-blue-600 rounded-xl text-white font-medium text-base"
            >
              Edit Profile
            </Button>
          </div>
        )}
      </div>
    </div>
  );

  const renderProjectsTab = () => (
    <div className="min-h-screen bg-gray-50">
      <div className="flex items-center justify-between p-4 border-b bg-white">
        <div className="flex items-center">
          <button
            onClick={() => setActiveTab('home')}
            className="mr-4"
          >
            <ArrowLeft className="h-6 w-6 text-gray-700" />
          </button>
          <h1 className="text-xl font-semibold text-gray-900">My Projects</h1>
        </div>
        <div className="relative">
          <Bell className={`h-6 w-6 ${hasNewNotification ? 'text-red-500' : 'text-gray-700'}`} />
          {hasNewNotification && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
          )}
        </div>
      </div>

      <div className="p-4">
        {submissions.length === 0 ? (
          <div className="text-center py-12">
            <Folder className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No projects submitted yet</p>
            <Button
              onClick={() => navigate('/submit')}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              Submit Your First Project
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {submissions.map((submission) => (
              <Card key={submission.id} className="rounded-xl border-gray-200">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {submission.project_title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        Technologies: {submission.technologies}
                      </p>
                      <p className="text-sm text-gray-600">
                        Cost: ₹{submission.estimated_cost}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(submission.status)}
                      {getStatusBadge(submission.status)}
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <span>
                      Submitted: {new Date(submission.submitted_at).toLocaleDateString()}
                    </span>
                  </div>
                  
                  {submission.remarks && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium text-gray-700 mb-1">Remarks:</p>
                      <p className="text-sm text-gray-600">{submission.remarks}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderHomeTab = () => (
    <div className="min-h-screen bg-gray-50">
      <div className="flex items-center justify-between p-4 border-b bg-white">
        <div className="flex items-center">
          <Menu className="h-6 w-6 text-gray-700 mr-3" />
          <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
        </div>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Bell 
              className={`h-6 w-6 cursor-pointer ${hasNewNotification ? 'text-red-500' : 'text-gray-700'}`}
              onClick={() => {
                setHasNewNotification(false);
                setActiveTab('projects');
              }}
            />
            {hasNewNotification && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
            )}
          </div>
          <button onClick={handleLogout}>
            <LogOut className="h-6 w-6 text-gray-700" />
          </button>
        </div>
      </div>

      <div className="p-4">
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-200 to-blue-300 rounded-full mx-auto mb-4 flex items-center justify-center">
            {profile?.photo_url ? (
              <img 
                src={profile.photo_url} 
                alt="Profile" 
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <User className="h-12 w-12 text-gray-600" />
            )}
          </div>
          <h2 className="text-2xl font-bold text-gray-900">{profile?.name || 'Student'}</h2>
          <p className="text-gray-600">Student ID: {user?.rollNumber}</p>
        </div>

        <div className="space-y-4 mb-6">
          <Card className="rounded-xl border-gray-200">
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-gray-900">Projects Status</h3>
                  <p className="text-sm text-gray-600">Total: {submissions.length}</p>
                </div>
                <div className="flex space-x-4 text-sm">
                  <div className="text-center">
                    <div className="font-semibold text-yellow-600">
                      {submissions.filter(s => s.status === 'pending').length}
                    </div>
                    <div className="text-gray-500">Pending</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-green-600">
                      {submissions.filter(s => s.status === 'approved').length}
                    </div>
                    <div className="text-gray-500">Approved</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-red-600">
                      {submissions.filter(s => s.status === 'rejected').length}
                    </div>
                    <div className="text-gray-500">Rejected</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {profile?.name && profile?.phone_number && profile?.email && (
          <Button
            onClick={() => navigate('/submit')}
            className="w-full h-12 bg-blue-500 hover:bg-blue-600 rounded-xl text-white font-medium text-base mb-6"
          >
            Submit New Project
          </Button>
        )}

        {submissions.length > 0 && (
          <Button
            onClick={() => setActiveTab('projects')}
            variant="outline"
            className="w-full h-12 rounded-xl border-gray-200 text-gray-700 font-medium text-base"
          >
            View All Projects
          </Button>
        )}
      </div>
    </div>
  );

  if (activeTab === 'profile') {
    return renderProfileTab();
  }

  if (activeTab === 'projects') {
    return renderProjectsTab();
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {renderHomeTab()}
      
      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <div className="flex justify-around py-2">
          <button
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center py-2 px-4 ${
              activeTab === 'home' ? 'text-blue-500' : 'text-gray-500'
            }`}
          >
            <Home className="h-6 w-6" />
            <span className="text-xs mt-1">Home</span>
          </button>
          
          <button
            onClick={() => setActiveTab('projects')}
            className={`flex flex-col items-center py-2 px-4 relative ${
              activeTab === 'projects' ? 'text-blue-500' : 'text-gray-500'
            }`}
          >
            <Folder className="h-6 w-6" />
            <span className="text-xs mt-1">Projects</span>
            {hasNewNotification && (
              <div className="absolute top-1 right-3 w-2 h-2 bg-red-500 rounded-full"></div>
            )}
          </button>
          
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex flex-col items-center py-2 px-4 ${
              activeTab === 'profile' ? 'text-blue-500' : 'text-gray-500'
            }`}
          >
            <Settings className="h-6 w-6" />
            <span className="text-xs mt-1">Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
