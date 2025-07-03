
import { useState, useEffect } from 'react';
import { GraduationCap, Sparkles, Zap, BookOpen, Users } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
}

const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  const [progress, setProgress] = useState(0);
  const [currentFeature, setCurrentFeature] = useState(0);

  const features = [
    { icon: BookOpen, text: "Loading Projects...", color: "text-blue-400" },
    { icon: Users, text: "Connecting Students...", color: "text-purple-400" },
    { icon: Zap, text: "Initializing System...", color: "text-emerald-400" },
    { icon: Sparkles, text: "Almost Ready...", color: "text-pink-400" }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 800);
          return 100;
        }
        return prev + 1.5;
      });
    }, 80);

    // Cycle through features
    const featureInterval = setInterval(() => {
      setCurrentFeature(prev => (prev + 1) % features.length);
    }, 1200);

    return () => {
      clearInterval(interval);
      clearInterval(featureInterval);
    };
  }, [onComplete]);

  const CurrentIcon = features[currentFeature].icon;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center z-50 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        {/* Floating particles */}
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white/20 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`
            }}
          />
        ))}
        
        {/* Large gradient orbs */}
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-gradient-to-r from-blue-500/30 to-purple-500/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded-full blur-3xl animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 rounded-full blur-3xl animate-pulse animation-delay-4000"></div>
      </div>

      <div className="relative z-10 text-center">
        {/* Main logo container with advanced animations */}
        <div className="mb-12 relative">
          {/* Outer rotating ring */}
          <div className="w-32 h-32 mx-auto relative">
            <div className="absolute inset-0 rounded-full border-2 border-gradient-to-r from-blue-400 to-purple-400 animate-spin border-dashed opacity-30"></div>
            <div className="absolute inset-2 rounded-full border-2 border-gradient-to-r from-purple-400 to-pink-400 animate-spin animate-reverse opacity-40"></div>
            
            {/* Main logo background */}
            <div className="absolute inset-4 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-2xl transform hover:scale-110 transition-all duration-500">
              <div className="absolute inset-0 bg-white/10 rounded-full animate-pulse"></div>
              <GraduationCap className="h-12 w-12 text-white relative z-10 drop-shadow-lg" />
            </div>
            
            {/* Floating mini icons */}
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center animate-bounce shadow-lg">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <div className="absolute -bottom-2 -left-2 w-8 h-8 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-full flex items-center justify-center animate-pulse shadow-lg">
              <Zap className="h-4 w-4 text-white" />
            </div>
          </div>
        </div>

        {/* Brand name with enhanced typography */}
        <div className="mb-8">
          <h1 className="text-6xl md:text-7xl font-bold mb-3 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent leading-tight tracking-tight">
            PropoSync
          </h1>
          <div className="flex items-center justify-center space-x-2 mb-2">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-blue-400"></div>
            <p className="text-white/80 text-xl font-light tracking-wider">Project Proposal Hub</p>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-purple-400"></div>
          </div>
          <p className="text-white/60 text-sm font-medium">Streamline • Collaborate • Succeed</p>
        </div>
        
        {/* Enhanced progress section */}
        <div className="w-80 mx-auto mb-8">
          {/* Feature indicator */}
          <div className="flex items-center justify-center mb-6 h-8">
            <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm rounded-full px-6 py-2 border border-white/20">
              <CurrentIcon className={`h-5 w-5 ${features[currentFeature].color} animate-pulse`} />
              <span className="text-white/90 text-sm font-medium">{features[currentFeature].text}</span>
            </div>
          </div>
          
          {/* Modern progress bar */}
          <div className="relative">
            <div className="bg-white/20 backdrop-blur-sm rounded-full h-3 overflow-hidden border border-white/30 shadow-inner">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full transition-all duration-300 ease-out relative overflow-hidden"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
              </div>
            </div>
            
            {/* Progress percentage */}
            <div className="flex items-center justify-between mt-3">
              <span className="text-white/50 text-xs font-medium">Initializing</span>
              <span className="text-white/90 text-sm font-bold">{Math.round(progress)}%</span>
              <span className="text-white/50 text-xs font-medium">Complete</span>
            </div>
          </div>
        </div>

        {/* Enhanced loading dots */}
        <div className="flex items-center justify-center space-x-2 mb-12">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 animate-bounce"
              style={{
                animationDelay: `${i * 0.15}s`,
                animationDuration: '1s'
              }}
            />
          ))}
        </div>
        
        {/* Modern footer */}
        <div className="space-y-3">
          <div className="flex items-center justify-center space-x-2 text-white/40 text-sm">
            <div className="w-1 h-1 bg-white/40 rounded-full"></div>
            <span>Powered by Innovation</span>
            <div className="w-1 h-1 bg-white/40 rounded-full"></div>
          </div>
          <p className="text-white/60 text-sm">
            Crafted with <span className="text-red-400 animate-pulse">♥</span> by{' '}
            <span className="font-semibold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Yash Pawar
            </span>
          </p>
        </div>
      </div>

      {/* Subtle edge glow effect */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/20 pointer-events-none"></div>
    </div>
  );
};

export default SplashScreen;
