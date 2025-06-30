
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, FileText, User, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loginType, setLoginType] = useState<'student' | 'admin' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    rollNumber: "",
    adminEmail: "",
    adminPassword: ""
  });

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
      
      // Check if roll number is in valid range (D234101 to D234160)
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <header className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center space-x-4">
              <Link to="/" className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors">
                <ArrowLeft className="h-5 w-5" />
                <span>Back to Home</span>
              </Link>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                <h1 className="text-xl font-bold text-gray-900">PropoSync</h1>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto space-y-6">
            <Card className="shadow-xl border-0">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg text-center">
                <CardTitle className="text-2xl">Choose Login Type</CardTitle>
                <p className="text-blue-100">Select your role to continue</p>
              </CardHeader>
              
              <CardContent className="p-8 space-y-4">
                <Button
                  onClick={() => setLoginType('student')}
                  className="w-full py-6 text-lg bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                >
                  <User className="h-6 w-6 mr-3" />
                  Student Login
                </Button>
                
                <Button
                  onClick={() => setLoginType('admin')}
                  className="w-full py-6 text-lg bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
                >
                  <Shield className="h-6 w-6 mr-3" />
                  Admin Login
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setLoginType(null)}
              className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back</span>
            </button>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">PropoSync</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <Card className="shadow-xl border-0">
            <CardHeader className={`text-white rounded-t-lg ${
              loginType === 'student' 
                ? 'bg-gradient-to-r from-green-500 to-green-600'
                : 'bg-gradient-to-r from-purple-500 to-purple-600'
            }`}>
              <CardTitle className="text-2xl flex items-center space-x-2">
                {loginType === 'student' ? <User className="h-6 w-6" /> : <Shield className="h-6 w-6" />}
                <span>{loginType === 'student' ? 'Student Login' : 'Admin Login'}</span>
              </CardTitle>
              <p className="text-sm opacity-90">
                {loginType === 'student' 
                  ? 'Enter your roll number (D234101 - D234160)'
                  : 'Enter admin credentials'
                }
              </p>
            </CardHeader>
            
            <CardContent className="p-8">
              {loginType === 'student' ? (
                <form onSubmit={handleStudentLogin} className="space-y-4">
                  <div>
                    <Label htmlFor="rollNumber">Roll Number</Label>
                    <Input
                      id="rollNumber"
                      name="rollNumber"
                      value={formData.rollNumber}
                      onChange={handleInputChange}
                      placeholder="e.g., D234101"
                      required
                      disabled={isLoading}
                    />
                  </div>
                  
                  <Button
                    type="submit"
                    className="w-full py-3 text-lg bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                    disabled={isLoading}
                  >
                    {isLoading ? "Logging in..." : "Login"}
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleAdminLogin} className="space-y-4">
                  <div>
                    <Label htmlFor="adminEmail">Email</Label>
                    <Input
                      id="adminEmail"
                      name="adminEmail"
                      type="email"
                      value={formData.adminEmail}
                      onChange={handleInputChange}
                      placeholder="husna.kazi@theemcoe.org"
                      required
                      disabled={isLoading}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="adminPassword">Password</Label>
                    <Input
                      id="adminPassword"
                      name="adminPassword"
                      type="password"
                      value={formData.adminPassword}
                      onChange={handleInputChange}
                      placeholder="Enter password"
                      required
                      disabled={isLoading}
                    />
                  </div>
                  
                  <Button
                    type="submit"
                    className="w-full py-3 text-lg bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
                    disabled={isLoading}
                  >
                    {isLoading ? "Logging in..." : "Login"}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Auth;
