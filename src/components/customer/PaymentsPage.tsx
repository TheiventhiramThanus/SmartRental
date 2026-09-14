import { useState, useEffect } from 'react';
import { DollarSign, Download, Calendar, CreditCard, FileText, Loader2, Car } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { formatCurrency } from '../ui/utils';
import { getDocuments, where } from '../../firebase';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface PaymentsPageProps {
  user: any;
}

export function PaymentsPage({ user }: PaymentsPageProps) {
  const [payments, setPayments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    fetchPayments();
  }, [user.id]);

  const fetchPayments = async () => {
    try {
      setIsLoading(true);
      const userPayments = await getDocuments('payments', where('customerId', '==', user.id));
      setPayments(userPayments);
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadInvoice = (payment: any) => {
    const doc = new jsPDF();
    const primaryColor = [0, 51, 102]; // Dark blue matching system design

    // Header
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, 210, 40, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.text('SmartRental', 15, 25);

    doc.setFontSize(10);
    doc.text('Premium Vehicle Rental Services', 15, 32);

    doc.setFontSize(20);
    doc.text('INVOICE', 160, 25);
    doc.setFontSize(10);
    doc.text(`#${payment.invoiceNumber || payment.id}`, 160, 32);

    // Customer & Invoice Details
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Bill To:', 15, 55);
    doc.setFont('helvetica', 'normal');
    doc.text(payment.customerName || user.name || 'Customer', 15, 62);
    doc.text(user.email || '', 15, 68);

    doc.setFont('helvetica', 'bold');
    doc.text('Invoice Details:', 140, 55);
    doc.setFont('helvetica', 'normal');
    doc.text(`Date: ${payment.date || payment.createdAt}`, 140, 62);
    doc.text(`Status: ${payment.status.toUpperCase()}`, 140, 68);
    doc.text(`Method: ${payment.method || 'Online Payment'}`, 140, 74);

    // Vehicle Details Table
    autoTable(doc, {
      startY: 85,
      head: [['Vehicle Name', 'Booking ID', 'Transaction Date']],
      body: [[
        payment.carName || 'Vehicle Rental',
        payment.bookingId || 'N/A',
        payment.date || payment.createdAt
      ]],
      headStyles: { fillStyle: 'f', fillColor: primaryColor as [number, number, number] },
      margin: { left: 15, right: 15 }
    });

    // Financial Breakdown
    const finalY = (doc as any).lastAutoTable.finalY + 10;

    doc.setDrawColor(200, 200, 200);
    doc.line(130, finalY, 195, finalY);

    doc.setFontSize(10);
    doc.text('Rental Days Fees:', 130, finalY + 10);
    doc.text(formatCurrency(payment.breakdown?.daysFee || payment.amount * 0.7), 170, finalY + 10);

    doc.text('Over Hours Amount:', 130, finalY + 18);
    doc.text(formatCurrency(payment.breakdown?.overHoursFee || payment.amount * 0.3), 170, finalY + 18);

    doc.setDrawColor(0, 0, 0);
    doc.line(130, finalY + 24, 195, finalY + 24);

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Total Amount:', 130, finalY + 32);
    doc.setTextColor(200, 0, 0); // Red for total
    doc.text(formatCurrency(payment.amount), 170, finalY + 32);

    // Footer
    doc.setTextColor(150, 150, 150);
    doc.setFontSize(8);
    doc.text('Thank you for choosing SmartRental!', 105, 280, { align: 'center' });
    doc.text('This is a computer generated invoice and does not require a signature.', 105, 284, { align: 'center' });

    doc.save(`Invoice_${payment.invoiceNumber || payment.id}.pdf`);
  };

  const getStatusColor = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'paid' || s === 'completed') return 'bg-green-500';
    if (s === 'pending') return 'bg-yellow-500';
    return 'bg-gray-500';
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="h-12 w-12 text-accent animate-spin mb-4" />
        <p className="text-muted-foreground">Fetching your payment history...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Payments & Invoices</h2>
          <p className="text-muted-foreground font-medium">Manage your rental billing and payment history</p>
        </div>
        <div className="bg-white border-2 border-accent/20 p-4 rounded-xl shadow-sm text-right">
          <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Aggregate Spend</div>
          <div className="text-2xl text-accent font-black">
            {formatCurrency(payments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0))}
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-l-4 border-l-green-500 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <div className="text-xs font-bold text-muted-foreground uppercase">Paid</div>
                <div className="text-2xl font-bold">{payments.filter(p => p.status.toLowerCase() === 'paid').length}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <div className="text-xs font-bold text-muted-foreground uppercase">Pending</div>
                <div className="text-2xl font-bold">{payments.filter(p => p.status.toLowerCase() === 'pending').length}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-accent shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center">
                <FileText className="h-6 w-6 text-accent" />
              </div>
              <div>
                <div className="text-xs font-bold text-muted-foreground uppercase">Total Invoices</div>
                <div className="text-2xl font-bold">{payments.length}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment List */}
      <div className="space-y-4">
        {payments.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center text-muted-foreground">
              <FileText className="h-16 w-16 mx-auto mb-4 opacity-20" />
              <p className="font-bold text-lg">No payments found</p>
              <p>Your transaction history will appear here once you make a booking.</p>
            </CardContent>
          </Card>
        ) : (
          payments.map((payment) => (
            <Card key={payment.id} className="border-2 hover:border-accent/20 transition-all group shadow-sm hover:shadow-lg">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-8">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-secondary rounded-2xl flex items-center justify-center group-hover:bg-accent group-hover:text-white transition-colors">
                          <Car className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="text-lg font-extrabold text-gray-900">{payment.carName || payment.vehicleName || 'Car Rental'}</h3>
                          <p className="text-xs font-mono font-bold text-muted-foreground">#{payment.invoiceNumber || payment.id}</p>
                        </div>
                      </div>
                      <Badge className={`${getStatusColor(payment.status)} text-white font-bold px-3 py-1`}>
                        {payment.status.toUpperCase()}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-6">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 bg-secondary/50 p-3 rounded-xl border border-secondary">
                          <Calendar className="h-5 w-5 text-accent" />
                          <div>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase">Transaction Date</p>
                            <p className="text-sm font-bold">{payment.date || payment.createdAt}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 bg-secondary/50 p-3 rounded-xl border border-secondary">
                          <CreditCard className="h-5 w-5 text-accent" />
                          <div>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase">Payment Method</p>
                            <p className="text-sm font-bold">{payment.method || 'Online Payment'}</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white p-6 rounded-2xl space-y-4 shadow-sm border-2 border-secondary">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-600 font-bold text-xs uppercase tracking-wider">Rental Days Fees</span>
                          <span className="font-black text-slate-900 text-lg font-mono">{formatCurrency(payment.breakdown?.daysFee || payment.amount * 0.7)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-600 font-bold text-xs uppercase tracking-wider">Over Hours Amount</span>
                          <span className="font-black text-slate-900 text-lg font-mono">{formatCurrency(payment.breakdown?.overHoursFee || payment.amount * 0.3)}</span>
                        </div>
                        <div className="flex justify-between items-center border-t-2 border-dashed border-secondary pt-4 mt-2">
                          <span className="text-slate-600 font-black text-xs uppercase tracking-widest">Total Amount</span>
                          <span className="text-2xl font-black text-accent">{formatCurrency(payment.amount)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-dashed">
                      <Button
                        variant="outline"
                        className="font-bold border-2 hover:bg-accent hover:text-white"
                        onClick={() => downloadInvoice(payment)}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Download PDF
                      </Button>
                      <p className="text-[10px] text-muted-foreground font-mono">ID: {payment.id}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
