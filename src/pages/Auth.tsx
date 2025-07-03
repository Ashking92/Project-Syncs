
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, User, Shield, GraduationCap, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login } = useAuth();
  const [searchParams] = useSearchParams();
  const [userType, setUserType] = useState(searchParams.get('type') || 'student');
  const [rollNumber, setRollNumber] = useState("");
  const [department, setDepartment] = useState("");
  const [adminCode, setAdminCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const validateRollNumber = (rollNum: string, dept: string) => {
    const numericPart = parseInt(rollNum.substring(1));
    
    if (dept === 'CS') {
      return rollNum.startsWith('D') && numericPart >= 234101 && numericPart <= 234160;
    } else if (dept === 'IT') {
      return rollNum.startsWith('D') && numericPart >= 235101 && numericPart <= 235130;
    }
    return false;
  };

  const handleStudentLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!department) {
      toast({
        title: "Department Required",
        description: "Please select your department",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    if (!validateRollNumber(rollNumber, department)) {
      const range = department === 'CS' ? 'D234101 to D234160' : 'D235101 to D235130';
      toast({
        title: "Invalid Roll Number",
        description: `${department} department roll numbers should be in range ${range}`,
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      let { data: profile, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('roll_number', rollNumber)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      if (!profile) {
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            roll_number: rollNumber,
            ip_address: 'web-login'
          })
          .select()
          .single();

        if (createError) throw createError;
        profile = newProfile;
      }

      const userData = {
        type: 'student' as const,
        rollNumber: rollNumber,
        department: department,
        profileId: profile.id,
        loginTime: new Date().toISOString(),
        persistentLogin: true
      };

      login(userData);

      toast({
        title: "Login Successful! 🎉",
        description: `Welcome ${department} student ${rollNumber}`,
      });

      setTimeout(() => {
        navigate('/student-dashboard');
      }, 500);

    } catch (error: any) {
      console.error('Student login error:', error);
      toast({
        title: "Login Failed",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (adminCode !== "ADMIN123") {
      toast({
        title: "Invalid Admin Code",
        description: "Please enter the correct admin code",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    const adminData = {
      type: 'admin' as const,
      adminCode: adminCode,
      loginTime: new Date().toISOString(),
      persistentLogin: true
    };

    login(adminData);

    toast({
      title: "Admin Login Successful! 🎉",
      description: "Welcome Admin",
    });

    setTimeout(() => {
      navigate('/admin');
    }, 500);

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
      {/* Background animations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-indigo-400/20 to-blue-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative container mx-auto px-4 py-8 max-w-md">
        <div className="flex items-center mb-8">
          <button
            onClick={() => navigate('/')}
            className="mr-4 p-2 rounded-full hover:bg-white/20 transition-colors"
          >
            <ArrowLeft className="h-6 w-6 text-gray-700" />
          </button>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            {userType === 'student' ? 'Student Login' : 'Teacher Login'}
          </h1>
        </div>

        <div className="flex space-x-2 mb-6">
          <Button
            onClick={() => setUserType('student')}
            variant={userType === 'student' ? 'default' : 'outline'}
            className="flex-1 rounded-xl"
          >
            <GraduationCap className="h-4 w-4 mr-2" />
            Student
          </Button>
          <Button
            onClick={() => setUserType('admin')}
            variant={userType === 'admin' ? 'default' : 'outline'}
            className="flex-1 rounded-xl"
          >
            <UserCheck className="h-4 w-4 mr-2" />
            Teacher
          </Button>
        </div>

        <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-center flex items-center justify-center space-x-2">
              {userType === 'student' ? (
                <User className="h-6 w-6 text-blue-600" />
              ) : (
                <Shield className="h-6 w-6 text-purple-600" />
              )}
              <span>{userType === 'student' ? 'Student Access' : 'Teacher Access'}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {userType === 'student' ? (
              <form onSubmit={handleStudentLogin} className="space-y-4">
                <div>
                  <Label htmlFor="department" className="text-base font-medium text-gray-900">
                    Department
                  </Label>
                  <Select value={department} onValueChange={setDepartment} required>
                    <SelectTrigger className="h-12 rounded-xl border-gray-200 bg-gray-50">
                      <SelectValue placeholder="Select your department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CS">Computer Science (CS)</SelectItem>
                      <SelectItem value="IT">Information Technology (IT)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-gray-500 mt-1">
                    {department === 'CS' && 'CS: D234101 - D234160'}
                    {department === 'IT' && 'IT: D235101 - D235130'}
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="rollNumber" className="text-base font-medium text-gray-900">
                    Roll Number
                  </Label>
                  <Input
                    id="rollNumber"
                    type="text"
                    value={rollNumber}
                    onChange={(e) => setRollNumber(e.target.value.toUpperCase())}
                    placeholder="Enter your roll number (e.g., D234101)"
                    className="h-12 rounded-xl border-gray-200 bg-gray-50"
                    required
                  />
                </div>
                
                <Button
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl font-medium"
                  disabled={isLoading}
                >
                  {isLoading ? "Logging in..." : "Login"}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleAdminLogin} className="space-y-4">
                <div>
                  <Label htmlFor="adminCode" className="text-base font-medium text-gray-900">
                    Admin Code
                  </Label>
                  <Input
                    id="adminCode"
                    type="password"
                    value={adminCode}
                    onChange={(e) => setAdminCode(e.target.value)}
                    placeholder="Enter admin code"
                    className="h-12 rounded-xl border-gray-200 bg-gray-50"
                    required
                  />
                </div>
                
                <Button
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 rounded-xl font-medium"
                  disabled={isLoading}
                >
                  {isLoading ? "Logging in..." : "Login as Teacher"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
