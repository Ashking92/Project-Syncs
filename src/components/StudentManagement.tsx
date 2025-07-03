
import { useState, useEffect } from "react";
import { Search, Plus, Edit, Trash2, Save, X, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

interface ManagedStudent {
  id: string;
  roll_number: string;
  name: string;
  email: string;
  phone_number: string;
  department: string;
  created_at: string;
}

const StudentManagement = () => {
  const { toast } = useToast();
  const [students, setStudents] = useState<ManagedStudent[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [editingStudent, setEditingStudent] = useState<ManagedStudent | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newStudent, setNewStudent] = useState({
    roll_number: "",
    name: "",
    email: "",
    phone_number: "",
    department: ""
  });

  useEffect(() => {
    loadManagedStudents();
  }, []);

  const loadManagedStudents = async () => {
    setIsLoading(true);
    try {
      console.log('Loading managed students from admin_managed_students table...');
      const { data, error } = await supabase
        .from('admin_managed_students')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading managed students:', error);
        throw error;
      }
      
      console.log('Managed students loaded successfully:', data?.length || 0, 'students');
      setStudents(data || []);
    } catch (error: any) {
      console.error('Error loading managed students:', error);
      toast({
        title: "Error",
        description: "Failed to load students: " + error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const validateRollNumber = (rollNum: string, dept: string) => {
    const numericPart = parseInt(rollNum.substring(1));
    
    if (dept === 'CS') {
      return rollNum.startsWith('D') && numericPart >= 234101 && numericPart <= 234160;
    } else if (dept === 'IT') {
      return rollNum.startsWith('D') && numericPart >= 235101 && numericPart <= 235130;
    }
    return false;
  };

  const addStudent = async () => {
    if (!newStudent.roll_number || !newStudent.name || !newStudent.email || !newStudent.department) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (!validateRollNumber(newStudent.roll_number, newStudent.department)) {
      const range = newStudent.department === 'CS' ? 'D234101 to D234160' : 'D235101 to D235130';
      toast({
        title: "Invalid Roll Number",
        description: `${newStudent.department} department roll numbers should be in range ${range}`,
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('Adding new managed student:', newStudent);
      
      // Check if roll number already exists
      const { data: existingStudent, error: checkError } = await supabase
        .from('admin_managed_students')
        .select('roll_number')
        .eq('roll_number', newStudent.roll_number)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      if (existingStudent) {
        toast({
          title: "Error",
          description: "A student with this roll number already exists",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('admin_managed_students')
        .insert({
          roll_number: newStudent.roll_number,
          name: newStudent.name,
          email: newStudent.email,
          phone_number: newStudent.phone_number,
          department: newStudent.department
        });

      if (error) {
        console.error('Error adding managed student:', error);
        throw error;
      }

      console.log('Managed student added successfully');
      toast({
        title: "Success",
        description: "Student added successfully",
      });

      setNewStudent({
        roll_number: "",
        name: "",
        email: "",
        phone_number: "",
        department: ""
      });
      setIsAddDialogOpen(false);
      loadManagedStudents();
    } catch (error: any) {
      console.error('Error adding managed student:', error);
      toast({
        title: "Error",
        description: "Failed to add student: " + error.message,
        variant: "destructive",
      });
    }
  };

  const updateStudent = async (student: ManagedStudent) => {
    if (!validateRollNumber(student.roll_number, student.department)) {
      const range = student.department === 'CS' ? 'D234101 to D234160' : 'D235101 to D235130';
      toast({
        title: "Invalid Roll Number",
        description: `${student.department} department roll numbers should be in range ${range}`,
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('Updating managed student:', student.id);
      
      const { error } = await supabase
        .from('admin_managed_students')
        .update({
          name: student.name,
          email: student.email,
          phone_number: student.phone_number,
          department: student.department,
          updated_at: new Date().toISOString()
        })
        .eq('id', student.id);

      if (error) {
        console.error('Error updating managed student:', error);
        throw error;
      }

      console.log('Managed student updated successfully');
      toast({
        title: "Success",
        description: "Student updated successfully",
      });

      setEditingStudent(null);
      loadManagedStudents();
    } catch (error: any) {
      console.error('Error updating managed student:', error);
      toast({
        title: "Error",
        description: "Failed to update student: " + error.message,
        variant: "destructive",
      });
    }
  };

  const deleteStudent = async (studentId: string) => {
    if (!confirm('Are you sure you want to delete this student?')) {
      return;
    }

    try {
      console.log('Deleting managed student:', studentId);
      
      const { error } = await supabase
        .from('admin_managed_students')
        .delete()
        .eq('id', studentId);

      if (error) {
        console.error('Error deleting managed student:', error);
        throw error;
      }

      console.log('Managed student deleted successfully');
      toast({
        title: "Success",
        description: "Student deleted successfully",
      });

      loadManagedStudents();
    } catch (error: any) {
      console.error('Error deleting managed student:', error);
      toast({
        title: "Error",
        description: "Failed to delete student: " + error.message,
        variant: "destructive",
      });
    }
  };

  const filteredStudents = students.filter(student =>
    student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.roll_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.department?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading students...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900">Student Management ({students.length})</h2>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-500 hover:bg-blue-600 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Add Student
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Student</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="department">Department</Label>
                <Select value={newStudent.department} onValueChange={(value) => setNewStudent(prev => ({ ...prev, department: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CS">Computer Science (CS)</SelectItem>
                    <SelectItem value="IT">Information Technology (IT)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="roll_number">Roll Number</Label>
                <Input
                  id="roll_number"
                  value={newStudent.roll_number}
                  onChange={(e) => setNewStudent(prev => ({ ...prev, roll_number: e.target.value.toUpperCase() }))}
                  placeholder="e.g., D234101"
                />
                <p className="text-sm text-gray-500 mt-1">
                  {newStudent.department === 'CS' && 'CS: D234101 - D234160'}
                  {newStudent.department === 'IT' && 'IT: D235101 - D235130'}
                </p>
              </div>
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={newStudent.name}
                  onChange={(e) => setNewStudent(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Student name"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newStudent.email}
                  onChange={(e) => setNewStudent(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="student@example.com"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={newStudent.phone_number}
                  onChange={(e) => setNewStudent(prev => ({ ...prev, phone_number: e.target.value }))}
                  placeholder="Phone number"
                />
              </div>
              <Button onClick={addStudent} className="w-full">
                Add Student
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        <Input
          placeholder="Search students by name, roll number, email, or department"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 h-12 rounded-xl border-gray-200 bg-gray-100"
        />
      </div>

      {/* Students Table */}
      <Card className="rounded-xl border-gray-200">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Roll Number</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Added</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <User className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">No students found</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredStudents.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">{student.roll_number}</TableCell>
                    <TableCell>
                      {editingStudent?.id === student.id ? (
                        <Input
                          value={editingStudent.name}
                          onChange={(e) => setEditingStudent(prev => prev ? { ...prev, name: e.target.value } : null)}
                          className="h-8"
                        />
                      ) : (
                        student.name
                      )}
                    </TableCell>
                    <TableCell>
                      {editingStudent?.id === student.id ? (
                        <Input
                          value={editingStudent.email}
                          onChange={(e) => setEditingStudent(prev => prev ? { ...prev, email: e.target.value } : null)}
                          className="h-8"
                        />
                      ) : (
                        student.email
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
                      {editingStudent?.id === student.id ? (
                        <Select 
                          value={editingStudent.department} 
                          onValueChange={(value) => setEditingStudent(prev => prev ? { ...prev, department: value } : null)}
                        >
                          <SelectTrigger className="h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="CS">CS</SelectItem>
                            <SelectItem value="IT">IT</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        student.department
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
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentManagement;
