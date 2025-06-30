
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FileText, Upload, BarChart3, Users, LogIn } from "lucide-react";
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">PropoSync</h1>
                <p className="text-sm text-gray-600">Project Proposal Management System</p>
              </div>
            </div>
            
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-gray-600">
                  Welcome, {user.type === 'admin' ? 'Admin' : user.rollNumber}
                </span>
                <Link
                  to={user.type === 'admin' ? '/admin' : '/student-dashboard'}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Go to Dashboard
                </Link>
              </div>
            ) : (
              <Link to="/auth">
                <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                  <LogIn className="h-4 w-4 mr-2" />
                  Login
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Welcome to <span className="text-blue-600">PropoSync</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            A comprehensive platform for college students to submit project proposals and for teachers to manage and review them effectively.
          </p>
          
          {!user && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth">
                <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-lg px-8 py-4">
                  <LogIn className="h-5 w-5 mr-2" />
                  Get Started
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <Card className="shadow-lg border-0 hover:shadow-xl transition-shadow">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Upload className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-xl">Easy Submission</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600">
                Students can easily submit their project proposals with all required details including team information, technical requirements, and cost estimation.
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 hover:shadow-xl transition-shadow">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-xl">Admin Dashboard</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600">
                Teachers can review, approve, reject, and add remarks to project proposals through a comprehensive admin dashboard with search and filtering capabilities.
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 hover:shadow-xl transition-shadow">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-xl">Team Management</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600">
                Support for team projects with detailed team member information and collaborative project planning features.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Action Cards */}
        {user && (
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {user.type === 'student' ? (
              <>
                <Card className="shadow-xl border-0 hover:shadow-2xl transition-shadow cursor-pointer">
                  <Link to="/student-dashboard">
                    <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-t-lg">
                      <CardTitle className="text-2xl flex items-center space-x-3">
                        <Users className="h-8 w-8" />
                        <span>Student Dashboard</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8">
                      <p className="text-gray-600 text-lg">
                        Manage your profile, submit new projects, and track your submissions.
                      </p>
                    </CardContent>
                  </Link>
                </Card>

                <Card className="shadow-xl border-0 hover:shadow-2xl transition-shadow cursor-pointer">
                  <Link to="/submit">
                    <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
                      <CardTitle className="text-2xl flex items-center space-x-3">
                        <Upload className="h-8 w-8" />
                        <span>Submit Project</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8">
                      <p className="text-gray-600 text-lg">
                        Submit your project proposal with all the required details and documentation.
                      </p>
                    </CardContent>
                  </Link>
                </Card>
              </>
            ) : (
              <Card className="shadow-xl border-0 hover:shadow-2xl transition-shadow cursor-pointer md:col-span-2">
                <Link to="/admin">
                  <CardHeader className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-t-lg">
                    <CardTitle className="text-2xl flex items-center space-x-3">
                      <BarChart3 className="h-8 w-8" />
                      <span>Admin Dashboard</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-8">
                    <p className="text-gray-600 text-lg">
                      Review and manage all project submissions from students. Approve, reject, or add remarks to proposals.
                    </p>
                  </CardContent>
                </Link>
              </Card>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-white border-t mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">PropoSync</h3>
            </div>
            <p className="text-gray-600">
              Streamlining project proposal management for educational institutions.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
