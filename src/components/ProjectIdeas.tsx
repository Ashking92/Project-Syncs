
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Lightbulb, Code, Database, Globe, Smartphone, Brain, Shield, GameController2, TrendingUp, Zap } from "lucide-react";

interface ProjectIdea {
  id: string;
  title: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  technologies: string[];
  category: string;
  icon: React.ReactNode;
}

const csProjectIdeas: ProjectIdea[] = [
  {
    id: "1",
    title: "Smart Library Management System",
    description: "Digital library system with book tracking, user management, and automated fine calculation",
    difficulty: "Intermediate",
    technologies: ["React", "Node.js", "MongoDB", "Express"],
    category: "Web Development",
    icon: <Database className="h-5 w-5" />
  },
  {
    id: "2",
    title: "AI-Powered Chatbot for College",
    description: "Intelligent chatbot to answer student queries about admissions, courses, and campus facilities",
    difficulty: "Advanced",
    technologies: ["Python", "NLP", "TensorFlow", "Flask"],
    category: "AI/ML",
    icon: <Brain className="h-5 w-5" />
  },
  {
    id: "3",
    title: "Online Examination Portal",
    description: "Secure online exam platform with auto-grading, proctoring features, and result analytics",
    difficulty: "Advanced",
    technologies: ["Angular", "Spring Boot", "MySQL", "WebRTC"],
    category: "Web Development",
    icon: <Shield className="h-5 w-5" />
  },
  {
    id: "4",
    title: "Student Attendance Tracker",
    description: "Mobile app for tracking student attendance using QR codes and geolocation",
    difficulty: "Intermediate",
    technologies: ["React Native", "Firebase", "QR Scanner"],
    category: "Mobile Development",
    icon: <Smartphone className="h-5 w-5" />
  },
  {
    id: "5",
    title: "Campus Event Management System",
    description: "Platform for organizing college events, managing registrations, and sending notifications",
    difficulty: "Intermediate",
    technologies: ["Vue.js", "Laravel", "PostgreSQL", "Push Notifications"],
    category: "Web Development",
    icon: <Globe className="h-5 w-5" />
  },
  {
    id: "6",
    title: "Food Delivery App for Campus",
    description: "Campus-specific food ordering app with real-time tracking and payment integration",
    difficulty: "Advanced",
    technologies: ["Flutter", "Node.js", "MongoDB", "Payment Gateway"],
    category: "Mobile Development",
    icon: <Smartphone className="h-5 w-5" />
  },
  {
    id: "7",
    title: "Digital Notice Board",
    description: "Smart notice board system with category-wise announcements and push notifications",
    difficulty: "Beginner",
    technologies: ["HTML", "CSS", "JavaScript", "Firebase"],
    category: "Web Development",
    icon: <Globe className="h-5 w-5" />
  },
  {
    id: "8",
    title: "Student Grade Predictor",
    description: "ML model to predict student performance based on attendance, assignments, and test scores",
    difficulty: "Advanced",
    technologies: ["Python", "Scikit-learn", "Pandas", "Streamlit"],
    category: "AI/ML",
    icon: <TrendingUp className="h-5 w-5" />
  },
  {
    id: "9",
    title: "Virtual Lab Simulator",
    description: "Physics/Chemistry lab simulator for conducting experiments virtually",
    difficulty: "Advanced",
    technologies: ["Unity", "C#", "3D Modeling", "WebGL"],
    category: "Game Development",
    icon: <GameController2 className="h-5 w-5" />
  },
  {
    id: "10",
    title: "Hostel Room Allocation System",
    description: "Automated system for hostel room allocation based on preferences and availability",
    difficulty: "Intermediate",
    technologies: ["React", "Django", "SQLite", "Algorithm Design"],
    category: "Web Development",
    icon: <Code className="h-5 w-5" />
  },
  {
    id: "11",
    title: "Campus Transportation Tracker",
    description: "Real-time bus tracking system for college transport with route optimization",
    difficulty: "Advanced",
    technologies: ["React Native", "GPS API", "Google Maps", "Socket.io"],
    category: "Mobile Development",
    icon: <Zap className="h-5 w-5" />
  },
  {
    id: "12",
    title: "Plagiarism Detection Tool",
    description: "Tool to detect plagiarism in student assignments and research papers",
    difficulty: "Advanced",
    technologies: ["Python", "NLP", "Text Processing", "Django"],
    category: "AI/ML",
    icon: <Shield className="h-5 w-5" />
  },
  {
    id: "13",
    title: "Student Feedback System",
    description: "Anonymous feedback collection system for courses and faculty evaluation",
    difficulty: "Beginner",
    technologies: ["PHP", "MySQL", "Bootstrap", "Chart.js"],
    category: "Web Development",
    icon: <Database className="h-5 w-5" />
  },
  {
    id: "14",
    title: "Career Guidance Portal",
    description: "Platform providing career guidance, job recommendations, and skill assessment tests",
    difficulty: "Intermediate",
    technologies: ["React", "Express.js", "MongoDB", "Chart.js"],
    category: "Web Development",
    icon: <TrendingUp className="h-5 w-5" />
  },
  {
    id: "15",
    title: "Campus Lost & Found System",
    description: "Digital platform for reporting and finding lost items within campus",
    difficulty: "Beginner",
    technologies: ["HTML", "CSS", "JavaScript", "Local Storage"],
    category: "Web Development",
    icon: <Globe className="h-5 w-5" />
  }
];

const ProjectIdeas = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');

  const categories = ['All', 'Web Development', 'Mobile Development', 'AI/ML', 'Game Development'];
  const difficulties = ['All', 'Beginner', 'Intermediate', 'Advanced'];

  const filteredProjects = csProjectIdeas.filter(project => {
    const categoryMatch = selectedCategory === 'All' || project.category === selectedCategory;
    const difficultyMatch = selectedDifficulty === 'All' || project.difficulty === selectedDifficulty;
    return categoryMatch && difficultyMatch;
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
                
                <div className="flex justify-between items-center">
                  <Badge variant="secondary" className="text-xs">
                    {project.category}
                  </Badge>
                  <Button 
                    size="sm" 
                    className="bg-blue-500 hover:bg-blue-600 text-white"
                    onClick={() => {
                      // This would navigate to submit page with pre-filled project title
                      window.location.href = `/submit?title=${encodeURIComponent(project.title)}`;
                    }}
                  >
                    Select This Idea
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredProjects.length === 0 && (
          <div className="text-center py-12">
            <Lightbulb className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No projects found for the selected filters</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectIdeas;
