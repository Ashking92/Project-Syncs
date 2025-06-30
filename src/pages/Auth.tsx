
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, FileText } from "lucide-react";
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
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-sm">
            <div className="text-center mb-12">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Student Login</h1>
            </div>
            
            <form onSubmit={handleStudentLogin} className="space-y-6">
              <div>
                <Input
                  name="rollNumber"
                  value={formData.rollNumber}
                  onChange={handleInputChange}
                  placeholder="Roll Number"
                  className="h-14 text-base rounded-2xl border-gray-200 bg-gray-100 px-4"
                  required
                  disabled={isLoading}
                />
              </div>
              
              <Button
                type="submit"
                className="w-full h-14 bg-blue-500 hover:bg-blue-600 rounded-2xl text-white font-medium text-base"
                disabled={isLoading}
              >
                {isLoading ? "Loading..." : "Submit"}
              </Button>
            </form>

            <div className="text-center mt-8">
              <button
                onClick={() => setLoginType('admin')}
                className="text-gray-600 text-base underline"
              >
                Admin Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loginType === 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <div className="flex items-center p-4 border-b bg-white">
          <button
            onClick={() => setLoginType(null)}
            className="mr-4"
          >
            <ArrowLeft className="h-6 w-6 text-gray-700" />
          </button>
          <h1 className="text-xl font-semibold text-gray-900">Admin Login</h1>
        </div>

        <div className="flex-1 flex items-start justify-center p-4 pt-8">
          <div className="w-full max-w-sm">
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
                  className="h-14 text-base rounded-xl border-gray-200 bg-gray-100"
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
                  className="h-14 text-base rounded-xl border-gray-200 bg-gray-100"
                  required
                  disabled={isLoading}
                />
              </div>
              
              <Button
                type="submit"
                className="w-full h-14 bg-blue-500 hover:bg-blue-600 rounded-xl text-white font-medium text-base"
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
