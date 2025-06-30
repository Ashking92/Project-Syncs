import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, CheckCircle, XCircle, MessageSquare, Search, FileText, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Submission {
  id: string;
  roll_number: string;
  student_name: string;
  project_title: string;
  team_members_count: number;
  team_members: string;
  software_requirements: string;
  hardware_requirements: string;
  estimated_cost: string;
  technologies: string;
  status: 'pending' | 'approved' | 'rejected';
  submitted_at: string;
  remarks: string;
}

const Admin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [remarkText, setRemarkText] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
    loadSubmissions();
  }, []);

  const checkAuth = () => {
    const userData = localStorage.getItem('proposync-user');
    if (!userData) {
      navigate('/auth');
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (parsedUser.type !== 'admin') {
      navigate('/auth');
      return;
    }
  };

  const loadSubmissions = async () => {
    try {
      const { data, error } = await supabase
        .from('submissions')
        .select('*')
        .order('submitted_at', { ascending: false });

      if (error) throw error;
      // Type assertion to ensure status field matches our interface
      const typedData = (data || []).map(item => ({
        ...item,
        status: item.status as 'pending' | 'approved' | 'rejected'
      }));
      setSubmissions(typedData);
    } catch (error) {
      console.error('Error loading submissions:', error);
      toast({
        title: "Error",
        description: "Failed to load submissions",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredSubmissions = submissions.filter(submission =>
    submission.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    submission.roll_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    submission.project_title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const updateSubmissionStatus = async (id: string, status: 'pending' | 'approved' | 'rejected', remarks: string = '') => {
    try {
      const { error } = await supabase
        .from('submissions')
        .update({ status, remarks })
        .eq('id', id);

      if (error) throw error;

      setSubmissions(prev => prev.map(sub =>
        sub.id === id ? { ...sub, status, remarks } : sub
      ));
      
      toast({
        title: `Project ${status}!`,
        description: `The project has been ${status} successfully.`,
      });
    } catch (error) {
      console.error('Error updating submission:', error);
      toast({
        title: "Error",
        description: "Failed to update submission status",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Rejected</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('proposync-user');
    navigate('/auth');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/" className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors">
                <ArrowLeft className="h-5 w-5" />
                <span>Back to Home</span>
              </Link>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                <h1 className="text-xl font-bold text-gray-900">PropoSync Admin</h1>
              </div>
            </div>
            <Button onClick={handleLogout} variant="outline" size="sm">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Card className="shadow-xl border-0">
          <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-t-lg">
            <CardTitle className="text-2xl">Project Submissions Dashboard</CardTitle>
            <p className="text-indigo-100">Manage and review all project proposals</p>
          </CardHeader>
          
          <CardContent className="p-6">
            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by student name, roll number, or project title..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Stats */}
            <div className="grid md:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{submissions.length}</div>
                <div className="text-sm text-gray-600">Total Submissions</div>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">
                  {submissions.filter(s => s.status === 'pending').length}
                </div>
                <div className="text-sm text-gray-600">Pending Review</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {submissions.filter(s => s.status === 'approved').length}
                </div>
                <div className="text-sm text-gray-600">Approved</div>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-red-600">
                  {submissions.filter(s => s.status === 'rejected').length}
                </div>
                <div className="text-sm text-gray-600">Rejected</div>
              </div>
            </div>

            {/* Submissions Table */}
            <div className="overflow-x-auto">
              {filteredSubmissions.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No submissions found</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="text-left p-3 font-semibold">Roll No</th>
                      <th className="text-left p-3 font-semibold">Student Name</th>
                      <th className="text-left p-3 font-semibold">Project Title</th>
                      <th className="text-left p-3 font-semibold">Team Size</th>
                      <th className="text-left p-3 font-semibold">Cost (₹)</th>
                      <th className="text-left p-3 font-semibold">Status</th>
                      <th className="text-left p-3 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSubmissions.map((submission) => (
                      <tr key={submission.id} className="border-b hover:bg-gray-50">
                        <td className="p-3 font-mono text-sm">{submission.roll_number}</td>
                        <td className="p-3">{submission.student_name}</td>
                        <td className="p-3">
                          <div className="max-w-xs truncate" title={submission.project_title}>
                            {submission.project_title}
                          </div>
                        </td>
                        <td className="p-3">{submission.team_members_count}</td>
                        <td className="p-3">₹{submission.estimated_cost}</td>
                        <td className="p-3">{getStatusBadge(submission.status)}</td>
                        <td className="p-3">
                          <div className="flex space-x-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setSelectedSubmission(submission)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle>Project Details</DialogTitle>
                                </DialogHeader>
                                {selectedSubmission && (
                                  <div className="space-y-4">
                                    <div className="grid md:grid-cols-2 gap-4">
                                      <div>
                                        <strong>Roll Number:</strong> {selectedSubmission.roll_number}
                                      </div>
                                      <div>
                                        <strong>Student Name:</strong> {selectedSubmission.student_name}
                                      </div>
                                    </div>
                                    <div>
                                      <strong>Project Title:</strong> {selectedSubmission.project_title}
                                    </div>
                                    <div>
                                      <strong>Technologies:</strong> {selectedSubmission.technologies}
                                    </div>
                                    <div>
                                      <strong>Team Members ({selectedSubmission.team_members_count}):</strong>
                                      <pre className="mt-1 text-sm bg-gray-100 p-2 rounded">
                                        {selectedSubmission.team_members}
                                      </pre>
                                    </div>
                                    <div>
                                      <strong>Software Requirements:</strong>
                                      <pre className="mt-1 text-sm bg-gray-100 p-2 rounded">
                                        {selectedSubmission.software_requirements || 'Not specified'}
                                      </pre>
                                    </div>
                                    <div>
                                      <strong>Hardware Requirements:</strong>
                                      <pre className="mt-1 text-sm bg-gray-100 p-2 rounded">
                                        {selectedSubmission.hardware_requirements || 'Not specified'}
                                      </pre>
                                    </div>
                                    <div>
                                      <strong>Estimated Cost:</strong> ₹{selectedSubmission.estimated_cost}
                                    </div>
                                    {selectedSubmission.remarks && (
                                      <div>
                                        <strong>Remarks:</strong>
                                        <p className="mt-1 text-sm bg-yellow-50 p-2 rounded">
                                          {selectedSubmission.remarks}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>

                            <Button
                              variant="outline"
                              size="sm"
                              className="text-green-600 hover:bg-green-50"
                              onClick={() => updateSubmissionStatus(submission.id, 'approved')}
                              disabled={submission.status === 'approved'}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>

                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:bg-red-50"
                              onClick={() => updateSubmissionStatus(submission.id, 'rejected')}
                              disabled={submission.status === 'rejected'}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>

                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedSubmission(submission);
                                    setRemarkText(submission.remarks);
                                  }}
                                >
                                  <MessageSquare className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Add Remark</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <Textarea
                                    placeholder="Enter your remark..."
                                    value={remarkText}
                                    onChange={(e) => setRemarkText(e.target.value)}
                                    rows={4}
                                  />
                                  <Button
                                    onClick={() => {
                                      if (selectedSubmission) {
                                        updateSubmissionStatus(selectedSubmission.id, selectedSubmission.status, remarkText);
                                        setRemarkText("");
                                      }
                                    }}
                                    className="w-full"
                                  >
                                    Save Remark
                                  </Button>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Admin;
