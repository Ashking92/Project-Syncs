
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Sparkles, Heart, Star, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

const Welcome = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [currentQuote, setCurrentQuote] = useState(0);

  const peacefulQuotes = [
    "Welcome to your journey of success",
    "Every great project starts with a simple idea",
    "Your creativity deserves the perfect platform",
    "Building dreams, one project at a time"
  ];

  useEffect(() => {
    setIsVisible(true);
    
    const quoteInterval = setInterval(() => {
      setCurrentQuote((prev) => (prev + 1) % peacefulQuotes.length);
    }, 4000);

    return () => clearInterval(quoteInterval);
  }, []);

  const handleContinue = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 relative overflow-hidden">
      {/* Peaceful floating elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-2 h-2 bg-blue-300 rounded-full animate-ping opacity-60"></div>
        <div className="absolute top-40 right-20 w-3 h-3 bg-purple-300 rounded-full animate-pulse opacity-40"></div>
        <div className="absolute bottom-32 left-1/4 w-2 h-2 bg-green-300 rounded-full animate-bounce opacity-50"></div>
        <div className="absolute top-1/3 right-1/3 w-4 h-4 bg-pink-200 rounded-full animate-pulse opacity-30"></div>
        
        {/* Gentle background shapes */}
        <div className="absolute -top-32 -left-32 w-64 h-64 bg-gradient-to-r from-blue-200/20 to-purple-200/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-gradient-to-r from-cyan-200/20 to-teal-200/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-indigo-100/10 to-blue-100/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Main content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-6">
        <div className={`text-center max-w-2xl mx-auto transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          
          {/* Logo area with peaceful animation */}
          <div className="mb-12">
            <div className="relative inline-block">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-purple-500 rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-lg transform hover:scale-105 transition-all duration-300">
                <Sparkles className="h-12 w-12 text-white animate-pulse" />
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-300 rounded-full flex items-center justify-center animate-bounce">
                <Star className="h-3 w-3 text-yellow-600" />
              </div>
              <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-pink-300 rounded-full flex items-center justify-center animate-pulse">
                <Heart className="h-3 w-3 text-pink-600" />
              </div>
            </div>
          </div>

          {/* Main heading with gradient */}
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-gray-800 via-blue-600 to-purple-600 bg-clip-text text-transparent leading-tight">
            Welcome to
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600">
              PropoSync
            </span>
          </h1>

          {/* Animated quote section */}
          <div className="h-16 mb-12 flex items-center justify-center">
            <p 
              key={currentQuote}
              className="text-xl text-gray-600 animate-fade-in leading-relaxed font-light"
            >
              {peacefulQuotes[currentQuote]}
            </p>
          </div>

          {/* Peaceful features showcase */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-3xl mx-auto">
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 transform hover:scale-105">
              <div className="w-12 h-12 bg-blue-100 rounded-xl mx-auto mb-4 flex items-center justify-center">
                <Sun className="h-6 w-6 text-blue-500" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Simple & Clean</h3>
              <p className="text-sm text-gray-600">Intuitive design that feels natural</p>
            </div>
            
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 transform hover:scale-105">
              <div className="w-12 h-12 bg-purple-100 rounded-xl mx-auto mb-4 flex items-center justify-center">
                <Heart className="h-6 w-6 text-purple-500" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Made with Care</h3>
              <p className="text-sm text-gray-600">Crafted for your success</p>
            </div>
            
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 transform hover:scale-105">
              <div className="w-12 h-12 bg-green-100 rounded-xl mx-auto mb-4 flex items-center justify-center">
                <Moon className="h-6 w-6 text-green-500" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Peaceful Flow</h3>
              <p className="text-sm text-gray-600">Smooth and calming experience</p>
            </div>
          </div>

          {/* Continue button with gentle animation */}
          <Button 
            onClick={handleContinue}
            size="lg" 
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-12 py-6 text-lg rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 group"
          >
            Continue Your Journey
            <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
          </Button>

          {/* Subtle footer */}
          <div className="mt-16 text-center">
            <p className="text-sm text-gray-500 mb-2">
              Ready to bring your ideas to life?
            </p>
            <p className="text-xs text-gray-400">
              Developed with ❤️ by <span className="font-medium text-blue-500">Yash Pawar</span>
            </p>
          </div>
        </div>
      </div>

      {/* Gentle particles effect */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className={`absolute w-1 h-1 bg-blue-300 rounded-full animate-pulse opacity-40`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default Welcome;
