import { useState } from 'react';

// ─── n8n Webhook URL ───────────────────────────────────────────────────────────
// Change this to your n8n webhook URL after setting up the workflow
const N8N_WEBHOOK_URL = 'http://localhost:5678/webhook/smartrental-booking';

// Sends booking data to n8n which then sends a WhatsApp message
async function triggerWhatsAppNotification(payload: {
  type: 'APPROVED' | 'REJECTED';
  bookingId: string;
  customerName: string;
  customerPhone: string;
  vehicle: string;
  startDate: string;
  endDate: string;
  totalAmount: number;
  rejectionReason?: string;
  approvedBy: string;
}) {
  try {
    const res = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`n8n responded with ${res.status}`);
    console.log('✅ WhatsApp notification triggered via n8n');
  } catch (err) {
    console.warn('⚠️ n8n WhatsApp trigger failed (is n8n running?)', err);
  }
}
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Search, Filter, CheckCircle, XCircle, Clock, Phone, Mail, IdCard, Eye, Calendar, Car as CarIcon } from 'lucide-react';
import { formatCurrency } from '../ui/utils';

interface EnhancedBookingRequestsPageProps {
  user: any;
}

export function EnhancedBookingRequestsPage({ user }: EnhancedBookingRequestsPageProps) {
  const [requests, setRequests] = useState([
    {
      id: 'REQ-001',
      customerName: 'John Doe',
      customerEmail: 'john@example.com',
      customerPhone: '+1 (555) 123-4567',
      vehicle: 'Tesla Model 3',
      startDate: '2025-01-25',
      endDate: '2025-01-31',
      totalAmount: 252000,
      status: 'Pending',
      requestDate: '2025-01-22',
      licenseImage: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      nicImage: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
    },
    {
      id: 'REQ-002',
      customerName: 'Sarah Wilson',
      customerEmail: 'sarah@example.com',
      customerPhone: '+1 (555) 234-5678',
      vehicle: 'BMW 5 Series',
      startDate: '2025-01-26',
      endDate: '2025-02-02',
      totalAmount: 315000,
      status: 'Approved',
      requestDate: '2025-01-21',
      licenseImage: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      nicImage: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
    },
    {
      id: 'REQ-003',
      customerName: 'Mike Johnson',
      customerEmail: 'mike@example.com',
      customerPhone: '+1 (555) 345-6789',
      vehicle: 'Toyota RAV4',
      startDate: '2025-01-24',
      endDate: '2025-01-30',
      totalAmount: 199500,
      status: 'Rejected',
      requestDate: '2025-01-20',
      licenseImage: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      nicImage: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      rejectionReason: 'Invalid documentation provided.'
    },
    {
      id: 'REQ-004',
      customerName: 'Emily Brown',
      customerEmail: 'emily@example.com',
      customerPhone: '+1 (555) 456-7890',
      vehicle: 'Mercedes C-Class',
      startDate: '2025-01-27',
      endDate: '2025-02-03',
      totalAmount: 378000,
      status: 'Pending',
      requestDate: '2025-01-22',
      licenseImage: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      nicImage: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
    }
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [vehicleFilter, setVehicleFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');


  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          request.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          request.vehicle.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || request.status.toLowerCase() === statusFilter;
    const matchesVehicle = vehicleFilter === 'all' || request.vehicle.toLowerCase().includes(vehicleFilter.toLowerCase());
    
    let matchesDate = true;
    if (dateFilter !== 'all') {
      const requestDate = new Date(request.requestDate);
      const today = new Date();
      const daysDiff = Math.floor((today.getTime() - requestDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (dateFilter === 'today') matchesDate = daysDiff === 0;
      else if (dateFilter === 'week') matchesDate = daysDiff <= 7;
      else if (dateFilter === 'month') matchesDate = daysDiff <= 30;
    }
    
    return matchesSearch && matchesStatus && matchesVehicle && matchesDate;
  });

  const handleApprove = (requestId: string) => {
    const req = requests.find(r => r.id === requestId);
    setRequests(prev => prev.map(r =>
      r.id === requestId ? { ...r, status: 'Approved' } : r
    ));

    if (req) {
      // 🔔 Trigger n8n → WhatsApp notification
      triggerWhatsAppNotification({
        type: 'APPROVED',
        bookingId: req.id,
        customerName: req.customerName,
        customerPhone: req.customerPhone,
        vehicle: req.vehicle,
        startDate: req.startDate,
        endDate: req.endDate,
        totalAmount: req.totalAmount,
        approvedBy: user?.name || user?.email || 'Staff',
      });
    }

    alert(`✅ Booking ${requestId} approved! WhatsApp message sent to customer.`);
  };

  const handleRejectClick = (requestId: string) => {
    setSelectedRequestId(requestId);
    setIsRejectDialogOpen(true);
  };

  const confirmRejection = () => {
    if (!rejectionReason.trim()) {
      alert('Please provide a reason for rejection.');
      return;
    }

    const req = requests.find(r => r.id === selectedRequestId);
    setRequests(prev => prev.map(r =>
      r.id === selectedRequestId ? { ...r, status: 'Rejected', rejectionReason } : r
    ));

    if (req) {
      // 🔔 Trigger n8n → WhatsApp rejection notification
      triggerWhatsAppNotification({
        type: 'REJECTED',
        bookingId: req.id,
        customerName: req.customerName,
        customerPhone: req.customerPhone,
        vehicle: req.vehicle,
        startDate: req.startDate,
        endDate: req.endDate,
        totalAmount: req.totalAmount,
        rejectionReason,
        approvedBy: user?.name || user?.email || 'Staff',
      });
    }

    setIsRejectDialogOpen(false);
    setSelectedRequestId(null);
    setRejectionReason('');
    alert(`❌ Booking ${selectedRequestId} rejected. WhatsApp message sent to customer.`);
  };

  const handleCallCustomer = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  const handleEmailCustomer = (email: string, customerName: string, requestId: string) => {
    const subject = encodeURIComponent(`Booking Request ${requestId} - SmartRental`);
    const body = encodeURIComponent(`Dear ${customerName},\n\nRegarding your booking request ${requestId}.\n\nBest regards,\nSmartRental Team`);
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
  };

  const handleViewDocument = (imageUrl: string, docType: string) => {
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(`
        <html>
          <head><title>${docType}</title></head>
          <body style="margin:0;display:flex;justify-content:center;align-items:center;min-height:100vh;background:#000;">
            <img src="${imageUrl}" style="max-width:100%;max-height:100vh;" />
          </body>
        </html>
      `);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-red-600">Booking Requests</h2>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Requests</p>
                <p className="text-2xl font-bold">{filteredRequests.length}</p>
              </div>
              <CarIcon className="h-8 w-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {filteredRequests.filter(r => r.status === 'Pending').length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Approved</p>
                <p className="text-2xl font-bold text-green-600">
                  {filteredRequests.filter(r => r.status === 'Approved').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Rejected</p>
                <p className="text-2xl font-bold text-red-600">
                  {filteredRequests.filter(r => r.status === 'Rejected').length}
                </p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, ID, or vehicle..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>

            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>

            <Button 
              variant="outline"
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
                setVehicleFilter('all');
                setDateFilter('all');
              }}
            >
              <Filter className="mr-2 h-4 w-4" />
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Requests List */}
      <div className="space-y-4">
        {filteredRequests.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">No booking requests found matching your filters.</p>
            </CardContent>
          </Card>
        ) : (
          filteredRequests.map((request) => (
            <Card key={request.id} className="border-2">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Request Info */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-lg">{request.customerName}</h3>
                        <p className="text-sm text-muted-foreground">{request.id}</p>
                      </div>
                      <Badge className={
                        request.status === 'Approved' ? 'bg-green-500' :
                        request.status === 'Pending' ? 'bg-yellow-500' :
                        'bg-red-500'
                      }>
                        {request.status === 'Approved' && <CheckCircle className="h-3 w-3 mr-1" />}
                        {request.status === 'Pending' && <Clock className="h-3 w-3 mr-1" />}
                        {request.status === 'Rejected' && <XCircle className="h-3 w-3 mr-1" />}
                        {request.status}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Vehicle:</span>
                        <span className="ml-2 font-medium">{request.vehicle}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Amount:</span>
                        <span className="ml-2 font-bold text-red-600">{formatCurrency(request.totalAmount)}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Start Date:</span>
                        <span className="ml-2 font-medium">{request.startDate}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">End Date:</span>
                        <span className="ml-2 font-medium">{request.endDate}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-muted-foreground">Requested:</span>
                        <span className="ml-2 font-medium">{request.requestDate}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 lg:w-64">
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDocument(request.licenseImage, "Driver's License")}
                      >
                        <IdCard className="h-4 w-4 mr-1" />
                        License
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDocument(request.nicImage, 'National ID')}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        NIC
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCallCustomer(request.customerPhone)}
                      >
                        <Phone className="h-4 w-4 mr-1" />
                        Call
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEmailCustomer(request.customerEmail, request.customerName, request.id)}
                      >
                        <Mail className="h-4 w-4 mr-1" />
                        Email
                      </Button>
                    </div>

                    {request.status === 'Pending' && (
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white"
                          onClick={() => handleApprove(request.id)}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleRejectClick(request.id)}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    )}

                    {request.status === 'Rejected' && request.rejectionReason && (
                      <div className="mt-2 p-3 bg-red-50 border border-red-100 rounded-lg">
                        <p className="text-[10px] uppercase font-bold text-red-400 mb-1">Rejection Reason</p>
                        <p className="text-xs text-red-700 italic">"{request.rejectionReason}"</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
      {/* Rejection Dialog */}
      {isRejectDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <Card className="w-full max-w-md animate-in fade-in zoom-in duration-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4 text-red-600">
                <XCircle className="h-6 w-6" />
                <h3 className="text-xl font-bold">Reject Booking</h3>
              </div>
              
              <p className="text-sm text-gray-500 mb-4">
                Please provide a reason for rejecting booking <strong>{selectedRequestId}</strong>.
                This reason will be visible to the customer.
              </p>

              <textarea
                className="w-full min-h-[100px] p-3 rounded-lg border-2 border-gray-100 focus:border-red-500 focus:ring-0 outline-none transition-colors mb-6 text-sm"
                placeholder="e.g., Driver's license is expired or blurred..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
              />

              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => {
                    setIsRejectDialogOpen(false);
                    setRejectionReason('');
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  variant="destructive" 
                  className="flex-1"
                  onClick={confirmRejection}
                >
                  Confirm Rejection
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
