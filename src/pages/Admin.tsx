import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Clock, 
  LogOut, 
  BarChart3,
  Bell,
  Settings,
  Menu,
  X
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useZoom } from "@/hooks/useZoom";
import { supabase } from "@/integrations/supabase/client";
import StudentManagement from "@/components/StudentManagement";
import NoticesPanel from "@/components/NoticesPanel";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface Submission {
  id: string;
  student_name: string;
  roll_number: string;
  project_title: string;
  team_members: string;
  team_members_count: number;
  technologies: string;
  status: string;
  submitted_at: string;
  remarks: string;
  estimated_cost: string;
  software_requirements: string;
  hardware_requirements: string;
  project_description: string;
}

const Admin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { resetZoom } = useZoom();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    loadSubmissions();
  }, []);

  const loadSubmissions = async () => {
    try {
      console.log('Loading submissions...');
      const { data, error } = await supabase
        .from('submissions')
        .select('*')
        .order('submitted_at', { ascending: false });

      if (error) {
        console.error('Error loading submissions:', error);
        throw error;
      }
      
      console.log('Submissions loaded successfully:', data?.length || 0, 'submissions');
      setSubmissions(data || []);
    } catch (error: any) {
      console.error('Error loading submissions:', error);
      toast({
        title: "Error",
        description: "Failed to load submissions: " + error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateSubmissionStatus = async (id: string, status: string, remarks?: string) => {
    try {
      console.log('Updating submission status:', id, 'to', status);
      
      const { error } = await supabase
        .from('submissions')
        .update({ 
          status,
          remarks: remarks || '',
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        console.error('Error updating submission:', error);
        throw error;
      }

      console.log('Submission status updated successfully');
      toast({
        title: "Success",
        description: `Submission ${status} successfully`,
      });

      loadSubmissions();
    } catch (error: any) {
      console.error('Error updating submission:', error);
      toast({
        title: "Error",
        description: "Failed to update submission: " + error.message,
        variant: "destructive",
      });
    }
  };

  const handleLogout = () => {
    console.log('Admin logout');
    navigate('/auth');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const stats = {
    total: submissions.length,
    pending: submissions.filter(s => s.status === 'pending').length,
    approved: submissions.filter(s => s.status === 'approved').length,
    rejected: submissions.filter(s => s.status === 'rejected').length,
  };

  const StatCard = ({ title, value, icon: Icon, color }: any) => (
    <Card className="relative overflow-hidden border-0 shadow-sm">
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900">{value}</p>
          </div>
          <div className={`p-2 sm:p-3 rounded-full ${color}`}>
            <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const MobileNav = () => (
    <div className="flex flex-col space-y-2 p-4">
      <Button 
        variant={activeTab === "dashboard" ? "default" : "ghost"} 
        className="w-full justify-start"
        onClick={() => {
          setActiveTab("dashboard");
          setIsMobileMenuOpen(false);
        }}
      >
        <BarChart3 className="h-4 w-4 mr-2" />
        Dashboard
      </Button>
      <Button 
        variant={activeTab === "submissions" ? "default" : "ghost"} 
        className="w-full justify-start"
        onClick={() => {
          setActiveTab("submissions");
          setIsMobileMenuOpen(false);
        }}
      >
        <FileText className="h-4 w-4 mr-2" />
        Submissions
      </Button>
      <Button 
        variant={activeTab === "students" ? "default" : "ghost"} 
        className="w-full justify-start"
        onClick={() => {
          setActiveTab("students");
          setIsMobileMenuOpen(false);
        }}
      >
        <Users className="h-4 w-4 mr-2" />
        Students
      </Button>
      <Button 
        variant={activeTab === "notices" ? "default" : "ghost"} 
        className="w-full justify-start"
        onClick={() => {
          setActiveTab("notices");
          setIsMobileMenuOpen(false);
        }}
      >
        <Bell className="h-4 w-4 mr-2" />
        Notices
      </Button>
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 text-sm sm:text-base">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen bg-gray-50" 
      style={{ 
        touchAction: 'pan-x pan-y',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        WebkitTouchCallout: 'none',
        overscrollBehavior: 'none'
      }}
    >
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold">Navigation</h2>
                </div>
                <MobileNav />
              </SheetContent>
            </Sheet>
            <h1 className="text-lg sm:text-xl font-bold text-gray-900">Admin Panel</h1>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleLogout}
            className="text-red-600 hover:text-red-700"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex">
        {/* Desktop Sidebar */}
        <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:bg-white lg:border-r lg:border-gray-200">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
          </div>
          
          <nav className="flex-1 p-4 space-y-2">
            <Button 
              variant={activeTab === "dashboard" ? "default" : "ghost"} 
              className="w-full justify-start"
              onClick={() => setActiveTab("dashboard")}
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
            <Button 
              variant={activeTab === "submissions" ? "default" : "ghost"} 
              className="w-full justify-start"
              onClick={() => setActiveTab("submissions")}
            >
              <FileText className="h-4 w-4 mr-2" />
              Submissions
            </Button>
            <Button 
              variant={activeTab === "students" ? "default" : "ghost"} 
              className="w-full justify-start"
              onClick={() => setActiveTab("students")}
            >
              <Users className="h-4 w-4 mr-2" />
              Students
            </Button>
            <Button 
              variant={activeTab === "notices" ? "default" : "ghost"} 
              className="w-full justify-start"
              onClick={() => setActiveTab("notices")}
            >
              <Bell className="h-4 w-4 mr-2" />
              Notices
            </Button>
          </nav>

          <div className="p-4 border-t border-gray-200">
            <Button 
              variant="ghost" 
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 lg:ml-64">
          <div className="p-4 sm:p-6 lg:p-8 max-w-full">
            {activeTab === "dashboard" && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h2>
                  <div className="text-sm text-gray-500">
                    Last updated: {new Date().toLocaleString()}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                  <StatCard 
                    title="Total Submissions" 
                    value={stats.total} 
                    icon={FileText}
                    color="bg-blue-500"
                  />
                  <StatCard 
                    title="Pending" 
                    value={stats.pending} 
                    icon={Clock}
                    color="bg-yellow-500"
                  />
                  <StatCard 
                    title="Approved" 
                    value={stats.approved} 
                    icon={CheckCircle}
                    color="bg-green-500"
                  />
                  <StatCard 
                    title="Rejected" 
                    value={stats.rejected} 
                    icon={XCircle}
                    color="bg-red-500"
                  />
                </div>

                {stats.total > 0 && (
                  <Card className="border-0 shadow-sm">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg">Recent Submissions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {submissions.slice(0, 5).map((submission) => (
                        <div key={submission.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-gray-50 rounded-lg gap-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-gray-900 truncate">{submission.project_title}</h3>
                            <p className="text-sm text-gray-600">
                              {submission.student_name} ({submission.roll_number})
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(submission.submitted_at).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge className={`${getStatusColor(submission.status)} flex items-center gap-1 shrink-0`}>
                            {getStatusIcon(submission.status)}
                            {submission.status}
                          </Badge>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {activeTab === "submissions" && (
              <div className="space-y-6">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Project Submissions</h2>
                
                {submissions.length === 0 ? (
                  <Card className="border-0 shadow-sm">
                    <CardContent className="text-center py-12">
                      <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No submissions found</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {submissions.map((submission) => (
                      <Card key={submission.id} className="border-0 shadow-sm">
                        <CardContent className="p-4 sm:p-6">
                          <div className="space-y-4">
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <h3 className="text-lg font-semibold text-gray-900 break-words">
                                  {submission.project_title}
                                </h3>
                                <p className="text-sm text-gray-600">
                                  {submission.student_name} ({submission.roll_number})
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  Submitted: {new Date(submission.submitted_at).toLocaleString()}
                                </p>
                              </div>
                              <Badge className={`${getStatusColor(submission.status)} flex items-center gap-1 shrink-0`}>
                                {getStatusIcon(submission.status)}
                                {submission.status}
                              </Badge>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="font-medium text-gray-700">Team Members:</span>
                                <p className="text-gray-600 break-words">{submission.team_members}</p>
                              </div>
                              <div>
                                <span className="font-medium text-gray-700">Technologies:</span>
                                <p className="text-gray-600 break-words">{submission.technologies}</p>
                              </div>
                              <div>
                                <span className="font-medium text-gray-700">Estimated Cost:</span>
                                <p className="text-gray-600">{submission.estimated_cost}</p>
                              </div>
                              <div>
                                <span className="font-medium text-gray-700">Team Size:</span>
                                <p className="text-gray-600">{submission.team_members_count} members</p>
                              </div>
                            </div>

                            {submission.project_description && (
                              <div>
                                <span className="font-medium text-gray-700 text-sm">Description:</span>
                                <p className="text-gray-600 text-sm mt-1 break-words">{submission.project_description}</p>
                              </div>
                            )}

                            {submission.remarks && (
                              <div className="bg-gray-50 p-3 rounded-lg">
                                <span className="font-medium text-gray-700 text-sm">Remarks:</span>
                                <p className="text-gray-600 text-sm mt-1 break-words">{submission.remarks}</p>
                              </div>
                            )}

                            {submission.status === 'pending' && (
                              <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t border-gray-200">
                                <Button 
                                  onClick={() => updateSubmissionStatus(submission.id, 'approved')}
                                  className="bg-green-500 hover:bg-green-600 text-white flex-1 sm:flex-none"
                                  size="sm"
                                >
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Approve
                                </Button>
                                <Button 
                                  onClick={() => updateSubmissionStatus(submission.id, 'rejected')}
                                  variant="destructive"
                                  className="flex-1 sm:flex-none"
                                  size="sm"
                                >
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Reject
                                </Button>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "students" && <StudentManagement />}
            
            {activeTab === "notices" && <NoticesPanel />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
