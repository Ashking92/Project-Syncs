
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Users, FileText, Shield, Sparkles, GraduationCap, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

const Intro = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  const features = [
    {
      icon: <FileText className="h-8 w-8 text-blue-500" />,
      title: "Easy Project Submission",
      description: "Submit your final year projects with detailed requirements"
    },
    {
      icon: <Users className="h-8 w-8 text-green-500" />,
      title: "Team Collaboration",
      description: "Work together with your team members seamlessly"
    },
    {
      icon: <Shield className="h-8 w-8 text-purple-500" />,
      title: "Secure & Reliable",
      description: "Your data is safe with enterprise-grade security"
    }
  ];

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % features.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleGetStarted = () => {
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-green-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex justify-between items-center p-6 max-w-7xl mx-auto">
        <div className="flex items-center space-x-2">
          <GraduationCap className="h-8 w-8 text-blue-600" />
          <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            PropoSync
          </span>
        </div>
        <Button 
          onClick={handleGetStarted}
          variant="outline" 
          className="border-blue-200 hover:bg-blue-50"
        >
          Login
        </Button>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-32">
        <div className={`text-center transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="inline-flex items-center px-4 py-2 bg-blue-100 rounded-full mb-8">
            <Sparkles className="h-4 w-4 text-blue-600 mr-2" />
            <span className="text-blue-600 text-sm font-medium">Modern Project Management</span>
          </div>
          
          <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent leading-tight">
            Submit Projects
            <br />
            <span className="text-blue-600">Effortlessly</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
            A comprehensive platform for students to submit final year projects, 
            collaborate with teams, and track approval status in real-time.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button 
              onClick={handleGetStarted}
              size="lg" 
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              Get Started
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="border-2 border-gray-300 hover:border-blue-400 px-8 py-6 text-lg rounded-xl hover:bg-blue-50 transition-all duration-200"
            >
              <BookOpen className="mr-2 h-5 w-5" />
              Learn More
            </Button>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-8 mt-32">
          {features.map((feature, index) => (
            <div 
              key={index}
              className={`bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-xl transform transition-all duration-500 hover:scale-105 ${
                currentSlide === index ? 'ring-2 ring-blue-400 bg-white/90' : ''
              }`}
            >
              <div className="flex items-center justify-center w-16 h-16 bg-gray-50 rounded-xl mb-6 mx-auto">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">
                {feature.title}
              </h3>
              <p className="text-gray-600 text-center leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-32 text-center">
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6">
            <div className="text-3xl font-bold text-blue-600 mb-2">500+</div>
            <div className="text-gray-600">Projects Submitted</div>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6">
            <div className="text-3xl font-bold text-green-600 mb-2">200+</div>
            <div className="text-gray-600">Active Students</div>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6">
            <div className="text-3xl font-bold text-purple-600 mb-2">95%</div>
            <div className="text-gray-600">Approval Rate</div>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6">
            <div className="text-3xl font-bold text-orange-600 mb-2">24/7</div>
            <div className="text-gray-600">Support</div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 text-center py-8 text-gray-500">
        <p>&copy; 2024 PropoSync. Empowering student success.</p>
        <p className="text-sm mt-2">
          Developed by <span className="font-medium text-blue-400">Yash Pawar</span>
        </p>
      </footer>
    </div>
  );
};

export default Intro;
