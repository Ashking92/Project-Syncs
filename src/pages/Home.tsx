
import { Link } from "react-router-dom";
import { FileText, BarChart3, Users, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                PropoSync
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Project Management
            <span className="block bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Made Simple
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Streamline your college project submissions and management with PropoSync. 
            Built for students and teachers to collaborate efficiently.
          </p>
        </div>

        {/* Action Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
          <Card className="group hover:scale-105 transition-all duration-300 cursor-pointer border-0 shadow-lg hover:shadow-xl">
            <Link to="/submit">
              <CardContent className="p-8 text-center bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Submit Project</h3>
                <p className="text-blue-100 mb-6">
                  Submit your project proposal with all required details
                </p>
                <Button variant="secondary" className="w-full">
                  Get Started →
                </Button>
              </CardContent>
            </Link>
          </Card>

          <Card className="group hover:scale-105 transition-all duration-300 cursor-pointer border-0 shadow-lg hover:shadow-xl">
            <Link to="/admin">
              <CardContent className="p-8 text-center bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-lg">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-bold mb-2">View Dashboard</h3>
                <p className="text-indigo-100 mb-6">
                  Manage and review all project submissions
                </p>
                <Button variant="secondary" className="w-full">
                  Access Dashboard →
                </Button>
              </CardContent>
            </Link>
          </Card>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">Team Collaboration</h4>
            <p className="text-gray-600">Manage team members and project details efficiently</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-6 w-6 text-indigo-600" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">Easy Approval</h4>
            <p className="text-gray-600">Quick review and approval process for teachers</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="h-6 w-6 text-purple-600" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">Progress Tracking</h4>
            <p className="text-gray-600">Track submission status and project progress</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-gray-600">
            <p>&copy; 2024 PropoSync. Built for educational excellence.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
