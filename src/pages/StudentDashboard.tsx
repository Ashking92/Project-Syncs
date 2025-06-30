
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, User, Edit, Home, Folder, Settings, LogOut, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('home');
  
  const [formData, setFormData] = useState({
    name: "",
    phone_number: "",
    email: "",
    photo_url: ""
  });

  useEffect(() => {
    checkAuth();
  }, []);

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
                  <span className="text-gray-600">Major</span>
                  <span className="font-medium">Computer Science</span>
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

  const renderHomeTab = () => (
    <div className="min-h-screen bg-gray-50">
      <div className="flex items-center justify-between p-4 border-b bg-white">
        <div className="flex items-center">
          <Menu className="h-6 w-6 text-gray-700 mr-3" />
          <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
        </div>
        <button onClick={handleLogout}>
          <LogOut className="h-6 w-6 text-gray-700" />
        </button>
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

        {profile?.name && profile?.phone_number && profile?.email && (
          <Button
            onClick={() => navigate('/submit')}
            className="w-full h-12 bg-blue-500 hover:bg-blue-600 rounded-xl text-white font-medium text-base mb-6"
          >
            Submit Project
          </Button>
        )}
      </div>
    </div>
  );

  if (activeTab === 'profile') {
    return renderProfileTab();
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
            onClick={() => navigate('/submit')}
            className="flex flex-col items-center py-2 px-4 text-gray-500"
          >
            <Folder className="h-6 w-6" />
            <span className="text-xs mt-1">Projects</span>
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
