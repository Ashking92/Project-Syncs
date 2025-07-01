import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [loginType, setLoginType] = useState<'student' | 'admin' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    rollNumber: "",
    adminEmail: "",
    adminPassword: ""
  });

  useEffect(() => {
    const typeFromUrl = searchParams.get('type');
    if (typeFromUrl === 'student' || typeFromUrl === 'admin') {
      setLoginType(typeFromUrl);
    }
  }, [searchParams]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const getDeviceFingerprint = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx?.fillText('Device fingerprint', 10, 10);
    const fingerprint = canvas.toDataURL();
    return btoa(fingerprint + navigator.userAgent + screen.width + screen.height);
  };

  const getClientIP = async () => {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch (error) {
      return 'unknown';
    }
  };

  const handleStudentLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const rollNumber = formData.rollNumber.toUpperCase();
      
     // ✅ Validate roll number format and range based on branch
      const rollMatch = rollNumber.match(/^D(\d{6})$/);
      if (!rollMatch) {
        throw new Error('Invalid roll number format. Use format: D234101');
      }
      
      const rollNum = parseInt(rollMatch[1]);
      if (rollNum < 234101 || rollNum > 234160) {
        throw new Error('Roll number must be between D234101 and D234160');
      }

      const deviceId = getDeviceFingerprint();
      const ipAddress = await getClientIP();
      // Check if profile exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('roll_number', rollNumber)
        .single();

      if (existingProfile) {
        // Check device restriction
        if (existingProfile.device_id && existingProfile.device_id !== deviceId) {
          throw new Error('This account is already logged in on another device');
        }
        
        // Update device info
        await supabase
          .from('profiles')
          .update({ device_id: deviceId, ip_address: ipAddress })
          .eq('roll_number', rollNumber);
      } else {
        // Create new profile
        await supabase
          .from('profiles')
          .insert({
            roll_number: rollNumber,
            device_id: deviceId,
            ip_address: ipAddress
          });
      }

      // Store student session
      localStorage.setItem('proposync-user', JSON.stringify({
        type: 'student',
        rollNumber: rollNumber,
        deviceId: deviceId
      }));

      toast({
        title: "Login Successful! 🎉",
        description: `Welcome ${rollNumber}`,
      });

      navigate('/student-dashboard');
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (formData.adminEmail !== 'husna.kazi@theemcoe.org' || formData.adminPassword !== 'Husna@123') {
        throw new Error('Invalid admin credentials');
      }

      // Store admin session
      localStorage.setItem('proposync-user', JSON.stringify({
        type: 'admin',
        email: formData.adminEmail
      }));

      toast({
        title: "Admin Login Successful! 🎉",
        description: "Welcome to admin dashboard",
      });

      navigate('/admin');
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!loginType) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-2xl animate-pulse"></div>
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-gradient-to-r from-indigo-400/20 to-blue-400/20 rounded-full blur-2xl animate-pulse delay-1000"></div>
        </div>

        <div className="flex-1 flex items-center justify-center p-4 relative">
          <div className="w-full max-w-sm">
            <div className="text-center mb-12">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                <FileText className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">Project Sync</h1>
              <p className="text-gray-600">Choose your login type</p>
            </div>
            
            <div className="space-y-4">
              <Button
                onClick={() => setLoginType('student')}
                className="w-full h-16 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 rounded-2xl text-white font-medium text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
              >
                Student Login
              </Button>
              
              <Button
                onClick={() => setLoginType('admin')}
                variant="outline"
                className="w-full h-16 border-2 border-indigo-500 text-indigo-600 hover:bg-indigo-500 hover:text-white rounded-2xl font-medium text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
              >
                Teacher Login
              </Button>
            </div>

            <div className="text-center mt-8">
              <Link to="/" className="text-gray-600 text-base hover:text-gray-800 transition-colors">
                ← Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loginType === 'student') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-2xl animate-pulse"></div>
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-gradient-to-r from-indigo-400/20 to-blue-400/20 rounded-full blur-2xl animate-pulse delay-1000"></div>
        </div>

        <div className="flex items-center p-4 border-b bg-white/80 backdrop-blur-sm relative">
          <button
            onClick={() => setLoginType(null)}
            className="mr-4 hover:bg-gray-100 p-2 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-6 w-6 text-gray-700" />
          </button>
          <h1 className="text-xl font-semibold text-gray-900">Student Login</h1>
        </div>

        <div className="flex-1 flex items-center justify-center p-4 relative">
          <div className="w-full max-w-sm">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl">
                <FileText className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome Student</h2>
              <p className="text-gray-600">Enter your roll number to continue</p>
            </div>
            
            <form onSubmit={handleStudentLogin} className="space-y-6">
              <div>
                <Input
                  name="rollNumber"
                  value={formData.rollNumber}
                  onChange={handleInputChange}
                  placeholder="Roll Number (e.g., D234101)"
                  className="h-14 text-base rounded-2xl border-gray-200 bg-white/70 backdrop-blur-sm px-4 shadow-lg"
                  required
                  disabled={isLoading}
                />
              </div>
              
              <Button
                type="submit"
                className="w-full h-14 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 rounded-2xl text-white font-medium text-base shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                disabled={isLoading}
              >
                {isLoading ? "Logging in..." : "Login"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  if (loginType === 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-2xl animate-pulse"></div>
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-gradient-to-r from-indigo-400/20 to-blue-400/20 rounded-full blur-2xl animate-pulse delay-1000"></div>
        </div>

        <div className="flex items-center p-4 border-b bg-white/80 backdrop-blur-sm relative">
          <button
            onClick={() => setLoginType(null)}
            className="mr-4 hover:bg-gray-100 p-2 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-6 w-6 text-gray-700" />
          </button>
          <h1 className="text-xl font-semibold text-gray-900">Teacher Login</h1>
        </div>

        <div className="flex-1 flex items-start justify-center p-4 pt-8 relative">
          <div className="w-full max-w-sm">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl">
                <FileText className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome Teacher</h2>
              <p className="text-gray-600">Sign in to your admin account</p>
            </div>

            <form onSubmit={handleAdminLogin} className="space-y-6">
              <div>
                <Label htmlFor="adminEmail" className="text-base font-medium text-gray-900 mb-2 block">
                  Email
                </Label>
                <Input
                  id="adminEmail"
                  name="adminEmail"
                  type="email"
                  value={formData.adminEmail}
                  onChange={handleInputChange}
                  placeholder="Enter your email"
                  className="h-14 text-base rounded-xl border-gray-200 bg-white/70 backdrop-blur-sm shadow-lg"
                  required
                  disabled={isLoading}
                />
              </div>
              
              <div>
                <Label htmlFor="adminPassword" className="text-base font-medium text-gray-900 mb-2 block">
                  Password
                </Label>
                <Input
                  id="adminPassword"
                  name="adminPassword"
                  type="password"
                  value={formData.adminPassword}
                  onChange={handleInputChange}
                  placeholder="Enter your password"
                  className="h-14 text-base rounded-xl border-gray-200 bg-white/70 backdrop-blur-sm shadow-lg"
                  required
                  disabled={isLoading}
                />
              </div>
              
              <Button
                type="submit"
                className="w-full h-14 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 rounded-xl text-white font-medium text-base shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                disabled={isLoading}
              >
                {isLoading ? "Logging in..." : "Login"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default Auth;
