
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, FileText, Users, DollarSign, Code, Cpu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const Submit = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    rollNumber: "",
    studentName: "",
    projectTitle: "",
    teamMembersCount: "",
    teamMembers: "",
    softwareRequirements: "",
    hardwareRequirements: "",
    estimatedCost: "",
    technologies: ""
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Store in localStorage (simulating backend)
    const existingSubmissions = JSON.parse(localStorage.getItem('proposync-submissions') || '[]');
    const newSubmission = {
      id: Date.now().toString(),
      ...formData,
      status: 'pending',
      submittedAt: new Date().toISOString(),
      remarks: ''
    };
    
    existingSubmissions.push(newSubmission);
    localStorage.setItem('proposync-submissions', JSON.stringify(existingSubmissions));

    setIsSubmitting(false);
    
    toast({
      title: "Project Submitted Successfully! 🎉",
      description: "Your project proposal has been submitted for review.",
    });

    // Reset form
    setFormData({
      rollNumber: "",
      studentName: "",
      projectTitle: "",
      teamMembersCount: "",
      teamMembers: "",
      softwareRequirements: "",
      hardwareRequirements: "",
      estimatedCost: "",
      technologies: ""
    });

    // Navigate back after a delay
    setTimeout(() => navigate('/'), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Link to="/" className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors">
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Home</span>
            </Link>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">PropoSync</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-4xl mx-auto shadow-xl border-0">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
            <CardTitle className="text-2xl flex items-center space-x-2">
              <FileText className="h-6 w-6" />
              <span>Submit Project Proposal</span>
            </CardTitle>
            <p className="text-blue-100">Fill in all the required details for your project</p>
          </CardHeader>
          
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  <span>Basic Information</span>
                </h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="rollNumber">Roll Number *</Label>
                    <Input
                      id="rollNumber"
                      name="rollNumber"
                      value={formData.rollNumber}
                      onChange={handleInputChange}
                      placeholder="e.g., 2021CS001"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="studentName">Student Name (Leader) *</Label>
                    <Input
                      id="studentName"
                      name="studentName"
                      value={formData.studentName}
                      onChange={handleInputChange}
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="projectTitle">Project Title *</Label>
                  <Input
                    id="projectTitle"
                    name="projectTitle"
                    value={formData.projectTitle}
                    onChange={handleInputChange}
                    placeholder="Enter your project title"
                    required
                  />
                </div>
              </div>

              {/* Team Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                  <Users className="h-5 w-5 text-green-600" />
                  <span>Team Details</span>
                </h3>
                
                <div>
                  <Label htmlFor="teamMembersCount">Number of Team Members *</Label>
                  <Input
                    id="teamMembersCount"
                    name="teamMembersCount"
                    type="number"
                    min="1"
                    max="10"
                    value={formData.teamMembersCount}
                    onChange={handleInputChange}
                    placeholder="e.g., 4"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="teamMembers">Team Members' Names *</Label>
                  <Textarea
                    id="teamMembers"
                    name="teamMembers"
                    value={formData.teamMembers}
                    onChange={handleInputChange}
                    placeholder="Enter all team member names (one per line)"
                    rows={4}
                    required
                  />
                </div>
              </div>

              {/* Technical Requirements */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                  <Code className="h-5 w-5 text-purple-600" />
                  <span>Technical Requirements</span>
                </h3>
                
                <div>
                  <Label htmlFor="technologies">Technologies Used *</Label>
                  <Input
                    id="technologies"
                    name="technologies"
                    value={formData.technologies}
                    onChange={handleInputChange}
                    placeholder="e.g., React, Node.js, MongoDB, Python"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="softwareRequirements">Software Requirements</Label>
                  <Textarea
                    id="softwareRequirements"
                    name="softwareRequirements"
                    value={formData.softwareRequirements}
                    onChange={handleInputChange}
                    placeholder="List all software requirements"
                    rows={3}
                  />
                </div>
                
                <div>
                  <Label htmlFor="hardwareRequirements">Hardware Requirements</Label>
                  <Textarea
                    id="hardwareRequirements"
                    name="hardwareRequirements"
                    value={formData.hardwareRequirements}
                    onChange={handleInputChange}
                    placeholder="List all hardware requirements"
                    rows={3}
                  />
                </div>
              </div>

              {/* Cost Estimation */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                  <DollarSign className="h-5 w-5 text-orange-600" />
                  <span>Cost Estimation</span>
                </h3>
                
                <div>
                  <Label htmlFor="estimatedCost">Estimated Cost (₹) *</Label>
                  <Input
                    id="estimatedCost"
                    name="estimatedCost"
                    type="number"
                    min="0"
                    value={formData.estimatedCost}
                    onChange={handleInputChange}
                    placeholder="e.g., 5000"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full py-3 text-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit Project Proposal"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Submit;
