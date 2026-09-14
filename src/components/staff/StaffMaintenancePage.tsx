import { useState } from 'react';
import { Wrench, AlertTriangle, Plus } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface StaffMaintenancePageProps {
  user: any;
}

export function StaffMaintenancePage({ user }: StaffMaintenancePageProps) {
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportData, setReportData] = useState({
    vehicle: '',
    issueType: '',
    description: '',
    severity: ''
  });

  const vehicles = [
    { id: 'ABC-1234', name: 'Tesla Model 3', status: 'Available' },
    { id: 'XYZ-5678', name: 'BMW 5 Series', status: 'In Use' },
    { id: 'LMN-9012', name: 'Toyota RAV4', status: 'Maintenance' },
  ];

  const maintenanceTickets = [
    {
      id: '1',
      vehicle: 'Toyota RAV4',
      plateNumber: 'LMN-9012',
      issue: 'Engine Warning Light',
      reportedBy: 'Jane Staff',
      date: '2026-01-20',
      status: 'In Progress',
      severity: 'High'
    },
    {
      id: '2',
      vehicle: 'Honda Accord',
      plateNumber: 'PQR-3456',
      issue: 'Brake Noise',
      reportedBy: 'John Staff',
      date: '2026-01-18',
      status: 'Pending',
      severity: 'Medium'
    }
  ];

  const handleSubmitReport = () => {
    if (!reportData.vehicle || !reportData.issueType || !reportData.description || !reportData.severity) {
      alert('Please fill in all fields');
      return;
    }

    alert('Maintenance report submitted successfully!');
    setShowReportForm(false);
    setReportData({
      vehicle: '',
      issueType: '',
      description: '',
      severity: ''
    });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'High':
        return 'bg-red-500';
      case 'Medium':
        return 'bg-yellow-500';
      case 'Low':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2>Maintenance Requests</h2>
        <Button 
          className="bg-accent hover:bg-accent/90"
          onClick={() => setShowReportForm(!showReportForm)}
        >
          <Plus className="mr-2 h-4 w-4" />
          Report Issue
        </Button>
      </div>

      {/* Report Form */}
      {showReportForm && (
        <Card className="border-accent">
          <CardContent className="p-6">
            <h3 className="mb-4">Report Vehicle Issue</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Vehicle</label>
                <Select value={reportData.vehicle} onValueChange={(value) => setReportData({ ...reportData, vehicle: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose vehicle..." />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicles.map((vehicle) => (
                      <SelectItem key={vehicle.id} value={vehicle.id}>
                        {vehicle.name} ({vehicle.id})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Issue Type</label>
                <Select value={reportData.issueType} onValueChange={(value) => setReportData({ ...reportData, issueType: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select issue..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Engine">Engine Issue</SelectItem>
                    <SelectItem value="Brake">Brake Problem</SelectItem>
                    <SelectItem value="Tire">Tire Issue</SelectItem>
                    <SelectItem value="Electrical">Electrical Problem</SelectItem>
                    <SelectItem value="Body">Body Damage</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Severity</label>
                <Select value={reportData.severity} onValueChange={(value) => setReportData({ ...reportData, severity: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select severity..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="High">High - Unsafe to drive</SelectItem>
                    <SelectItem value="Medium">Medium - Needs attention</SelectItem>
                    <SelectItem value="Low">Low - Minor issue</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  placeholder="Describe the issue in detail..."
                  value={reportData.description}
                  onChange={(e) => setReportData({ ...reportData, description: e.target.value })}
                  rows={4}
                />
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <Button 
                className="bg-green-500 hover:bg-green-600"
                onClick={handleSubmitReport}
              >
                Submit Report
              </Button>
              <Button variant="outline" onClick={() => setShowReportForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Maintenance Tickets */}
      <div className="space-y-4">
        <h3>Active Maintenance Tickets</h3>
        {maintenanceTickets.map((ticket) => (
          <Card key={ticket.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="mb-1">{ticket.vehicle} - {ticket.plateNumber}</h4>
                  <p className="text-sm text-muted-foreground mb-2">{ticket.issue}</p>
                  <div className="flex gap-2">
                    <Badge className={getSeverityColor(ticket.severity)}>
                      {ticket.severity}
                    </Badge>
                    <Badge variant="outline">{ticket.status}</Badge>
                  </div>
                </div>
                <div className="text-right text-sm text-muted-foreground">
                  <p>Reported by: {ticket.reportedBy}</p>
                  <p>{ticket.date}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Vehicle Status */}
      <Card>
        <CardContent className="p-6">
          <h3 className="mb-4">Vehicle Status Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {vehicles.map((vehicle) => (
              <div key={vehicle.id} className="p-4 border rounded-lg">
                <h4 className="mb-1">{vehicle.name}</h4>
                <p className="text-sm text-muted-foreground mb-2">{vehicle.id}</p>
                <Badge className={
                  vehicle.status === 'Available' ? 'bg-green-500' :
                  vehicle.status === 'In Use' ? 'bg-blue-500' : 'bg-yellow-500'
                }>
                  {vehicle.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
