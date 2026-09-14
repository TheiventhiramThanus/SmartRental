import { useState, useEffect } from 'react';
import { DollarSign, Printer, Download, CheckCircle, Clock, CreditCard, Receipt } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Input } from '../ui/input';

interface EnhancedPaymentsPageProps {
  user: any;
}

export function EnhancedPaymentsPage({ user }: EnhancedPaymentsPageProps) {
  const [payments, setPayments] = useState<any[]>([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterMethod, setFilterMethod] = useState('all');

  useEffect(() => {
    // Get all bookings and create payment records
    const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    const paymentRecords = bookings.map((booking: any) => ({
      id: `PAY-${booking.id}`,
      bookingId: booking.id,
      customerName: booking.customerName,
      customerEmail: booking.customerEmail,
      amount: booking.totalAmount || 0,
      status: booking.paymentStatus || 'Pending',
      method: booking.paymentMethod || 'Cash',
      date: booking.createdAt || new Date().toISOString(),
      vehicle: booking.carName || 'Vehicle'
    }));
    setPayments(paymentRecords);
  }, []);

  const filteredPayments = payments.filter(p => {
    if (filterStatus !== 'all' && p.status !== filterStatus) return false;
    if (filterMethod !== 'all' && p.method !== filterMethod) return false;
    return true;
  });

  const handleProcessPayment = (paymentId: string, method: string) => {
    if (confirm(`Process payment via ${method}?`)) {
      const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
      const updated = bookings.map((b: any) => {
        if (`PAY-${b.id}` === paymentId) {
          return {
            ...b,
            paymentStatus: 'Paid',
            paymentMethod: method,
            paymentDate: new Date().toISOString(),
            processedBy: user.name
          };
        }
        return b;
      });
      localStorage.setItem('bookings', JSON.stringify(updated));
      
      setPayments(prev => prev.map(p => 
        p.id === paymentId 
          ? { ...p, status: 'Paid', method, date: new Date().toISOString() }
          : p
      ));
      
      alert('Payment processed successfully!');
    }
  };

  const generateReceipt = (payment: any) => {
    const receiptWindow = window.open('', '_blank');
    if (receiptWindow) {
      receiptWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Receipt - ${payment.id}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              max-width: 800px;
              margin: 40px auto;
              padding: 20px;
            }
            .header {
              text-align: center;
              border-bottom: 3px solid #ef4444;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .header h1 {
              color: #ef4444;
              margin: 0;
            }
            .receipt-info {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 20px;
              margin-bottom: 30px;
            }
            .section {
              margin-bottom: 20px;
            }
            .section-title {
              font-weight: bold;
              color: #ef4444;
              margin-bottom: 10px;
            }
            .total {
              background: #fee;
              padding: 20px;
              text-align: right;
              font-size: 24px;
              font-weight: bold;
              color: #ef4444;
              margin-top: 30px;
            }
            .footer {
              margin-top: 40px;
              text-align: center;
              color: #666;
              border-top: 1px solid #ddd;
              padding-top: 20px;
            }
            @media print {
              button { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🚗 SmartRental</h1>
            <p>IoT-Powered Vehicle Rental System</p>
          </div>
          
          <div class="section">
            <div class="section-title">PAYMENT RECEIPT</div>
            <p><strong>Receipt #:</strong> ${payment.id}</p>
            <p><strong>Date:</strong> ${new Date(payment.date).toLocaleString()}</p>
            <p><strong>Status:</strong> ${payment.status}</p>
          </div>

          <div class="receipt-info">
            <div class="section">
              <div class="section-title">Customer Information</div>
              <p><strong>Name:</strong> ${payment.customerName}</p>
              <p><strong>Email:</strong> ${payment.customerEmail}</p>
              <p><strong>Booking ID:</strong> ${payment.bookingId}</p>
            </div>

            <div class="section">
              <div class="section-title">Payment Details</div>
              <p><strong>Vehicle:</strong> ${payment.vehicle}</p>
              <p><strong>Payment Method:</strong> ${payment.method}</p>
              <p><strong>Processed By:</strong> ${user.name}</p>
            </div>
          </div>

          <div class="total">
            Total Amount: $${payment.amount.toFixed(2)}
          </div>

          <div class="footer">
            <p>Thank you for choosing SmartRental!</p>
            <p>For support, contact us at support@smartrental.com</p>
            <p style="margin-top: 20px; font-size: 12px;">
              This is a computer-generated receipt. No signature required.
            </p>
          </div>

          <div style="text-align: center; margin-top: 30px;">
            <button onclick="window.print()" style="padding: 10px 30px; background: #ef4444; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 16px;">
              Print Receipt
            </button>
          </div>
        </body>
        </html>
      `);
      receiptWindow.document.close();
    }
  };

  const downloadReceiptPDF = (payment: any) => {
    // Create a receipt content
    const receiptContent = `
SMARTRENTAL - PAYMENT RECEIPT
========================================

Receipt #: ${payment.id}
Date: ${new Date(payment.date).toLocaleString()}
Status: ${payment.status}

CUSTOMER INFORMATION
----------------------------------------
Name: ${payment.customerName}
Email: ${payment.customerEmail}
Booking ID: ${payment.bookingId}

PAYMENT DETAILS
----------------------------------------
Vehicle: ${payment.vehicle}
Payment Method: ${payment.method}
Amount: $${payment.amount.toFixed(2)}
Processed By: ${user.name}

========================================
Thank you for choosing SmartRental!
    `;

    const blob = new Blob([receiptContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `receipt-${payment.id}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const totalRevenue = filteredPayments
    .filter(p => p.status === 'Paid')
    .reduce((sum, p) => sum + p.amount, 0);

  const pendingAmount = filteredPayments
    .filter(p => p.status === 'Pending')
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-red-600">Payments & Receipts</h2>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-2 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <h2 className="mt-2 text-green-600">${totalRevenue.toFixed(2)}</h2>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-yellow-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <h2 className="mt-2 text-yellow-600">${pendingAmount.toFixed(2)}</h2>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Transactions</p>
                <h2 className="mt-2 text-blue-600">{filteredPayments.length}</h2>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Receipt className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Payment Status</label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Paid">Paid</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Payment Method</label>
              <Select value={filterMethod} onValueChange={setFilterMethod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Methods</SelectItem>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="Card">Card</SelectItem>
                  <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payments List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredPayments.map((payment) => (
          <Card key={payment.id} className="border-2 border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-lg font-bold">{payment.customerName}</h3>
                    <Badge className={payment.status === 'Paid' ? 'bg-green-500' : 'bg-yellow-500'}>
                      {payment.status}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Receipt #</p>
                      <p className="font-medium">{payment.id}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Vehicle</p>
                      <p className="font-medium">{payment.vehicle}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Amount</p>
                      <p className="font-bold text-red-600">${payment.amount.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Method</p>
                      <p className="font-medium">{payment.method}</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 ml-4">
                  {payment.status === 'Pending' && (
                    <>
                      <Button 
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => handleProcessPayment(payment.id, 'Cash')}
                      >
                        <DollarSign className="mr-1 h-4 w-4" />
                        Cash
                      </Button>
                      <Button 
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                        onClick={() => handleProcessPayment(payment.id, 'Card')}
                      >
                        <CreditCard className="mr-1 h-4 w-4" />
                        Card
                      </Button>
                    </>
                  )}
                  <Button 
                    size="sm"
                    variant="outline"
                    onClick={() => generateReceipt(payment)}
                  >
                    <Printer className="mr-1 h-4 w-4" />
                    Print
                  </Button>
                  <Button 
                    size="sm"
                    variant="outline"
                    onClick={() => downloadReceiptPDF(payment)}
                  >
                    <Download className="mr-1 h-4 w-4" />
                    Download
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
