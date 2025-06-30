
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus, Eye, CheckCircle, XCircle, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Submission {
  id: string;
  roll_number: string;
  student_name: string;
  project_title: string;
  project_description?: string;
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
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    checkAuth();
    loadSubmissions();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('submissions-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'submissions'
      }, () => {
        loadSubmissions();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
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

  const filteredSubmissions = submissions.filter(submission => {
    const matchesSearch = submission.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.roll_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.project_title.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filter === 'All' || submission.status.toLowerCase() === filter.toLowerCase();
    
    return matchesSearch && matchesFilter;
  });

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
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('proposync-user');
    navigate('/auth');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-white">
        <h1 className="text-xl font-semibold text-gray-900">Submissions ({submissions.length})</h1>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-600">
            Real-time Updates Active
          </div>
          <button onClick={handleLogout}>
            <LogOut className="h-6 w-6 text-gray-700" />
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="p-4">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <Input
            placeholder="Search submissions"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-12 rounded-xl border-gray-200 bg-gray-100"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-2 mb-6">
          {['All', 'Pending', 'Approved', 'Rejected'].map((filterOption) => (
            <button
              key={filterOption}
              onClick={() => setFilter(filterOption)}
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                filter === filterOption
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              {filterOption} ({filterOption === 'All' ? submissions.length : submissions.filter(s => s.status.toLowerCase() === filterOption.toLowerCase()).length})
            </button>
          ))}
        </div>

        {/* Submissions List */}
        <div className="space-y-4">
          {filteredSubmissions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No submissions found</p>
            </div>
          ) : (
            filteredSubmissions.map((submission) => (
              <div key={submission.id} className="bg-white rounded-xl p-4 border border-gray-200">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {submission.project_title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-1">
                      {submission.student_name} ({submission.roll_number})
                    </p>
                    <p className="text-gray-500 text-xs">
                      Team: {submission.team_members_count} members | Cost: ₹{submission.estimated_cost}
                    </p>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedSubmission(submission)}
                        className="rounded-full"
                      >
                        Review
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
                            <div>
                              <strong>Team Members:</strong> {selectedSubmission.team_members_count}
                            </div>
                            <div>
                              <strong>Estimated Cost:</strong> ₹{selectedSubmission.estimated_cost}
                            </div>
                          </div>
                          
                          <div>
                            <strong>Project Title:</strong> {selectedSubmission.project_title}
                          </div>
                          
                          {selectedSubmission.project_description && (
                            <div>
                              <strong>Description:</strong>
                              <p className="mt-1 text-gray-700">{selectedSubmission.project_description}</p>
                            </div>
                          )}
                          
                          <div>
                            <strong>Technologies:</strong> {selectedSubmission.technologies}
                          </div>
                          
                          <div>
                            <strong>Team Members:</strong>
                            <p className="mt-1 text-gray-700">{selectedSubmission.team_members}</p>
                          </div>
                          
                          {selectedSubmission.software_requirements && (
                            <div>
                              <strong>Software Requirements:</strong>
                              <p className="mt-1 text-gray-700">{selectedSubmission.software_requirements}</p>
                            </div>
                          )}
                          
                          {selectedSubmission.hardware_requirements && (
                            <div>
                              <strong>Hardware Requirements:</strong>
                              <p className="mt-1 text-gray-700">{selectedSubmission.hardware_requirements}</p>
                            </div>
                          )}
                          
                          <div>
                            <strong>Submitted:</strong> {new Date(selectedSubmission.submitted_at).toLocaleString()}
                          </div>
                          
                          <div className="flex space-x-2 pt-4">
                            <Button
                              onClick={() => updateSubmissionStatus(selectedSubmission.id, 'approved')}
                              className="bg-green-500 hover:bg-green-600 text-white"
                              disabled={selectedSubmission.status === 'approved'}
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Approve
                            </Button>
                            <Button
                              onClick={() => updateSubmissionStatus(selectedSubmission.id, 'rejected')}
                              className="bg-red-500 hover:bg-red-600 text-white"
                              disabled={selectedSubmission.status === 'rejected'}
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Reject
                            </Button>
                          </div>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                </div>
                <div className="flex justify-between items-center">
                  {getStatusBadge(submission.status)}
                  <span className="text-xs text-gray-500">
                    {new Date(submission.submitted_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Admin;
