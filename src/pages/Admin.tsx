
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Eye, CheckCircle, XCircle, MessageSquare, Search, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface Submission {
  id: string;
  rollNumber: string;
  studentName: string;
  projectTitle: string;
  teamMembersCount: string;
  teamMembers: string;
  softwareRequirements: string;
  hardwareRequirements: string;
  estimatedCost: string;
  technologies: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  remarks: string;
}

const Admin = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [remarkText, setRemarkText] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem('proposync-submissions') || '[]');
    setSubmissions(data);
  }, []);

  const filteredSubmissions = submissions.filter(submission =>
    submission.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    submission.rollNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    submission.projectTitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const updateSubmissionStatus = (id: string, status: 'approved' | 'rejected', remarks: string = '') => {
    const updatedSubmissions = submissions.map(sub =>
      sub.id === id ? { ...sub, status, remarks } : sub
    );
    setSubmissions(updatedSubmissions);
    localStorage.setItem('proposync-submissions', JSON.stringify(updatedSubmissions));
    
    toast({
      title: `Project ${status}!`,
      description: `The project has been ${status} successfully.`,
    });
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
              <h1 className="text-xl font-bold text-gray-900">PropoSync Admin</h1>
            </div>
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
                        <td className="p-3 font-mono text-sm">{submission.rollNumber}</td>
                        <td className="p-3">{submission.studentName}</td>
                        <td className="p-3">
                          <div className="max-w-xs truncate" title={submission.projectTitle}>
                            {submission.projectTitle}
                          </div>
                        </td>
                        <td className="p-3">{submission.teamMembersCount}</td>
                        <td className="p-3">₹{submission.estimatedCost}</td>
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
                                        <strong>Roll Number:</strong> {selectedSubmission.rollNumber}
                                      </div>
                                      <div>
                                        <strong>Student Name:</strong> {selectedSubmission.studentName}
                                      </div>
                                    </div>
                                    <div>
                                      <strong>Project Title:</strong> {selectedSubmission.projectTitle}
                                    </div>
                                    <div>
                                      <strong>Technologies:</strong> {selectedSubmission.technologies}
                                    </div>
                                    <div>
                                      <strong>Team Members ({selectedSubmission.teamMembersCount}):</strong>
                                      <pre className="mt-1 text-sm bg-gray-100 p-2 rounded">
                                        {selectedSubmission.teamMembers}
                                      </pre>
                                    </div>
                                    <div>
                                      <strong>Software Requirements:</strong>
                                      <pre className="mt-1 text-sm bg-gray-100 p-2 rounded">
                                        {selectedSubmission.softwareRequirements || 'Not specified'}
                                      </pre>
                                    </div>
                                    <div>
                                      <strong>Hardware Requirements:</strong>
                                      <pre className="mt-1 text-sm bg-gray-100 p-2 rounded">
                                        {selectedSubmission.hardwareRequirements || 'Not specified'}
                                      </pre>
                                    </div>
                                    <div>
                                      <strong>Estimated Cost:</strong> ₹{selectedSubmission.estimatedCost}
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
