import { useState, useRef } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Banknote, Printer, Search, Filter, FileText, Phone, Mail, IdCard, Eye, CheckCircle, Clock, XCircle } from 'lucide-react';

interface EnhancedStaffPaymentsPageProps {
  user: any;
}

export function EnhancedStaffPaymentsPage({ user }: EnhancedStaffPaymentsPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const receiptRef = useRef<HTMLDivElement>(null);

  // Mock payments data (in real app, fetch from backend)
  const allPayments = [
    {
      id: 'PAY-001',
      bookingId: 'BOOK-001',
      customerName: 'John Doe',
      customerEmail: 'john@example.com',
      customerPhone: '+1 (555) 123-4567',
      vehicle: 'Tesla Model 3',
      amount: 252000,
      paymentMethod: 'Cash',
      paymentStatus: 'Paid',
      paymentDate: '2025-01-20',
      licenseImage: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      nicImage: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
    },
    {
      id: 'PAY-002',
      bookingId: 'BOOK-002',
      customerName: 'Sarah Wilson',
      customerEmail: 'sarah@example.com',
      customerPhone: '+1 (555) 234-5678',
      vehicle: 'BMW 5 Series',
      amount: 315000,
      paymentMethod: 'Card',
      paymentStatus: 'Paid',
      paymentDate: '2025-01-21',
      licenseImage: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      nicImage: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
    },
    {
      id: 'PAY-003',
      bookingId: 'BOOK-003',
      customerName: 'Mike Johnson',
      customerEmail: 'mike@example.com',
      customerPhone: '+1 (555) 345-6789',
      vehicle: 'Toyota RAV4',
      amount: 199500,
      paymentMethod: 'Cash',
      paymentStatus: 'Pending',
      paymentDate: '2025-01-22',
      licenseImage: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      nicImage: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
    }
  ];

  const filteredPayments = allPayments.filter(payment => {
    const matchesSearch = payment.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          payment.bookingId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPayment = paymentFilter === 'all' || payment.paymentMethod.toLowerCase() === paymentFilter;
    const matchesStatus = statusFilter === 'all' || payment.paymentStatus.toLowerCase() === statusFilter;
    return matchesSearch && matchesPayment && matchesStatus;
  });

  const handlePrintReceipt = (payment: any) => {
    setSelectedPayment(payment);
    setTimeout(() => {
      const printContent = receiptRef.current;
      if (printContent) {
        const printWindow = window.open('', '', 'height=600,width=800');
        if (printWindow) {
          printWindow.document.write('<html><head><title>Payment Receipt</title>');
          printWindow.document.write('<style>');
          printWindow.document.write('body { font-family: Arial, sans-serif; padding: 20px; }');
          printWindow.document.write('.receipt { max-width: 600px; margin: 0 auto; border: 2px solid #000; padding: 20px; }');
          printWindow.document.write('.header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px; }');
          printWindow.document.write('.company-name { font-size: 24px; font-weight: bold; color: #ef4444; }');
          printWindow.document.write('.row { display: flex; justify-content: space-between; margin: 10px 0; }');
          printWindow.document.write('.label { font-weight: bold; }');
          printWindow.document.write('.total { font-size: 20px; font-weight: bold; border-top: 2px solid #000; padding-top: 10px; margin-top: 20px; }');
          printWindow.document.write('</style></head><body>');
          printWindow.document.write(printContent.innerHTML);
          printWindow.document.write('</body></html>');
          printWindow.document.close();
          printWindow.print();
        }
      }
    }, 100);
  };

  const handleCallCustomer = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  const handleEmailCustomer = (email: string, customerName: string, bookingId: string) => {
    const subject = encodeURIComponent(`Booking ${bookingId} - SmartRental`);
    const body = encodeURIComponent(`Dear ${customerName},\n\nThank you for choosing SmartRental.\n\nBooking ID: ${bookingId}\n\nBest regards,\nSmartRental Team`);
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

  const getTotalPayments = () => filteredPayments.reduce((sum, p) => sum + p.amount, 0);
  const getCashPayments = () => filteredPayments.filter(p => p.paymentMethod === 'Cash').reduce((sum, p) => sum + p.amount, 0);
  const getCardPayments = () => filteredPayments.filter(p => p.paymentMethod === 'Card').reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6">
      <h2 className="text-red-600">Payment Management</h2>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Payments</p>
                <p className="text-2xl font-bold text-red-600">LKR {getTotalPayments().toLocaleString()}</p>
              </div>
              <Banknote className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Cash Payments</p>
                <p className="text-2xl font-bold">LKR {getCashPayments().toLocaleString()}</p>
              </div>
              <Banknote className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Card Payments</p>
                <p className="text-2xl font-bold">LKR {getCardPayments().toLocaleString()}</p>
              </div>
              <Banknote className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Transactions</p>
                <p className="text-2xl font-bold">{filteredPayments.length}</p>
              </div>
              <FileText className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or booking ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={paymentFilter} onValueChange={setPaymentFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Payment Method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Methods</SelectItem>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="card">Card</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Payment Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>

            <Button 
              variant="outline"
              onClick={() => {
                setSearchQuery('');
                setPaymentFilter('all');
                setStatusFilter('all');
              }}
            >
              <Filter className="mr-2 h-4 w-4" />
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Payments List */}
      <div className="space-y-4">
        {filteredPayments.map((payment) => (
          <Card key={payment.id} className="border-2">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Payment Info */}
                <div className="flex-1 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-lg">{payment.customerName}</h3>
                      <p className="text-sm text-muted-foreground">{payment.bookingId}</p>
                    </div>
                    <Badge className={
                      payment.paymentStatus === 'Paid' ? 'bg-green-500' :
                      payment.paymentStatus === 'Pending' ? 'bg-yellow-500' :
                      'bg-red-500'
                    }>
                      {payment.paymentStatus === 'Paid' && <CheckCircle className="h-3 w-3 mr-1" />}
                      {payment.paymentStatus === 'Pending' && <Clock className="h-3 w-3 mr-1" />}
                      {payment.paymentStatus === 'Failed' && <XCircle className="h-3 w-3 mr-1" />}
                      {payment.paymentStatus}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Vehicle:</span>
                      <span className="ml-2 font-medium">{payment.vehicle}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Method:</span>
                      <span className="ml-2 font-medium">{payment.paymentMethod}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Amount:</span>
                      <span className="ml-2 font-bold text-red-600">LKR {payment.amount.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Date:</span>
                      <span className="ml-2 font-medium">{payment.paymentDate}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 lg:w-64">
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDocument(payment.licenseImage, "Driver's License")}
                    >
                      <IdCard className="h-4 w-4 mr-1" />
                      License
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDocument(payment.nicImage, 'National ID')}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      NIC
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCallCustomer(payment.customerPhone)}
                    >
                      <Phone className="h-4 w-4 mr-1" />
                      Call
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEmailCustomer(payment.customerEmail, payment.customerName, payment.bookingId)}
                    >
                      <Mail className="h-4 w-4 mr-1" />
                      Email
                    </Button>
                  </div>

                  <Button
                    className="w-full bg-red-600 hover:bg-red-700 text-white"
                    onClick={() => handlePrintReceipt(payment)}
                  >
                    <Printer className="h-4 w-4 mr-2" />
                    Print Receipt
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Hidden Receipt Template for Printing */}
      <div style={{ display: 'none' }}>
        <div ref={receiptRef}>
          {selectedPayment && (
            <div className="receipt">
              <div className="header">
                <div className="company-name">SmartRental</div>
                <p>IoT Vehicle Rental System</p>
                <p>123 Main Street, City, State 12345</p>
                <p>Phone: (555) 000-0000 | Email: info@smartrental.com</p>
              </div>

              <h2 style={{ textAlign: 'center', margin: '20px 0' }}>PAYMENT RECEIPT</h2>

              <div className="row">
                <span className="label">Receipt No:</span>
                <span>{selectedPayment.id}</span>
              </div>
              <div className="row">
                <span className="label">Booking ID:</span>
                <span>{selectedPayment.bookingId}</span>
              </div>
              <div className="row">
                <span className="label">Date:</span>
                <span>{selectedPayment.paymentDate}</span>
              </div>

              <hr style={{ margin: '20px 0' }} />

              <div className="row">
                <span className="label">Customer Name:</span>
                <span>{selectedPayment.customerName}</span>
              </div>
              <div className="row">
                <span className="label">Email:</span>
                <span>{selectedPayment.customerEmail}</span>
              </div>
              <div className="row">
                <span className="label">Phone:</span>
                <span>{selectedPayment.customerPhone}</span>
              </div>

              <hr style={{ margin: '20px 0' }} />

              <div className="row">
                <span className="label">Vehicle:</span>
                <span>{selectedPayment.vehicle}</span>
              </div>
              <div className="row">
                <span className="label">Payment Method:</span>
                <span>{selectedPayment.paymentMethod}</span>
              </div>
              <div className="row">
                <span className="label">Payment Status:</span>
                <span>{selectedPayment.paymentStatus}</span>
              </div>

              <div className="row total">
                <span className="label">Total Amount:</span>
                <span>LKR {selectedPayment.amount.toLocaleString()}</span>
              </div>

              <p style={{ textAlign: 'center', marginTop: '30px', fontSize: '12px' }}>
                Thank you for choosing SmartRental!<br />
                This is a computer-generated receipt.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
