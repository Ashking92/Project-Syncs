
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FileText, Upload, BarChart3, Users, GraduationCap, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Home = () => {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userData = localStorage.getItem('proposync-user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-indigo-400/20 to-blue-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-purple-300/10 to-pink-300/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Header */}
      <header className="relative bg-white/80 backdrop-blur-sm shadow-sm border-b border-white/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <FileText className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Project Sync
                </h1>
                <p className="text-sm text-gray-600">Project Management System</p>
              </div>
            </div>
            
            {user && (
              <div className="flex items-center space-x-4">
                <span className="text-gray-600 font-medium">
                  Welcome, {user.type === 'admin' ? 'Admin' : user.rollNumber}
                </span>
                <Link
                  to={user.type === 'admin' ? '/admin' : '/student-dashboard'}
                  className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
                >
                  Go to Dashboard
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 animate-fade-in">
            Welcome to <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Project Sync</span>
          </h2>
          <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto mb-12 animate-fade-in delay-200">
            A comprehensive platform for seamless project proposal management and collaboration
          </p>
          
          {!user && (
            <div className="flex flex-col sm:flex-row gap-6 justify-center animate-fade-in delay-300">
              <Link to="/auth?type=student">
                <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-lg px-10 py-6 rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
                  <GraduationCap className="h-6 w-6 mr-3" />
                  Student Login
                </Button>
              </Link>
              <Link to="/auth?type=admin">
                <Button size="lg" variant="outline" className="w-full sm:w-auto border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-600 hover:text-white text-lg px-10 py-6 rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
                  <UserCheck className="h-6 w-6 mr-3" />
                  Teacher Login
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="shadow-2xl border-0 hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2 bg-white/70 backdrop-blur-sm animate-fade-in delay-400">
            <CardHeader className="text-center pb-4">
              <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg transform hover:rotate-6 transition-transform duration-300">
                <Upload className="h-10 w-10 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-800">Easy Submission</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600 text-lg leading-relaxed">
                Students can effortlessly submit project proposals with comprehensive details, team information, and technical requirements through our intuitive interface.
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-2xl border-0 hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2 bg-white/70 backdrop-blur-sm animate-fade-in delay-500">
            <CardHeader className="text-center pb-4">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-violet-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg transform hover:rotate-6 transition-transform duration-300">
                <BarChart3 className="h-10 w-10 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-800">Admin Dashboard</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600 text-lg leading-relaxed">
                Teachers get powerful tools to review, approve, reject, and provide feedback on projects with advanced search, filtering, and real-time notifications.
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-2xl border-0 hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2 bg-white/70 backdrop-blur-sm animate-fade-in delay-600">
            <CardHeader className="text-center pb-4">
              <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg transform hover:rotate-6 transition-transform duration-300">
                <Users className="h-10 w-10 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-800">Team Management</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600 text-lg leading-relaxed">
                Comprehensive support for collaborative projects with detailed team member management and streamlined project coordination features.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Action Cards for Authenticated Users */}
        {user && (
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto animate-fade-in">
            {user.type === 'student' ? (
              <>
                <Card className="shadow-2xl border-0 hover:shadow-3xl transition-all duration-500 cursor-pointer transform hover:scale-105 bg-gradient-to-br from-green-50 to-emerald-50">
                  <Link to="/student-dashboard">
                    <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-t-lg p-8">
                      <CardTitle className="text-3xl flex items-center space-x-4">
                        <Users className="h-10 w-10" />
                        <span>Student Dashboard</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8">
                      <p className="text-gray-600 text-xl leading-relaxed">
                        Manage your profile, submit new projects, track submissions, and receive real-time updates on your project status.
                      </p>
                    </CardContent>
                  </Link>
                </Card>

                <Card className="shadow-2xl border-0 hover:shadow-3xl transition-all duration-500 cursor-pointer transform hover:scale-105 bg-gradient-to-br from-blue-50 to-indigo-50">
                  <Link to="/submit">
                    <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg p-8">
                      <CardTitle className="text-3xl flex items-center space-x-4">
                        <Upload className="h-10 w-10" />
                        <span>Submit Project</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8">
                      <p className="text-gray-600 text-xl leading-relaxed">
                        Submit your innovative project proposals with comprehensive documentation and technical specifications.
                      </p>
                    </CardContent>
                  </Link>
                </Card>
              </>
            ) : (
              <Card className="shadow-2xl border-0 hover:shadow-3xl transition-all duration-500 cursor-pointer md:col-span-2 transform hover:scale-105 bg-gradient-to-br from-purple-50 to-indigo-50">
                <Link to="/admin">
                  <CardHeader className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-t-lg p-8">
                    <CardTitle className="text-3xl flex items-center space-x-4">
                      <BarChart3 className="h-10 w-10" />
                      <span>Admin Dashboard</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-8">
                    <p className="text-gray-600 text-xl leading-relaxed">
                      Comprehensive project management hub to review, evaluate, and manage all student submissions with real-time analytics and communication tools.
                    </p>
                  </CardContent>
                </Link>
              </Card>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="relative bg-white/80 backdrop-blur-sm border-t border-white/20 mt-20">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-4 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Project Sync
              </h3>
            </div>
            <p className="text-gray-600 text-lg">
              Streamlining project proposal management for educational institutions
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
