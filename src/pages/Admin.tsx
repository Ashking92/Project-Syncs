import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus, Eye, CheckCircle, XCircle, LogOut, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";

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

interface Student {
  id: string;
  roll_number: string;
  name: string;
  email: string;
  phone_number: string;
  created_at: string;
}

const Admin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [studentCount, setStudentCount] = useState(0);
  const [csStudents, setCsStudents] = useState(0);
  const [itStudents, setItStudents] = useState(0);
  const [students, setStudents] = useState<Student[]>([]);
  const [activeTab, setActiveTab] = useState('submissions');
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeMessage, setNoticeMessage] = useState('');
  const [targetType, setTargetType] = useState<'all' | 'individual'>('all');
  const [targetRollNumber, setTargetRollNumber] = useState('');

  useEffect(() => {
    console.log('Admin component mounted, starting initialization...');
    checkAuth();
    loadSubmissions();
    loadStudentCounts();
    loadStudents();
    
    // Set up real-time subscription for submissions
    const submissionsChannel = supabase
      .channel('submissions-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'submissions'
      }, (payload) => {
        console.log('Real-time submission change:', payload);
        loadSubmissions();
      })
      .subscribe();

    // Set up real-time subscription for student registrations
    const profilesChannel = supabase
      .channel('profiles-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'profiles'
      }, (payload) => {
        console.log('Real-time profile change:', payload);
        loadStudentCounts();
      })
      .subscribe();

    return () => {
      console.log('Cleaning up real-time subscriptions...');
      supabase.removeChannel(submissionsChannel);
      supabase.removeChannel(profilesChannel);
    };
  }, []);

  const checkAuth = () => {
    console.log('Checking admin authentication...');
    try {
      const userData = localStorage.getItem('proposync-user');
      console.log('User data from localStorage:', userData);
      
      if (!userData) {
        console.log('No user data found, redirecting to admin auth');
        navigate('/auth?type=admin');
        return;
      }

      const parsedUser = JSON.parse(userData);
      console.log('Parsed user data:', parsedUser);
      
      if (parsedUser.type !== 'admin' || !parsedUser.adminCode) {
        console.log('Invalid admin credentials, clearing and redirecting');
        localStorage.removeItem('proposync-user');
        navigate('/auth?type=admin');
        return;
      }
      
      console.log('Admin authentication successful');
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('proposync-user');
      navigate('/auth?type=admin');
    }
  };

  const loadStudentCounts = async () => {
    console.log('Loading student counts...');
    try {
      // Get total student count
      const { count: totalCount, error: totalError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      if (totalError) {
        console.error('Error loading total student count:', totalError);
        throw totalError;
      }
      
      console.log('Total students:', totalCount);
      setStudentCount(totalCount || 0);

      // Get CS students count (D234101-D234160)
      const { count: csCount, error: csError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('roll_number', 'D234101')
        .lte('roll_number', 'D234160');

      if (csError) {
        console.error('Error loading CS student count:', csError);
        throw csError;
      }
      
      console.log('CS students:', csCount);
      setCsStudents(csCount || 0);

      // Get IT students count (D235101-D235130)
      const { count: itCount, error: itError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('roll_number', 'D235101')
        .lte('roll_number', 'D235130');

      if (itError) {
        console.error('Error loading IT student count:', itError);
        throw itError;
      }
      
      console.log('IT students:', itCount);
      setItStudents(itCount || 0);

    } catch (error) {
      console.error('Error loading student counts:', error);
      toast({
        title: "Error",
        description: "Failed to load student statistics",
        variant: "destructive",
      });
    }
  };

  const loadSubmissions = async () => {
    console.log('Loading submissions...');
    setIsLoading(true);
    
    try {
      // Test Supabase connection first
      const { data: testData, error: testError } = await supabase
        .from('submissions')
        .select('count')
        .limit(1);
        
      if (testError) {
        console.error('Supabase connection test failed:', testError);
        throw new Error(`Database connection failed: ${testError.message}`);
      }
      
      console.log('Supabase connection test successful');

      // Load all submissions
      const { data, error } = await supabase
        .from('submissions')
        .select('*')
        .order('submitted_at', { ascending: false });

      if (error) {
        console.error('Error loading submissions:', error);
        throw new Error(`Failed to load submissions: ${error.message}`);
      }

      console.log('Raw submissions data:', data);
      
      if (!data) {
        console.log('No submissions data returned');
        setSubmissions([]);
        return;
      }

      // Type assertion to ensure status field matches our interface
      const typedData = data.map(item => {
        console.log('Processing submission:', item.id, 'Status:', item.status);
        return {
          ...item,
          status: item.status as 'pending' | 'approved' | 'rejected'
        };
      });
      
      console.log('Processed submissions:', typedData.length, 'items');
      setSubmissions(typedData);
      
      toast({
        title: "Success",
        description: `Loaded ${typedData.length} submissions successfully`,
      });
      
    } catch (error) {
      console.error('Detailed error loading submissions:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load submissions",
        variant: "destructive",
      });
      
      // Set empty array to prevent UI errors
      setSubmissions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadStudents = async () => {
    console.log('Loading students...');
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading students:', error);
        throw error;
      }
      
      console.log('Students loaded:', data?.length || 0);
      setStudents(data || []);
    } catch (error) {
      console.error('Error loading students:', error);
      toast({
        title: "Error",
        description: "Failed to load student data",
        variant: "destructive",
      });
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
    console.log('Updating submission status:', id, 'to', status);
    try {
      const { error } = await supabase
        .from('submissions')
        .update({ status, remarks })
        .eq('id', id);

      if (error) {
        console.error('Error updating submission status:', error);
        throw error;
      }

      setSubmissions(prev => prev.map(sub =>
        sub.id === id ? { ...sub, status, remarks } : sub
      ));
      
      console.log('Submission status updated successfully');
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
    console.log('Admin logout initiated');
    localStorage.removeItem('proposync-user');
    navigate('/auth');
  };

  const sendNotice = async () => {
    console.log('Sending notice:', noticeTitle, 'to', targetType);
    
    if (!noticeTitle.trim() || !noticeMessage.trim()) {
      toast({
        title: "Error",
        description: "Please fill in both title and message",
        variant: "destructive",
      });
      return;
    }

    if (targetType === 'individual' && !targetRollNumber.trim()) {
      toast({
        title: "Error", 
        description: "Please specify target roll number",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('notices')
        .insert({
          title: noticeTitle,
          message: noticeMessage,
          target_type: targetType,
          target_roll_number: targetType === 'individual' ? targetRollNumber : null
        });

      if (error) {
        console.error('Error sending notice:', error);
        throw error;
      }

      console.log('Notice sent successfully');
      toast({
        title: "Notice Sent!",
        description: `Notice sent to ${targetType === 'all' ? 'all students' : targetRollNumber}`,
      });

      // Reset form
      setNoticeTitle('');
      setNoticeMessage('');
      setTargetRollNumber('');
      setTargetType('all');
    } catch (error) {
      console.error('Error sending notice:', error);
      toast({
        title: "Error",
        description: "Failed to send notice",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading admin dashboard...</p>
          <p className="text-gray-500 text-sm mt-2">Checking database connection...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-white">
        <h1 className="text-xl font-semibold text-gray-900">Admin Dashboard</h1>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-600">
            Real-time Updates Active
          </div>
          <button onClick={handleLogout}>
            <LogOut className="h-6 w-6 text-gray-700" />
          </button>
        </div>
      </div>

      {/* Student Registration Stats */}
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="rounded-xl border-gray-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Users className="h-5 w-5 mr-2 text-blue-600" />
                Total Students
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{studentCount}</div>
              <p className="text-sm text-gray-600">Registered Students</p>
            </CardContent>
          </Card>

          <Card className="rounded-xl border-gray-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Users className="h-5 w-5 mr-2 text-green-600" />
                CS Department
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{csStudents}</div>
              <p className="text-sm text-gray-600">D234101 - D234160</p>
            </CardContent>
          </Card>

          <Card className="rounded-xl border-gray-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Users className="h-5 w-5 mr-2 text-purple-600" />
                IT Department
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">{itStudents}</div>
              <p className="text-sm text-gray-600">D235101 - D235130</p>
            </CardContent>
          </Card>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-2 mb-6">
          {['submissions', 'students', 'notices'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-full text-sm font-medium capitalize ${
                activeTab === tab
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Submissions Tab */}
        {activeTab === 'submissions' && (
          <>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Project Submissions ({submissions.length})</h2>

            {/* Search */}
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
                        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-white/95 backdrop-blur-sm border-2 border-gray-200 shadow-2xl">
                          <DialogHeader className="border-b border-gray-200 pb-4">
                            <DialogTitle className="text-xl font-bold text-gray-900">Project Details</DialogTitle>
                          </DialogHeader>
                          {selectedSubmission && (
                            <div className="space-y-6 pt-4">
                              <div className="bg-gray-50 rounded-lg p-4 grid md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <span className="text-sm font-medium text-gray-500">Roll Number</span>
                                  <p className="text-gray-900 font-semibold">{selectedSubmission.roll_number}</p>
                                </div>
                                <div className="space-y-2">
                                  <span className="text-sm font-medium text-gray-500">Student Name</span>
                                  <p className="text-gray-900 font-semibold">{selectedSubmission.student_name}</p>
                                </div>
                                <div className="space-y-2">
                                  <span className="text-sm font-medium text-gray-500">Team Members</span>
                                  <p className="text-gray-900 font-semibold">{selectedSubmission.team_members_count}</p>
                                </div>
                                <div className="space-y-2">
                                  <span className="text-sm font-medium text-gray-500">Estimated Cost</span>
                                  <p className="text-gray-900 font-semibold">₹{selectedSubmission.estimated_cost}</p>
                                </div>
                              </div>
                              
                              <div className="bg-blue-50 rounded-lg p-4">
                                <span className="text-sm font-medium text-blue-700">Project Title</span>
                                <p className="text-blue-900 font-bold text-lg mt-1">{selectedSubmission.project_title}</p>
                              </div>
                              
                              {selectedSubmission.project_description && (
                                <div className="bg-green-50 rounded-lg p-4">
                                  <span className="text-sm font-medium text-green-700">Description</span>
                                  <p className="mt-2 text-green-900 leading-relaxed">{selectedSubmission.project_description}</p>
                                </div>
                              )}
                              
                              <div className="bg-purple-50 rounded-lg p-4">
                                <span className="text-sm font-medium text-purple-700">Technologies</span>
                                <p className="mt-2 text-purple-900 font-medium">{selectedSubmission.technologies}</p>
                              </div>
                              
                              <div className="bg-orange-50 rounded-lg p-4">
                                <span className="text-sm font-medium text-orange-700">Team Members</span>
                                <p className="mt-2 text-orange-900 leading-relaxed">{selectedSubmission.team_members}</p>
                              </div>
                              
                              {selectedSubmission.software_requirements && (
                                <div className="bg-indigo-50 rounded-lg p-4">
                                  <span className="text-sm font-medium text-indigo-700">Software Requirements</span>
                                  <p className="mt-2 text-indigo-900 leading-relaxed">{selectedSubmission.software_requirements}</p>
                                </div>
                              )}
                              
                              {selectedSubmission.hardware_requirements && (
                                <div className="bg-red-50 rounded-lg p-4">
                                  <span className="text-sm font-medium text-red-700">Hardware Requirements</span>
                                  <p className="mt-2 text-red-900 leading-relaxed">{selectedSubmission.hardware_requirements}</p>
                                </div>
                              )}
                              
                              <div className="bg-gray-100 rounded-lg p-4">
                                <span className="text-sm font-medium text-gray-600">Submission Date</span>
                                <p className="text-gray-900 font-medium mt-1">{new Date(selectedSubmission.submitted_at).toLocaleString()}</p>
                              </div>
                              
                              <div className="flex space-x-3 pt-6 border-t border-gray-200">
                                <Button
                                  onClick={() => updateSubmissionStatus(selectedSubmission.id, 'approved')}
                                  className="flex-1 bg-green-600 hover:bg-green-700 text-white h-12 rounded-lg font-medium"
                                  disabled={selectedSubmission.status === 'approved'}
                                >
                                  <CheckCircle className="h-5 w-5 mr-2" />
                                  Approve Project
                                </Button>
                                <Button
                                  onClick={() => updateSubmissionStatus(selectedSubmission.id, 'rejected')}
                                  className="flex-1 bg-red-600 hover:bg-red-700 text-white h-12 rounded-lg font-medium"
                                  disabled={selectedSubmission.status === 'rejected'}
                                >
                                  <XCircle className="h-5 w-5 mr-2" />
                                  Reject Project
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
          </>
        )}

        {/* Students Tab */}
        {activeTab === 'students' && (
          <>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Registered Students ({students.length})</h2>
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Roll Number</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Registered</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">{student.roll_number}</TableCell>
                      <TableCell>{student.name || 'N/A'}</TableCell>
                      <TableCell>{student.email || 'N/A'}</TableCell>
                      <TableCell>{student.phone_number || 'N/A'}</TableCell>
                      <TableCell>{new Date(student.created_at).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}

        {/* Notices Tab */}
        {activeTab === 'notices' && (
          <>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Send Notice</h2>
            <div className="bg-white rounded-xl p-6 border border-gray-200 max-w-2xl">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notice Title
                  </label>
                  <Input
                    value={noticeTitle}
                    onChange={(e) => setNoticeTitle(e.target.value)}
                    placeholder="Enter notice title"
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message
                  </label>
                  <Textarea
                    value={noticeMessage}
                    onChange={(e) => setNoticeMessage(e.target.value)}
                    placeholder="Enter notice message"
                    rows={4}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target
                  </label>
                  <div className="flex space-x-4 mb-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="target"
                        value="all"
                        checked={targetType === 'all'}
                        onChange={(e) => setTargetType(e.target.value as 'all')}
                        className="mr-2"
                      />
                      All Students
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="target"
                        value="individual"
                        checked={targetType === 'individual'}
                        onChange={(e) => setTargetType(e.target.value as 'individual')}
                        className="mr-2"
                      />
                      Specific Student
                    </label>
                  </div>
                  
                  {targetType === 'individual' && (
                    <Input
                      value={targetRollNumber}
                      onChange={(e) => setTargetRollNumber(e.target.value)}
                      placeholder="Enter roll number (e.g., D234101)"
                      className="w-full"
                    />
                  )}
                </div>

                <Button
                  onClick={sendNotice}
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                >
                  Send Notice
                </Button>
              </div>
            </div>
          </>
        )}
        
        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 py-6 px-4 text-center mt-8">
          <p className="text-sm text-gray-500">
            Developed by <span className="font-medium text-blue-600">Yash Pawar</span>
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Admin;
