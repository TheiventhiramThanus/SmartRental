import { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Plus, Printer, DollarSign, Users, TrendingUp, Calendar, Loader2 } from 'lucide-react';
import { formatCurrency } from '../ui/utils';
import { getDocuments, addDocument, updateDocument } from '../../firebase';

interface StaffMember {
  id: string;
  name: string;
  email: string;
  position: string;
  baseSalary: number;
  hourlyRate: number;
  hoursWorked: number;
  bonus: number;
  deductions: number;
  status: string;
  joinDate: string;
}

export function StaffSalaryPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [staff, setStaff] = useState<StaffMember[]>([]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [selectedMonth, setSelectedMonth] = useState('2025-01');
  const salarySlipRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    position: 'Staff Member',
    baseSalary: 750000,
    hourlyRate: 6000,
    status: 'Active'
  });

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      setIsLoading(true);
      const data = await getDocuments('staff');
      setStaff(data as StaffMember[]);
    } catch (error) {
      console.error('Error fetching staff:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateTotalSalary = (member: StaffMember) => {
    const overtimeHours = Math.max(0, (member.hoursWorked || 0) - 160);
    const overtimePay = overtimeHours * (member.hourlyRate || 0) * 1.5;
    const regularPay = Math.min((member.hoursWorked || 0), 160) * (member.hourlyRate || 0);
    return (member.baseSalary || 0) + regularPay + overtimePay + (member.bonus || 0) - (member.deductions || 0);
  };

  const handleAddStaff = async () => {
    try {
      const newStaff = {
        ...formData,
        hoursWorked: 0,
        bonus: 0,
        deductions: 0,
        joinDate: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString()
      };

      const created = await addDocument('staff', newStaff);
      setStaff([...staff, { id: created.id, ...newStaff } as StaffMember]);

      setShowAddModal(false);
      resetForm();
      alert('Staff member added successfully!');
    } catch (error) {
      console.error('Error adding staff:', error);
      alert('Failed to add staff member');
    }
  };

  const updateStaffData = async (staffId: string, updates: Partial<StaffMember>) => {
    try {
      await updateDocument('staff', staffId, updates);
      setStaff(staff.map(s => s.id === staffId ? { ...s, ...updates } : s));
    } catch (error) {
      console.error('Error updating staff:', error);
    }
  };

  const handlePrintSalarySlip = (member: StaffMember) => {
    setSelectedStaff(member);
    setTimeout(() => {
      const printContent = salarySlipRef.current;
      if (printContent) {
        const printWindow = window.open('', '', 'height=600,width=800');
        if (printWindow) {
          printWindow.document.write('<html><head><title>Salary Slip</title>');
          printWindow.document.write('<style>');
          printWindow.document.write('body { font-family: Arial, sans-serif; padding: 20px; }');
          printWindow.document.write('.slip { max-width: 700px; margin: 0 auto; border: 2px solid #000; padding: 20px; }');
          printWindow.document.write('.header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px; }');
          printWindow.document.write('.company-name { font-size: 24px; font-weight: bold; color: #ef4444; }');
          printWindow.document.write('.row { display: flex; justify-content: space-between; margin: 10px 0; padding: 8px; border-bottom: 1px solid #ddd; }');
          printWindow.document.write('.label { font-weight: bold; }');
          printWindow.document.write('.section { margin: 20px 0; padding: 10px; background: #f5f5f5; }');
          printWindow.document.write('.total { font-size: 20px; font-weight: bold; border-top: 2px solid #000; padding-top: 10px; margin-top: 20px; background: #ef4444; color: white; padding: 15px; }');
          printWindow.document.write('</style></head><body>');
          printWindow.document.write(printContent.innerHTML);
          printWindow.document.write('</body></html>');
          printWindow.document.close();
          printWindow.print();
        }
      }
    }, 100);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      position: 'Staff Member',
      baseSalary: 750000,
      hourlyRate: 6000,
      status: 'Active'
    });
  };

  const getTotalPayroll = () => staff.reduce((sum, member) => sum + calculateTotalSalary(member), 0);
  const getAverageSalary = () => staff.length > 0 ? getTotalPayroll() / staff.length : 0;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="h-12 w-12 text-red-600 animate-spin mb-4" />
        <p className="text-muted-foreground">Loading staff records...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-red-600">Staff Salary Management</h2>
        <Button
          className="bg-red-600 hover:bg-red-700 text-white"
          onClick={() => setShowAddModal(true)}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Staff
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Staff</p>
                <p className="text-2xl font-bold">{staff.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Payroll</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(getTotalPayroll())}</p>
              </div>
              <DollarSign className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Average Salary</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(getAverageSalary())}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Staff</p>
                <p className="text-2xl font-bold text-purple-600">
                  {staff.filter(s => s.status === 'Active').length}
                </p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Month Selector */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <Label className="whitespace-nowrap">Select Month:</Label>
            <Input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="max-w-xs"
            />
          </div>
        </CardContent>
      </Card>

      {/* Staff List */}
      <div className="space-y-4">
        {staff.map((member) => {
          const totalSalary = calculateTotalSalary(member);
          const overtimeHours = Math.max(0, (member.hoursWorked || 0) - 160);

          return (
            <Card key={member.id} className="border-2">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Staff Info */}
                  <div className="flex-1 space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-lg">{member.name}</h3>
                        <p className="text-sm text-muted-foreground">{member.id}</p>
                        <p className="text-sm text-muted-foreground">{member.email}</p>
                      </div>
                      <Badge className={member.status === 'Active' ? 'bg-green-500' : 'bg-gray-500'}>
                        {member.status}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Position</p>
                        <p className="font-medium">{member.position}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Base Salary</p>
                        <p className="font-bold text-blue-600">{formatCurrency(member.baseSalary)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Hourly Rate</p>
                        <p className="font-medium">{formatCurrency(member.hourlyRate)}/hr</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Hours Worked</p>
                        <p className="font-medium">{member.hoursWorked}h</p>
                      </div>
                    </div>

                    {/* Salary Breakdown */}
                    <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Base Salary:</span>
                        <span className="font-medium">{formatCurrency(member.baseSalary)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Regular Hours (160h × {formatCurrency(member.hourlyRate)}):</span>
                        <span className="font-medium">{formatCurrency(Math.min((member.hoursWorked || 0), 160) * (member.hourlyRate || 0))}</span>
                      </div>
                      {overtimeHours > 0 && (
                        <div className="flex justify-between text-sm">
                          <span>Overtime ({overtimeHours}h × {formatCurrency(member.hourlyRate)} × 1.5):</span>
                          <span className="font-medium text-blue-600">{formatCurrency(overtimeHours * (member.hourlyRate || 0) * 1.5)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm">
                        <span>Bonus:</span>
                        <span className="font-medium text-green-600">+{formatCurrency(member.bonus)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Deductions:</span>
                        <span className="font-medium text-red-600">-{formatCurrency(member.deductions)}</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t-2 border-gray-300">
                        <span className="font-bold">Total Salary:</span>
                        <span className="font-bold text-xl text-red-600">{formatCurrency(totalSalary)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 lg:w-48">
                    <Button
                      className="w-full bg-red-600 hover:bg-red-700 text-white"
                      onClick={() => handlePrintSalarySlip(member)}
                    >
                      <Printer className="h-4 w-4 mr-2" />
                      Print Slip
                    </Button>

                    <div className="space-y-2 pt-2 border-t">
                      <Label className="text-xs">Update Hours</Label>
                      <Input
                        type="number"
                        placeholder="Hours"
                        defaultValue={member.hoursWorked}
                        onBlur={(e) => {
                          const hours = parseInt(e.target.value) || 0;
                          updateStaffData(member.id, { hoursWorked: hours });
                        }}
                      />

                      <Label className="text-xs">Bonus</Label>
                      <Input
                        type="number"
                        placeholder="Bonus"
                        defaultValue={member.bonus}
                        onBlur={(e) => {
                          const bonus = parseInt(e.target.value) || 0;
                          updateStaffData(member.id, { bonus });
                        }}
                      />

                      <Label className="text-xs">Deductions</Label>
                      <Input
                        type="number"
                        placeholder="Deductions"
                        defaultValue={member.deductions}
                        onBlur={(e) => {
                          const deductions = parseInt(e.target.value) || 0;
                          updateStaffData(member.id, { deductions });
                        }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Add Staff Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold mb-4">Add New Staff Member</h3>

              <div className="space-y-4">
                <div>
                  <Label>Full Name</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="john@smartrental.com"
                  />
                </div>

                <div>
                  <Label>Position</Label>
                  <Select value={formData.position} onValueChange={(value: string) => setFormData({ ...formData, position: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Staff Member">Staff Member</SelectItem>
                      <SelectItem value="Senior Staff">Senior Staff</SelectItem>
                      <SelectItem value="Manager">Manager</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Base Salary (LKR)</Label>
                    <Input
                      type="number"
                      value={formData.baseSalary}
                      onChange={(e) => setFormData({ ...formData, baseSalary: parseFloat(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label>Hourly Rate (LKR)</Label>
                    <Input
                      type="number"
                      value={formData.hourlyRate}
                      onChange={(e) => setFormData({ ...formData, hourlyRate: parseFloat(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                    onClick={handleAddStaff}
                  >
                    Add Staff
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setShowAddModal(false);
                      resetForm();
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Hidden Salary Slip Template for Printing */}
      <div style={{ display: 'none' }}>
        <div ref={salarySlipRef}>
          {selectedStaff && (
            <div className="slip">
              <div className="header">
                <div className="company-name">SmartRentalGPS</div>
                <p>IoT Vehicle Rental System</p>
                <p>123 Main Street, City, State 12345</p>
                <p>Phone: (555) 000-0000 | Email: hr@smartrental.com</p>
              </div>

              <h2 style={{ textAlign: 'center', margin: '20px 0' }}>SALARY SLIP</h2>

              <div className="section">
                <div className="row">
                  <span className="label">Employee ID:</span>
                  <span>{selectedStaff.id}</span>
                </div>
                <div className="row">
                  <span className="label">Employee Name:</span>
                  <span>{selectedStaff.name}</span>
                </div>
                <div className="row">
                  <span className="label">Position:</span>
                  <span>{selectedStaff.position}</span>
                </div>
                <div className="row">
                  <span className="label">Month:</span>
                  <span>{selectedMonth}</span>
                </div>
              </div>

              <div className="section">
                <h4 style={{ marginBottom: '10px', fontWeight: 'bold' }}>Earnings</h4>
                <div className="row">
                  <span className="label">Base Salary:</span>
                  <span>{formatCurrency(selectedStaff.baseSalary)}</span>
                </div>
                <div className="row">
                  <span className="label">Hourly Pay ({Math.min(selectedStaff.hoursWorked, 160)}h × {formatCurrency(selectedStaff.hourlyRate)}):</span>
                  <span>{formatCurrency(Math.min(selectedStaff.hoursWorked, 160) * selectedStaff.hourlyRate)}</span>
                </div>
                {(selectedStaff.hoursWorked || 0) > 160 && (
                  <div className="row">
                    <span className="label">Overtime Pay ({(selectedStaff.hoursWorked || 0) - 160}h × {formatCurrency(selectedStaff.hourlyRate)} × 1.5):</span>
                    <span>{formatCurrency(((selectedStaff.hoursWorked || 0) - 160) * selectedStaff.hourlyRate * 1.5)}</span>
                  </div>
                )}
                <div className="row">
                  <span className="label">Bonus:</span>
                  <span>{formatCurrency(selectedStaff.bonus)}</span>
                </div>
              </div>

              <div className="section">
                <h4 style={{ marginBottom: '10px', fontWeight: 'bold' }}>Deductions</h4>
                <div className="row">
                  <span className="label">Total Deductions:</span>
                  <span>{formatCurrency(selectedStaff.deductions)}</span>
                </div>
              </div>

              <div className="total">
                <div className="row" style={{ borderBottom: 'none', color: 'white' }}>
                  <span className="label">NET SALARY:</span>
                  <span style={{ fontSize: '24px' }}>{formatCurrency(calculateTotalSalary(selectedStaff))}</span>
                </div>
              </div>

              <p style={{ textAlign: 'center', marginTop: '30px', fontSize: '12px' }}>
                This is a computer-generated salary slip.<br />
                For queries, contact HR Department.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
