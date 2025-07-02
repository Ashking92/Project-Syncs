
import { useState, useEffect } from "react";

interface ModernLoaderProps {
  text?: string;
  size?: "sm" | "md" | "lg";
}

const ModernLoader = ({ text = "Loading...", size = "md" }: ModernLoaderProps) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => (prev >= 90 ? 90 : prev + Math.random() * 15));
    }, 200);
    return () => clearInterval(interval);
  }, []);

  const sizeClasses = {
    sm: "w-12 h-12",
    md: "w-20 h-20", 
    lg: "w-32 h-32"
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center relative overflow-hidden">
      {/* Background animations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-indigo-400/20 to-blue-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-emerald-400/10 to-cyan-400/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 text-center">
        {/* Enhanced Multi-Ring Loader */}
        <div className={`relative mb-8 ${sizeClasses[size]} mx-auto`}>
          <div className="absolute inset-0 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin"></div>
          <div className="absolute inset-2 rounded-full border-4 border-transparent border-r-purple-600 animate-spin animate-reverse"></div>
          <div className="absolute inset-4 rounded-full border-4 border-transparent border-b-emerald-600 animate-spin"></div>
          <div className="absolute inset-6 rounded-full border-4 border-transparent border-l-orange-600 animate-spin animate-reverse"></div>
          
          {/* Center glow */}
          <div className="absolute inset-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 animate-pulse shadow-lg"></div>
        </div>

        {/* Enhanced text with gradient animation */}
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-600 bg-clip-text text-transparent mb-3 animate-pulse">
          PropoSync Connect
        </h2>
        
        {/* Bouncing dots */}
        <div className="flex items-center justify-center space-x-1 mb-4">
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
          <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce delay-100"></div>
          <div className="w-3 h-3 bg-emerald-500 rounded-full animate-bounce delay-200"></div>
        </div>

        {/* Animated Progress Bar */}
        <div className="w-64 mx-auto mb-4">
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500 rounded-full transition-all duration-500 ease-out shadow-lg animate-pulse"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-500 mt-2">{Math.round(progress)}%</p>
        </div>

        <p className="text-gray-600 font-medium text-lg animate-pulse">{text}</p>
        
        {/* Footer in loader */}
        <div className="mt-8">
          <p className="text-sm text-gray-400">
            Developed by <span className="font-medium text-blue-500">Yash Pawar</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ModernLoader;
