import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus, Eye, CheckCircle, XCircle, LogOut, Users, Home, Settings, FolderOpen, Edit, Trash2, Save, X } from "lucide-react";
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
import StudentManagement from "@/components/StudentManagement";

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
  is_suspended?: boolean;
}

const Admin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);
  const [filter, setFilter] = useState('All');
  const [studentCount, setStudentCount] = useState(0);
  const [csStudents, setCsStudents] = useState(0);
  const [itStudents, setItStudents] = useState(0);
  const [students, setStudents] = useState<Student[]>([]);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeMessage, setNoticeMessage] = useState('');
  const [targetType, setTargetType] = useState<'all' | 'individual'>('all');
  const [targetRollNumber, setTargetRollNumber] = useState('');
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking');

  // Abuse words list
  const abuseWords = [
    'chutiya', 'madarchod', 'jhatu', 'jha', 'mc', 'bc', 'bhenchod',
    'randi', 'harami', 'kamina', 'gandu', 'bhosdike', 'laude', 'teri ma'
  ];

  const checkForAbuseWords = (text: string) => {
    const lowerText = text.toLowerCase();
    return abuseWords.some(word => lowerText.includes(word));
  };

  useEffect(() => {
    console.log('Admin component mounted, starting initialization...');
    initializeAdmin();
  }, []);

  const initializeAdmin = async () => {
    try {
      console.log('Starting admin initialization...');
      
      // Check authentication first
      if (!checkAuth()) {
        return;
      }

      // Test database connection
      await testDatabaseConnection();
      
      // Load all data
      await Promise.all([
        loadSubmissions(),
        loadStudentCounts(),
        loadStudents()
      ]);

      // Set up real-time subscriptions
      setupRealTimeSubscriptions();
      
      console.log('Admin initialization completed successfully');
    } catch (error) {
      console.error('Admin initialization failed:', error);
      toast({
        title: "Initialization Error",
        description: "Failed to initialize admin panel. Please refresh the page.",
        variant: "destructive",
      });
    }
  };

  const testDatabaseConnection = async () => {
    try {
      console.log('Testing database connection...');
      setConnectionStatus('checking');
      
      const { data, error } = await supabase
        .from('profiles')
        .select('count')
        .limit(1);
        
      if (error) {
        console.error('Database connection test failed:', error);
        setConnectionStatus('error');
        throw new Error(`Database connection failed: ${error.message}`);
      }
      
      console.log('Database connection test successful');
      setConnectionStatus('connected');
    } catch (error) {
      console.error('Database connection test error:', error);
      setConnectionStatus('error');
      throw error;
    }
  };

  const checkAuth = () => {
    console.log('Checking admin authentication...');
    try {
      const userData = localStorage.getItem('proposync-user');
      console.log('User data from localStorage:', userData);
      
      if (!userData) {
        console.log('No user data found, redirecting to admin auth');
        navigate('/auth?type=admin');
        return false;
      }

      const parsedUser = JSON.parse(userData);
      console.log('Parsed user data:', parsedUser);
      
      if (parsedUser.type !== 'admin' || !parsedUser.adminCode) {
        console.log('Invalid admin credentials, clearing and redirecting');
        localStorage.removeItem('proposync-user');
        navigate('/auth?type=admin');
        return false;
      }
      
      console.log('Admin authentication successful');
      return true;
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('proposync-user');
      navigate('/auth?type=admin');
      return false;
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
    setSubmissionsLoading(true);
    
    try {
      // Load all submissions with better error handling
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
      setSubmissionsLoading(false);
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

  const updateStudent = async (student: Student) => {
    console.log('Updating student:', student.id);
    
    // Check for abuse words in name, email, and phone
    const textToCheck = `${student.name || ''} ${student.email || ''} ${student.phone_number || ''}`;
    if (checkForAbuseWords(textToCheck)) {
      // Suspend the student
      try {
        const { error } = await supabase
          .from('profiles')
          .update({ 
            name: student.name,
            email: student.email,
            phone_number: student.phone_number,
            is_suspended: true,
            updated_at: new Date().toISOString()
          })
          .eq('id', student.id);

        if (error) throw error;

        toast({
          title: "Student Suspended",
          description: "Student has been suspended due to inappropriate language and updated.",
          variant: "destructive",
        });
      } catch (error: any) {
        console.error('Error suspending student:', error);
        toast({
          title: "Error",
          description: "Failed to suspend student: " + error.message,
          variant: "destructive",
        });
        return;
      }
    } else {
      // Normal update
      try {
        const { error } = await supabase
          .from('profiles')
          .update({
            name: student.name,
            email: student.email,
            phone_number: student.phone_number,
            updated_at: new Date().toISOString()
          })
          .eq('id', student.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Student updated successfully",
        });
      } catch (error: any) {
        console.error('Error updating student:', error);
        toast({
          title: "Error",
          description: "Failed to update student: " + error.message,
          variant: "destructive",
        });
        return;
      }
    }

    setEditingStudent(null);
    loadStudents();
  };

  const deleteStudent = async (studentId: string) => {
    if (!confirm('Are you sure you want to delete this student? This action cannot be undone.')) {
      return;
    }

    try {
      console.log('Deleting student:', studentId);
      
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', studentId);

      if (error) {
        console.error('Error deleting student:', error);
        throw error;
      }

      console.log('Student deleted successfully');
      toast({
        title: "Success",
        description: "Student deleted successfully",
      });

      loadStudents();
      loadStudentCounts();
    } catch (error: any) {
      console.error('Error deleting student:', error);
      toast({
        title: "Error",
        description: "Failed to delete student: " + error.message,
        variant: "destructive",
      });
    }
  };

  const setupRealTimeSubscriptions = () => {
    console.log('Setting up real-time subscriptions...');
    
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
        loadStudents();
      })
      .subscribe();

    // Cleanup function
    return () => {
      console.log('Cleaning up real-time subscriptions...');
      supabase.removeChannel(submissionsChannel);
      supabase.removeChannel(profilesChannel);
    };
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
        return <Badge className="bg-green-100 text-green-800 border-green-200">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Rejected</Badge>;
      default:
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Ongoing</Badge>;
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

  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-yellow-600';
    }
  };

  const getConnectionStatusText = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'Connected';
      case 'error':
        return 'Connection Error';
      default:
        return 'Connecting...';
    }
  };

  const getOngoingProjects = () => {
    return submissions.filter(s => s.status === 'pending');
  };

  const getCompletedProjects = () => {
    return submissions.filter(s => s.status === 'approved');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-gray-600 mt-4 text-lg">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <Button
              onClick={() => setActiveTab('dashboard')}
              variant="ghost"
              size="sm"
              className="text-gray-600"
            >
              <Plus className="h-5 w-5" />
            </Button>
          </div>
          <div className="flex items-center space-x-4">
            <div className={`text-sm ${getConnectionStatusColor()}`}>
              {getConnectionStatusText()}
            </div>
            <Button onClick={handleLogout} variant="ghost" size="sm">
              <LogOut className="h-5 w-5 text-gray-600" />
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <>
            {/* Stats Cards */}
            <div className="mb-8">
              {/* Total Students Card */}
              <Card className="bg-gray-100 border-0 mb-6">
                <CardContent className="p-6">
                  <div className="text-left">
                    <h3 className="text-lg font-medium text-gray-700 mb-2">Total Students</h3>
                    <div className="text-4xl font-bold text-gray-900">{studentCount}</div>
                  </div>
                </CardContent>
              </Card>

              {/* Department Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="border border-gray-200 bg-white">
                  <CardContent className="p-6">
                    <div className="text-left">
                      <h3 className="text-lg font-medium text-gray-700 mb-2">IT Students</h3>
                      <div className="text-4xl font-bold text-gray-900">{itStudents}</div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border border-gray-200 bg-white">
                  <CardContent className="p-6">
                    <div className="text-left">
                      <h3 className="text-lg font-medium text-gray-700 mb-2">CS Students</h3>
                      <div className="text-4xl font-bold text-gray-900">{csStudents}</div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Student Projects Section */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Student Projects</h2>
              
              {/* Ongoing Projects */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-blue-600">Ongoing</h3>
                </div>
                <div className="space-y-4">
                  {getOngoingProjects().slice(0, 3).map((project) => (
                    <Card key={project.id} className="border border-gray-200 bg-white">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 mb-1">{project.project_title}</h4>
                            <p className="text-blue-600 text-sm mb-2">{project.roll_number.startsWith('D234') ? 'CS Department' : 'IT Department'}</p>
                            <div className="flex items-center space-x-4">
                              {getStatusBadge(project.status)}
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setSelectedSubmission(project)}
                                    className="text-gray-600 border-gray-300"
                                  >
                                    View
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
                                          <strong>Student:</strong> {selectedSubmission.student_name}
                                        </div>
                                        <div>
                                          <strong>Roll Number:</strong> {selectedSubmission.roll_number}
                                        </div>
                                        <div>
                                          <strong>Team Size:</strong> {selectedSubmission.team_members_count}
                                        </div>
                                        <div>
                                          <strong>Budget:</strong> ₹{selectedSubmission.estimated_cost}
                                        </div>
                                      </div>
                                      <div>
                                        <strong>Project Title:</strong> {selectedSubmission.project_title}
                                      </div>
                                      {selectedSubmission.project_description && (
                                        <div>
                                          <strong>Description:</strong> {selectedSubmission.project_description}
                                        </div>
                                      )}
                                      <div>
                                        <strong>Technologies:</strong> {selectedSubmission.technologies}
                                      </div>
                                      <div>
                                        <strong>Team Members:</strong> {selectedSubmission.team_members}
                                      </div>
                                      {selectedSubmission.software_requirements && (
                                        <div>
                                          <strong>Software Requirements:</strong> {selectedSubmission.software_requirements}
                                        </div>
                                      )}
                                      {selectedSubmission.hardware_requirements && (
                                        <div>
                                          <strong>Hardware Requirements:</strong> {selectedSubmission.hardware_requirements}
                                        </div>
                                      )}
                                      <div className="flex space-x-2 pt-4">
                                        <Button
                                          onClick={() => updateSubmissionStatus(selectedSubmission.id, 'approved')}
                                          className="bg-green-600 hover:bg-green-700 text-white"
                                          disabled={selectedSubmission.status === 'approved'}
                                        >
                                          <CheckCircle className="h-4 w-4 mr-2" />
                                          Approve
                                        </Button>
                                        <Button
                                          onClick={() => updateSubmissionStatus(selectedSubmission.id, 'rejected')}
                                          className="bg-red-600 hover:bg-red-700 text-white"
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
                          </div>
                          <div className="w-16 h-16 bg-gradient-to-br from-orange-200 to-orange-300 rounded-lg flex items-center justify-center">
                            <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full"></div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Completed Projects */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-blue-600">Completed</h3>
                </div>
                <div className="space-y-4">
                  {getCompletedProjects().slice(0, 3).map((project) => (
                    <Card key={project.id} className="border border-gray-200 bg-white">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 mb-1">{project.project_title}</h4>
                            <p className="text-blue-600 text-sm mb-2">{project.roll_number.startsWith('D234') ? 'CS Department' : 'IT Department'}</p>
                            <div className="flex items-center space-x-4">
                              {getStatusBadge(project.status)}
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setSelectedSubmission(project)}
                                    className="text-gray-600 border-gray-300"
                                  >
                                    View
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
                                          <strong>Student:</strong> {selectedSubmission.student_name}
                                        </div>
                                        <div>
                                          <strong>Roll Number:</strong> {selectedSubmission.roll_number}
                                        </div>
                                        <div>
                                          <strong>Team Size:</strong> {selectedSubmission.team_members_count}
                                        </div>
                                        <div>
                                          <strong>Budget:</strong> ₹{selectedSubmission.estimated_cost}
                                        </div>
                                      </div>
                                      <div>
                                        <strong>Project Title:</strong> {selectedSubmission.project_title}
                                      </div>
                                      {selectedSubmission.project_description && (
                                        <div>
                                          <strong>Description:</strong> {selectedSubmission.project_description}
                                        </div>
                                      )}
                                      <div>
                                        <strong>Technologies:</strong> {selectedSubmission.technologies}
                                      </div>
                                      <div>
                                        <strong>Team Members:</strong> {selectedSubmission.team_members}
                                      </div>
                                      {selectedSubmission.software_requirements && (
                                        <div>
                                          <strong>Software Requirements:</strong> {selectedSubmission.software_requirements}
                                        </div>
                                      )}
                                      {selectedSubmission.hardware_requirements && (
                                        <div>
                                          <strong>Hardware Requirements:</strong> {selectedSubmission.hardware_requirements}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </DialogContent>
                              </Dialog>
                            </div>
                          </div>
                          <div className="w-16 h-16 bg-gradient-to-br from-blue-200 to-blue-300 rounded-lg flex items-center justify-center">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-500 rounded-full"></div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Students Tab */}
        {activeTab === 'students' && (
          <>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Students ({students.length})</h2>
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Roll Number</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Registered</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">{student.roll_number}</TableCell>
                      <TableCell>
                        {editingStudent?.id === student.id ? (
                          <Input
                            value={editingStudent.name || ''}
                            onChange={(e) => setEditingStudent(prev => prev ? { ...prev, name: e.target.value } : null)}
                            className="h-8"
                          />
                        ) : (
                          student.name || 'N/A'
                        )}
                      </TableCell>
                      <TableCell>
                        {editingStudent?.id === student.id ? (
                          <Input
                            value={editingStudent.email || ''}
                            onChange={(e) => setEditingStudent(prev => prev ? { ...prev, email: e.target.value } : null)}
                            className="h-8"
                          />
                        ) : (
                          student.email || 'N/A'
                        )}
                      </TableCell>
                      <TableCell>
                        {editingStudent?.id === student.id ? (
                          <Input
                            value={editingStudent.phone_number || ''}
                            onChange={(e) => setEditingStudent(prev => prev ? { ...prev, phone_number: e.target.value } : null)}
                            className="h-8"
                          />
                        ) : (
                          student.phone_number || 'N/A'
                        )}
                      </TableCell>
                      <TableCell>
                        {student.is_suspended ? (
                          <Badge className="bg-red-100 text-red-800 border-red-200">Suspended</Badge>
                        ) : (
                          <Badge className="bg-green-100 text-green-800 border-green-200">Active</Badge>
                        )}
                      </TableCell>
                      <TableCell>{new Date(student.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          {editingStudent?.id === student.id ? (
                            <>
                              <Button
                                size="sm"
                                onClick={() => updateStudent(editingStudent)}
                                className="bg-green-500 hover:bg-green-600"
                              >
                                <Save className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setEditingStudent(null)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setEditingStudent(student)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => deleteStudent(student.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}

        {/* Projects Tab */}
        {activeTab === 'projects' && (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">All Projects ({submissions.length})</h2>
              <Button
                onClick={loadSubmissions}
                disabled={submissionsLoading}
                variant="outline"
              >
                {submissionsLoading ? 'Refreshing...' : 'Refresh'}
              </Button>
            </div>

            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-gray-300"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex space-x-2 mb-6">
              {['All', 'Pending', 'Approved', 'Rejected'].map((filterOption) => (
                <button
                  key={filterOption}
                  onClick={() => setFilter(filterOption)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === filterOption
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {filterOption} ({filterOption === 'All' ? submissions.length : submissions.filter(s => s.status.toLowerCase() === filterOption.toLowerCase()).length})
                </button>
              ))}
            </div>

            {/* Projects List */}
            <div className="space-y-4">
              {submissionsLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading projects...</p>
                </div>
              ) : filteredSubmissions.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">No projects found</p>
                </div>
              ) : (
                filteredSubmissions.map((submission) => (
                  <Card key={submission.id} className="border border-gray-200 bg-white">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 text-lg mb-2">
                            {submission.project_title}
                          </h3>
                          <p className="text-gray-600 mb-1">
                            {submission.student_name} ({submission.roll_number})
                          </p>
                          <p className="text-gray-500 text-sm">
                            Team: {submission.team_members_count} members | Budget: ₹{submission.estimated_cost}
                          </p>
                        </div>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              onClick={() => setSelectedSubmission(submission)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Review
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Project Review</DialogTitle>
                            </DialogHeader>
                            {selectedSubmission && (
                              <div className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                                  <div>
                                    <span className="text-sm font-medium text-gray-500">Student</span>
                                    <p className="font-semibold">{selectedSubmission.student_name}</p>
                                  </div>
                                  <div>
                                    <span className="text-sm font-medium text-gray-500">Roll Number</span>
                                    <p className="font-semibold">{selectedSubmission.roll_number}</p>
                                  </div>
                                  <div>
                                    <span className="text-sm font-medium text-gray-500">Team Size</span>
                                    <p className="font-semibold">{selectedSubmission.team_members_count}</p>
                                  </div>
                                  <div>
                                    <span className="text-sm font-medium text-gray-500">Budget</span>
                                    <p className="font-semibold">₹{selectedSubmission.estimated_cost}</p>
                                  </div>
                                </div>
                                
                                <div className="space-y-4">
                                  <div>
                                    <h4 className="font-semibold text-gray-900 mb-2">Project Title</h4>
                                    <p className="text-gray-700">{selectedSubmission.project_title}</p>
                                  </div>
                                  
                                  {selectedSubmission.project_description && (
                                    <div>
                                      <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
                                      <p className="text-gray-700 leading-relaxed">{selectedSubmission.project_description}</p>
                                    </div>
                                  )}
                                  
                                  <div>
                                    <h4 className="font-semibold text-gray-900 mb-2">Technologies</h4>
                                    <p className="text-gray-700">{selectedSubmission.technologies}</p>
                                  </div>
                                  
                                  <div>
                                    <h4 className="font-semibold text-gray-900 mb-2">Team Members</h4>
                                    <p className="text-gray-700">{selectedSubmission.team_members}</p>
                                  </div>
                                  
                                  {selectedSubmission.software_requirements && (
                                    <div>
                                      <h4 className="font-semibold text-gray-900 mb-2">Software Requirements</h4>
                                      <p className="text-gray-700">{selectedSubmission.software_requirements}</p>
                                    </div>
                                  )}
                                  
                                  {selectedSubmission.hardware_requirements && (
                                    <div>
                                      <h4 className="font-semibold text-gray-900 mb-2">Hardware Requirements</h4>
                                      <p className="text-gray-700">{selectedSubmission.hardware_requirements}</p>
                                    </div>
                                  )}
                                </div>
                                
                                <div className="flex space-x-3 pt-6 border-t">
                                  <Button
                                    onClick={() => updateSubmissionStatus(selectedSubmission.id, 'approved')}
                                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                                    disabled={selectedSubmission.status === 'approved'}
                                  >
                                    <CheckCircle className="h-5 w-5 mr-2" />
                                    Approve Project
                                  </Button>
                                  <Button
                                    onClick={() => updateSubmissionStatus(selectedSubmission.id, 'rejected')}
                                    className="flex-1 bg-red-600 hover:bg-red-700 text-white"
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
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Settings</h2>
            
            {/* Notice Section */}
            <Card className="max-w-2xl">
              <CardHeader>
                <CardTitle>Send Notice</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notice Title
                  </label>
                  <Input
                    value={noticeTitle}
                    onChange={(e) => setNoticeTitle(e.target.value)}
                    placeholder="Enter notice title"
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
                    />
                  )}
                </div>

                <Button
                  onClick={sendNotice}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={!noticeTitle.trim() || !noticeMessage.trim()}
                >
                  Send Notice
                </Button>
              </CardContent>
            </Card>

            {/* Student Management */}
            <div className="mt-8">
              <StudentManagement />
            </div>
          </>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-3">
        <div className="flex justify-center space-x-8">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center space-y-1 p-2 rounded-lg transition-colors ${
              activeTab === 'dashboard' ? 'text-blue-600' : 'text-gray-500'
            }`}
          >
            <Home className="h-6 w-6" />
            <span className="text-xs font-medium">Dashboard</span>
          </button>
          
          <button
            onClick={() => setActiveTab('students')}
            className={`flex flex-col items-center space-y-1 p-2 rounded-lg transition-colors ${
              activeTab === 'students' ? 'text-blue-600' : 'text-gray-500'
            }`}
          >
            <Users className="h-6 w-6" />
            <span className="text-xs font-medium">Students</span>
          </button>
          
          <button
            onClick={() => setActiveTab('projects')}
            className={`flex flex-col items-center space-y-1 p-2 rounded-lg transition-colors ${
              activeTab === 'projects' ? 'text-blue-600' : 'text-gray-500'
            }`}
          >
            <FolderOpen className="h-6 w-6" />
            <span className="text-xs font-medium">Projects</span>
          </button>
          
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex flex-col items-center space-y-1 p-2 rounded-lg transition-colors ${
              activeTab === 'settings' ? 'text-blue-600' : 'text-gray-500'
            }`}
          >
            <Settings className="h-6 w-6" />
            <span className="text-xs font-medium">Settings</span>
          </button>
        </div>
      </div>

      {/* Footer spacing for bottom navigation */}
      <div className="h-20"></div>
    </div>
  );
};

export default Admin;
