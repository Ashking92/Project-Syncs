import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Lightbulb, Code, Database, Globe, Smartphone, Brain, Shield, Gamepad2, TrendingUp, Zap, Monitor, Wifi, Heart, Car, Music, Camera, Clock, MapPin, DollarSign, BookOpen, Users, Settings, Search, FileText, Video, Cpu, Cloud, Lock, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface ProjectIdea {
  id: string;
  title: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  technologies: string[];
  category: string;
  icon: React.ReactNode;
  estimatedCost: string;
  teamSize: number;
}

const csProjectIdeas: ProjectIdea[] = [
  {
    id: "1",
    title: "Smart Library Management System",
    description: "Digital library system with book tracking, user management, and automated fine calculation",
    difficulty: "Intermediate",
    technologies: ["React", "Node.js", "MongoDB", "Express"],
    category: "Web Development",
    icon: <Database className="h-5 w-5" />,
    estimatedCost: "15000",
    teamSize: 3
  },
  {
    id: "2",
    title: "AI-Powered Chatbot for College",
    description: "Intelligent chatbot to answer student queries about admissions, courses, and campus facilities",
    difficulty: "Advanced",
    technologies: ["Python", "NLP", "TensorFlow", "Flask"],
    category: "AI/ML",
    icon: <Brain className="h-5 w-5" />,
    estimatedCost: "25000",
    teamSize: 4
  },
  {
    id: "3",
    title: "Online Examination Portal",
    description: "Secure online exam platform with auto-grading, proctoring features, and result analytics",
    difficulty: "Advanced",
    technologies: ["Angular", "Spring Boot", "MySQL", "WebRTC"],
    category: "Web Development",
    icon: <Shield className="h-5 w-5" />,
    estimatedCost: "30000",
    teamSize: 4
  },
  {
    id: "4",
    title: "Student Attendance Tracker",
    description: "Mobile app for tracking student attendance using QR codes and geolocation",
    difficulty: "Intermediate",
    technologies: ["React Native", "Firebase", "QR Scanner"],
    category: "Mobile Development",
    icon: <Smartphone className="h-5 w-5" />,
    estimatedCost: "12000",
    teamSize: 2
  },
  {
    id: "5",
    title: "Campus Event Management System",
    description: "Platform for organizing college events, managing registrations, and sending notifications",
    difficulty: "Intermediate",
    technologies: ["Vue.js", "Laravel", "PostgreSQL", "Push Notifications"],
    category: "Web Development",
    icon: <Globe className="h-5 w-5" />,
    estimatedCost: "18000",
    teamSize: 3
  },
  {
    id: "6",
    title: "Food Delivery App for Campus",
    description: "Campus-specific food ordering app with real-time tracking and payment integration",
    difficulty: "Advanced",
    technologies: ["Flutter", "Node.js", "MongoDB", "Payment Gateway"],
    category: "Mobile Development",
    icon: <Smartphone className="h-5 w-5" />,
    estimatedCost: "35000",
    teamSize: 4
  },
  {
    id: "7",
    title: "Digital Notice Board",
    description: "Smart notice board system with category-wise announcements and push notifications",
    difficulty: "Beginner",
    technologies: ["HTML", "CSS", "JavaScript", "Firebase"],
    category: "Web Development",
    icon: <Globe className="h-5 w-5" />,
    estimatedCost: "8000",
    teamSize: 2
  },
  {
    id: "8",
    title: "Student Grade Predictor",
    description: "ML model to predict student performance based on attendance, assignments, and test scores",
    difficulty: "Advanced",
    technologies: ["Python", "Scikit-learn", "Pandas", "Streamlit"],
    category: "AI/ML",
    icon: <TrendingUp className="h-5 w-5" />,
    estimatedCost: "20000",
    teamSize: 3
  },
  {
    id: "9",
    title: "Virtual Lab Simulator",
    description: "Physics/Chemistry lab simulator for conducting experiments virtually",
    difficulty: "Advanced",
    technologies: ["Unity", "C#", "3D Modeling", "WebGL"],
    category: "Game Development",
    icon: <Gamepad2 className="h-5 w-5" />,
    estimatedCost: "40000",
    teamSize: 4
  },
  {
    id: "10",
    title: "Hostel Room Allocation System",
    description: "Automated system for hostel room allocation based on preferences and availability",
    difficulty: "Intermediate",
    technologies: ["React", "Django", "SQLite", "Algorithm Design"],
    category: "Web Development",
    icon: <Code className="h-5 w-5" />,
    estimatedCost: "16000",
    teamSize: 3
  },
  {
    id: "11",
    title: "Campus Transportation Tracker",
    description: "Real-time bus tracking system for college transport with route optimization",
    difficulty: "Advanced",
    technologies: ["React Native", "GPS API", "Google Maps", "Socket.io"],
    category: "Mobile Development",
    icon: <Zap className="h-5 w-5" />,
    estimatedCost: "28000",
    teamSize: 4
  },
  {
    id: "12",
    title: "Plagiarism Detection Tool",
    description: "Tool to detect plagiarism in student assignments and research papers",
    difficulty: "Advanced",
    technologies: ["Python", "NLP", "Text Processing", "Django"],
    category: "AI/ML",
    icon: <Shield className="h-5 w-5" />,
    estimatedCost: "22000",
    teamSize: 3
  },
  {
    id: "13",
    title: "Student Feedback System",
    description: "Anonymous feedback collection system for courses and faculty evaluation",
    difficulty: "Beginner",
    technologies: ["PHP", "MySQL", "Bootstrap", "Chart.js"],
    category: "Web Development",
    icon: <Database className="h-5 w-5" />,
    estimatedCost: "10000",
    teamSize: 2
  },
  {
    id: "14",
    title: "Career Guidance Portal",
    description: "Platform providing career guidance, job recommendations, and skill assessment tests",
    difficulty: "Intermediate",
    technologies: ["React", "Express.js", "MongoDB", "Chart.js"],
    category: "Web Development",
    icon: <TrendingUp className="h-5 w-5" />,
    estimatedCost: "17000",
    teamSize: 3
  },
  {
    id: "15",
    title: "Campus Lost & Found System",
    description: "Digital platform for reporting and finding lost items within campus",
    difficulty: "Beginner",
    technologies: ["HTML", "CSS", "JavaScript", "Local Storage"],
    category: "Web Development",
    icon: <Globe className="h-5 w-5" />,
    estimatedCost: "6000",
    teamSize: 2
  },
  {
    id: "16",
    title: "Smart Parking Management System",
    description: "IoT-based parking system with real-time slot availability and automated billing",
    difficulty: "Advanced",
    technologies: ["Arduino", "Raspberry Pi", "Python", "MySQL", "React"],
    category: "IoT",
    icon: <Car className="h-5 w-5" />,
    estimatedCost: "32000",
    teamSize: 4
  },
  {
    id: "17",
    title: "Voice-Controlled Home Automation",
    description: "Smart home system controlled through voice commands with energy monitoring",
    difficulty: "Advanced",
    technologies: ["Python", "Speech Recognition", "Arduino", "Flask", "MongoDB"],
    category: "IoT",
    icon: <Wifi className="h-5 w-5" />,
    estimatedCost: "28000",
    teamSize: 3
  },
  {
    id: "18",
    title: "Health Monitoring Wearable App",
    description: "Fitness tracker app with heart rate monitoring and health analytics dashboard",
    difficulty: "Intermediate",
    technologies: ["React Native", "Firebase", "Health APIs", "Chart.js"],
    category: "Mobile Development",
    icon: <Heart className="h-5 w-5" />,
    estimatedCost: "19000",
    teamSize: 3
  },
  {
    id: "19",
    title: "Music Recommendation Engine",
    description: "AI-powered music recommendation system based on user preferences and mood analysis",
    difficulty: "Advanced",
    technologies: ["Python", "Machine Learning", "Spotify API", "Django", "React"],
    category: "AI/ML",
    icon: <Music className="h-5 w-5" />,
    estimatedCost: "24000",
    teamSize: 3
  },
  {
    id: "20",
    title: "Augmented Reality Shopping App",
    description: "AR mobile app for virtual try-on of clothes and accessories before purchase",
    difficulty: "Advanced",
    technologies: ["Unity", "ARCore", "C#", "Firebase", "3D Modeling"],
    category: "AR/VR",
    icon: <Camera className="h-5 w-5" />,
    estimatedCost: "45000",
    teamSize: 4
  },
  {
    id: "21",
    title: "Automated Time Table Generator",
    description: "AI system to generate optimal class schedules avoiding conflicts and maximizing resource utilization",
    difficulty: "Advanced",
    technologies: ["Python", "Genetic Algorithm", "Django", "MySQL", "React"],
    category: "AI/ML",
    icon: <Clock className="h-5 w-5" />,
    estimatedCost: "21000",
    teamSize: 3
  },
  {
    id: "22",
    title: "Indoor Navigation System",
    description: "Mobile app for indoor navigation in large buildings using beacons and AR markers",
    difficulty: "Advanced",
    technologies: ["React Native", "Bluetooth Beacons", "ARKit", "Node.js"],
    category: "Mobile Development",
    icon: <MapPin className="h-5 w-5" />,
    estimatedCost: "38000",
    teamSize: 4
  },
  {
    id: "23",
    title: "Expense Tracker with AI Insights",
    description: "Personal finance app with AI-powered spending analysis and budget recommendations",
    difficulty: "Intermediate",
    technologies: ["Flutter", "Firebase", "Machine Learning", "Chart.js"],
    category: "Mobile Development",
    icon: <DollarSign className="h-5 w-5" />,
    estimatedCost: "16000",
    teamSize: 3
  },
  {
    id: "24",
    title: "Digital Resume Builder with ATS Optimization",
    description: "Resume creation platform with ATS score checking and industry-specific templates",
    difficulty: "Intermediate",
    technologies: ["React", "Node.js", "PDF Generation", "NLP", "MongoDB"],
    category: "Web Development",
    icon: <FileText className="h-5 w-5" />,
    estimatedCost: "14000",
    teamSize: 2
  },
  {
    id: "25",
    title: "Virtual Classroom with Whiteboard",
    description: "Online learning platform with interactive whiteboard and real-time collaboration tools",
    difficulty: "Advanced",
    technologies: ["React", "WebRTC", "Socket.io", "Canvas API", "Node.js"],
    category: "Web Development",
    icon: <BookOpen className="h-5 w-5" />,
    estimatedCost: "33000",
    teamSize: 4
  },
  {
    id: "26",
    title: "Social Media Analytics Dashboard",
    description: "Platform to analyze social media performance across multiple platforms with sentiment analysis",
    difficulty: "Advanced",
    technologies: ["Python", "Social Media APIs", "NLP", "React", "PostgreSQL"],
    category: "AI/ML",
    icon: <TrendingUp className="h-5 w-5" />,
    estimatedCost: "27000",
    teamSize: 3
  },
  {
    id: "27",
    title: "Smart Agriculture Monitoring System",
    description: "IoT-based crop monitoring with soil sensors, weather prediction, and automated irrigation",
    difficulty: "Advanced",
    technologies: ["Arduino", "Sensors", "Python", "React", "Weather API"],
    category: "IoT",
    icon: <Monitor className="h-5 w-5" />,
    estimatedCost: "35000",
    teamSize: 4
  },
  {
    id: "28",
    title: "Code Collaboration Platform",
    description: "Real-time code sharing and collaboration tool with syntax highlighting and version control",
    difficulty: "Advanced",
    technologies: ["React", "Socket.io", "Monaco Editor", "Git API", "Node.js"],
    category: "Web Development",
    icon: <Code className="h-5 w-5" />,
    estimatedCost: "29000",
    teamSize: 3
  },
  {
    id: "29",
    title: "Cryptocurrency Portfolio Tracker",
    description: "Real-time crypto portfolio management with price alerts and trading analytics",
    difficulty: "Intermediate",
    technologies: ["React", "Crypto APIs", "Chart.js", "Firebase", "WebSocket"],
    category: "Web Development",
    icon: <DollarSign className="h-5 w-5" />,
    estimatedCost: "18000",
    teamSize: 3
  },
  {
    id: "30",
    title: "AI-Powered Document Scanner",
    description: "Mobile app to scan, digitize, and organize documents with OCR and cloud storage",
    difficulty: "Advanced",
    technologies: ["React Native", "OCR API", "Machine Learning", "Cloud Storage"],
    category: "Mobile Development",
    icon: <FileText className="h-5 w-5" />,
    estimatedCost: "23000",
    teamSize: 3
  },
  {
    id: "31",
    title: "Video Streaming Platform",
    description: "Custom video streaming service with live chat, subscriptions, and content management",
    difficulty: "Advanced",
    technologies: ["React", "Node.js", "WebRTC", "MongoDB", "Video APIs"],
    category: "Web Development",
    icon: <Video className="h-5 w-5" />,
    estimatedCost: "42000",
    teamSize: 4
  },
  {
    id: "32",
    title: "Network Security Scanner",
    description: "Tool to scan networks for vulnerabilities and generate security reports",
    difficulty: "Advanced",
    technologies: ["Python", "Nmap", "Security Libraries", "Django", "PostgreSQL"],
    category: "Cybersecurity",
    icon: <Shield className="h-5 w-5" />,
    estimatedCost: "26000",
    teamSize: 3
  },
  {
    id: "33",
    title: "Smart Traffic Management System",
    description: "AI-based traffic light control system with congestion prediction and optimization",
    difficulty: "Advanced",
    technologies: ["Python", "Computer Vision", "Arduino", "Machine Learning", "React"],
    category: "AI/ML",
    icon: <Car className="h-5 w-5" />,
    estimatedCost: "40000",
    teamSize: 4
  },
  {
    id: "34",
    title: "Language Learning Chatbot",
    description: "AI chatbot for interactive language learning with speech recognition and pronunciation feedback",
    difficulty: "Advanced",
    technologies: ["Python", "NLP", "Speech API", "Machine Learning", "React"],
    category: "AI/ML",
    icon: <Brain className="h-5 w-5" />,
    estimatedCost: "31000",
    teamSize: 4
  },
  {
    id: "35",
    title: "Blockchain Voting System",
    description: "Secure digital voting platform using blockchain technology for transparency",
    difficulty: "Advanced",
    technologies: ["Solidity", "Web3.js", "React", "Ethereum", "Node.js"],
    category: "Blockchain",
    icon: <Lock className="h-5 w-5" />,
    estimatedCost: "38000",
    teamSize: 4
  },
  {
    id: "36",
    title: "Personal AI Assistant",
    description: "Desktop AI assistant for task management, email sorting, and calendar scheduling",
    difficulty: "Advanced",
    technologies: ["Python", "NLP", "Electron", "Machine Learning", "APIs"],
    category: "AI/ML",
    icon: <Brain className="h-5 w-5" />,
    estimatedCost: "34000",
    teamSize: 4
  },
  {
    id: "37",
    title: "Smart Energy Management System",
    description: "IoT system to monitor and optimize energy consumption in buildings",
    difficulty: "Advanced",
    technologies: ["Arduino", "Sensors", "Python", "React", "Time Series DB"],
    category: "IoT",
    icon: <Zap className="h-5 w-5" />,
    estimatedCost: "36000",
    teamSize: 4
  },
  {
    id: "38",
    title: "Online Code Judge Platform",
    description: "Programming contest platform with automated code evaluation and leaderboards",
    difficulty: "Advanced",
    technologies: ["React", "Docker", "Node.js", "Judge Engine", "MongoDB"],
    category: "Web Development",
    icon: <Code className="h-5 w-5" />,
    estimatedCost: "30000",
    teamSize: 4
  },
  {
    id: "39",
    title: "Medical Diagnosis Assistant",
    description: "AI system to assist doctors in medical diagnosis using symptom analysis",
    difficulty: "Advanced",
    technologies: ["Python", "Machine Learning", "Medical APIs", "Django", "React"],
    category: "AI/ML",
    icon: <Heart className="h-5 w-5" />,
    estimatedCost: "45000",
    teamSize: 4
  },
  {
    id: "40",
    title: "Smart Inventory Management",
    description: "Automated inventory tracking system with barcode scanning and predictive restocking",
    difficulty: "Intermediate",
    technologies: ["React", "Barcode Scanner", "Python", "MySQL", "Analytics"],
    category: "Web Development",
    icon: <Database className="h-5 w-5" />,
    estimatedCost: "22000",
    teamSize: 3
  },
  {
    id: "41",
    title: "Gesture Recognition System",
    description: "Computer vision system to recognize hand gestures for device control",
    difficulty: "Advanced",
    technologies: ["Python", "OpenCV", "Machine Learning", "Mediapipe", "Flask"],
    category: "AI/ML",
    icon: <Camera className="h-5 w-5" />,
    estimatedCost: "28000",
    teamSize: 3
  },
  {
    id: "42",
    title: "Cloud Storage Manager",
    description: "Unified interface to manage files across multiple cloud storage services",
    difficulty: "Intermediate",
    technologies: ["React", "Cloud APIs", "Node.js", "File Management", "MongoDB"],
    category: "Web Development",
    icon: <Cloud className="h-5 w-5" />,
    estimatedCost: "20000",
    teamSize: 3
  },
  {
    id: "43",
    title: "Smart Quiz Generator",
    description: "AI-powered quiz generation from text content with difficulty adjustment",
    difficulty: "Advanced",
    technologies: ["Python", "NLP", "Machine Learning", "React", "PostgreSQL"],
    category: "AI/ML",
    icon: <BookOpen className="h-5 w-5" />,
    estimatedCost: "25000",
    teamSize: 3
  },
  {
    id: "44",
    title: "Real Estate Price Predictor",
    description: "ML model to predict property prices based on location, amenities, and market trends",
    difficulty: "Advanced",
    technologies: ["Python", "Machine Learning", "Real Estate APIs", "React", "PostgreSQL"],
    category: "AI/ML",
    icon: <TrendingUp className="h-5 w-5" />,
    estimatedCost: "27000",
    teamSize: 3
  },
  {
    id: "45",
    title: "Digital Marketplace Platform",
    description: "E-commerce platform for digital products with seller dashboard and payment integration",
    difficulty: "Advanced",
    technologies: ["React", "Node.js", "Payment Gateway", "MongoDB", "File Storage"],
    category: "Web Development",
    icon: <DollarSign className="h-5 w-5" />,
    estimatedCost: "39000",
    teamSize: 4
  }
];

const ProjectIdeas = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
  const [submittedProjects, setSubmittedProjects] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const categories = ['All', 'Web Development', 'Mobile Development', 'AI/ML', 'Game Development', 'IoT', 'AR/VR', 'Blockchain', 'Cybersecurity'];
  const difficulties = ['All', 'Beginner', 'Intermediate', 'Advanced'];

  // Load submitted projects on component mount
  useState(() => {
    loadSubmittedProjects();
  });

  const loadSubmittedProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('submissions')
        .select('project_title');

      if (error) throw error;

      const titles = data?.map(sub => sub.project_title) || [];
      setSubmittedProjects(titles);
    } catch (error) {
      console.error('Error loading submitted projects:', error);
    }
  };

  const filteredProjects = csProjectIdeas.filter(project => {
    const categoryMatch = selectedCategory === 'All' || project.category === selectedCategory;
    const difficultyMatch = selectedDifficulty === 'All' || project.difficulty === selectedDifficulty;
    const notSubmitted = !submittedProjects.includes(project.title);
    return categoryMatch && difficultyMatch && notSubmitted;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner':
        return 'bg-green-100 text-green-800';
      case 'Intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'Advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleSelectIdea = async (project: ProjectIdea) => {
    if (!user || !user.rollNumber) {
      toast({
        title: "Error",
        description: "Please login to select a project idea",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Get user profile for name
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('name')
        .eq('roll_number', user.rollNumber)
        .single();

      if (profileError) throw profileError;

      // Auto-submit the project idea
      const { error: submitError } = await supabase
        .from('submissions')
        .insert({
          roll_number: user.rollNumber,
          student_name: profile?.name || 'Student',
          project_title: project.title,
          project_description: project.description,
          technologies: project.technologies.join(', '),
          estimated_cost: project.estimatedCost,
          team_members: `Team Leader: ${profile?.name || 'Student'}`,
          team_members_count: project.teamSize,
          software_requirements: project.technologies.join(', '),
          hardware_requirements: project.category === 'IoT' ? 'Arduino, Sensors, Raspberry Pi' : 'Standard PC/Laptop',
          status: 'pending'
        });

      if (submitError) throw submitError;

      toast({
        title: "Project Submitted! 🎉",
        description: `Your project "${project.title}" has been submitted successfully.`,
      });

      // Refresh submitted projects list
      loadSubmittedProjects();

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit project",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex items-center p-4 border-b bg-white">
        <Lightbulb className="h-6 w-6 text-yellow-500 mr-3" />
        <h1 className="text-xl font-semibold text-gray-900">Project Ideas</h1>
      </div>

      <div className="p-4">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Computer Science Projects</h2>
          <p className="text-gray-600 text-sm mb-4">
            Explore innovative project ideas that haven't been implemented yet. Perfect for your final year projects!
          </p>
          
          <div className="flex flex-wrap gap-2 mb-4">
            <div className="flex flex-wrap gap-1">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className="text-xs"
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-1 mb-4">
            {difficulties.map((difficulty) => (
              <Button
                key={difficulty}
                variant={selectedDifficulty === difficulty ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedDifficulty(difficulty)}
                className="text-xs"
              >
                {difficulty}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {filteredProjects.map((project) => (
            <Card key={project.id} className="rounded-xl border-gray-200">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    {project.icon}
                    <CardTitle className="text-lg">{project.title}</CardTitle>
                  </div>
                  <Badge className={getDifficultyColor(project.difficulty)}>
                    {project.difficulty}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-3 text-sm">
                  {project.description}
                </p>
                
                <div className="mb-3">
                  <p className="text-sm font-medium text-gray-700 mb-1">Technologies:</p>
                  <div className="flex flex-wrap gap-1">
                    {project.technologies.map((tech, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between items-center mb-3">
                  <div className="flex space-x-4 text-sm text-gray-600">
                    <span>Cost: ₹{project.estimatedCost}</span>
                    <span>Team: {project.teamSize} members</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <Badge variant="secondary" className="text-xs">
                    {project.category}
                  </Badge>
                  <Button 
                    size="sm" 
                    className="bg-blue-500 hover:bg-blue-600 text-white"
                    onClick={() => handleSelectIdea(project)}
                    disabled={isLoading}
                  >
                    {isLoading ? "Submitting..." : "Select & Submit"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredProjects.length === 0 && (
          <div className="text-center py-12">
            <Lightbulb className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">
              {submittedProjects.length > 0 
                ? "All available projects for the selected filters have been submitted" 
                : "No projects found for the selected filters"
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectIdeas;
