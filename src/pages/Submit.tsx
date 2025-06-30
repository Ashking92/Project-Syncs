
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Submit = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    projectTitle: "",
    projectDescription: "",
    teamMembersCount: "",
    teamMembers: "",
    softwareRequirements: "",
    hardwareRequirements: "",
    estimatedCost: "",
    technologies: ""
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const userData = localStorage.getItem('proposync-user');
    if (!userData) {
      navigate('/auth');
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (parsedUser.type !== 'student') {
      navigate('/auth');
      return;
    }

    setUser(parsedUser);
    
    // Load student profile
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('roll_number', parsedUser.rollNumber)
        .single();

      if (error) throw error;
      
      if (!data.name || !data.phone_number || !data.email) {
        toast({
          title: "Complete Your Profile",
          description: "Please complete your profile first from the student dashboard.",
          variant: "destructive",
        });
        navigate('/student-dashboard');
        return;
      }

      setProfile(data);
    } catch (error) {
      console.error('Error loading profile:', error);
      navigate('/student-dashboard');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('submissions')
        .insert({
          student_id: profile.id,
          roll_number: user.rollNumber,
          student_name: profile.name,
          project_title: formData.projectTitle,
          team_members_count: parseInt(formData.teamMembersCount) || 1,
          team_members: formData.teamMembers || profile.name,
          software_requirements: formData.softwareRequirements,
          hardware_requirements: formData.hardwareRequirements,
          estimated_cost: formData.estimatedCost,
          technologies: formData.technologies,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "Project Submitted Successfully! 🎉",
        description: "Your project proposal has been submitted for review.",
      });

      // Reset form
      setFormData({
        projectTitle: "",
        projectDescription: "",
        teamMembersCount: "",
        teamMembers: "",
        softwareRequirements: "",
        hardwareRequirements: "",
        estimatedCost: "",
        technologies: ""
      });

      // Navigate back after a delay
      setTimeout(() => navigate('/student-dashboard'), 2000);
    } catch (error: any) {
      toast({
        title: "Submission Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex items-center p-4 border-b bg-white">
        <button
          onClick={() => navigate('/student-dashboard')}
          className="mr-4"
        >
          <ArrowLeft className="h-6 w-6 text-gray-700" />
        </button>
        <h1 className="text-xl font-semibold text-gray-900">Submit Project</h1>
      </div>

      <div className="p-4">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="projectTitle" className="text-base font-medium text-gray-900 mb-2 block">
              Project Title
            </Label>
            <Input
              id="projectTitle"
              name="projectTitle"
              value={formData.projectTitle}
              onChange={handleInputChange}
              placeholder="Enter project title"
              className="h-12 text-base rounded-xl border-gray-200 bg-white"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="projectDescription" className="text-base font-medium text-gray-900 mb-2 block">
              Project Description
            </Label>
            <Textarea
              id="projectDescription"
              name="projectDescription"
              value={formData.projectDescription}
              onChange={handleInputChange}
              placeholder="Enter project description"
              className="min-h-32 text-base rounded-xl border-gray-200 bg-white resize-none"
              required
            />
          </div>

          <div>
            <Label htmlFor="technologies" className="text-base font-medium text-gray-900 mb-2 block">
              Technologies Used
            </Label>
            <Input
              id="technologies"
              name="technologies"
              value={formData.technologies}
              onChange={handleInputChange}
              placeholder="e.g., React, Node.js, MongoDB"
              className="h-12 text-base rounded-xl border-gray-200 bg-white"
              required
            />
          </div>

          <div>
            <Label htmlFor="estimatedCost" className="text-base font-medium text-gray-900 mb-2 block">
              Estimated Cost (₹)
            </Label>
            <Input
              id="estimatedCost"
              name="estimatedCost"
              type="number"
              value={formData.estimatedCost}
              onChange={handleInputChange}
              placeholder="Enter estimated cost"
              className="h-12 text-base rounded-xl border-gray-200 bg-white"
              required
            />
          </div>

          <div className="bg-white rounded-xl p-4 border-2 border-dashed border-gray-200">
            <div className="text-center">
              <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">Upload file</p>
            </div>
          </div>
          
          <Button
            type="submit"
            className="w-full h-12 bg-blue-500 hover:bg-blue-600 rounded-xl text-white font-medium text-base"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Submit;
