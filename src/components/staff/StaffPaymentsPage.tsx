import { useState } from 'react';
import { DollarSign, CheckCircle, Printer } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { formatCurrency } from '../ui/utils';

interface StaffPaymentsPageProps {
  user: any;
}

export function StaffPaymentsPage({ user }: StaffPaymentsPageProps) {
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [amountReceived, setAmountReceived] = useState('');

  const pendingPayments = [
    {
      id: '1',
      bookingId: 'BK001',
      customer: 'John Doe',
      vehicle: 'Tesla Model 3',
      amount: 72000,
      dueDate: '2026-01-22',
      status: 'Pending'
    },
    {
      id: '2',
      bookingId: 'BK002',
      customer: 'Sarah Smith',
      vehicle: 'BMW 5 Series',
      amount: 108000,
      dueDate: '2026-01-21',
      status: 'Overdue'
    }
  ];

  const handleConfirmPayment = (paymentId: string) => {
    if (!paymentMethod || !amountReceived) {
      alert('Please select payment method and enter amount received');
      return;
    }

    if (confirm('Confirm payment received?')) {
      alert(`Payment recorded successfully!\nMethod: ${paymentMethod}\nAmount: ${formatCurrency(parseInt(amountReceived))}`);
      setSelectedPayment(null);
      setPaymentMethod('');
      setAmountReceived('');
    }
  };

  return (
    <div className="space-y-6">
      <h2>Payment Recording</h2>

      <div className="grid grid-cols-1 gap-4">
        {pendingPayments.map((payment) => (
          <Card key={payment.id}>
            <CardContent className="p-6">
              {selectedPayment?.id !== payment.id ? (
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="mb-1">{payment.customer}</h3>
                    <p className="text-sm text-muted-foreground">
                      {payment.vehicle} | Booking: #{payment.bookingId}
                    </p>
                    <div className="flex gap-2 mt-2">
                      <Badge className={payment.status === 'Overdue' ? 'bg-red-500' : 'bg-yellow-500'}>
                        {payment.status}
                      </Badge>
                      <span className="text-sm text-muted-foreground">Due: {payment.dueDate}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl text-accent font-semibold mb-2">{formatCurrency(payment.amount)}</div>
                    <Button 
                      className="bg-accent hover:bg-accent/90"
                      onClick={() => setSelectedPayment(payment)}
                    >
                      Record Payment
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3>{payment.customer}</h3>
                      <p className="text-sm text-muted-foreground">Payment Recording</p>
                    </div>
                    <Button variant="outline" onClick={() => setSelectedPayment(null)}>
                      Cancel
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Payment Method</label>
                      <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select method..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cash">Cash</SelectItem>
                          <SelectItem value="card">Credit/Debit Card</SelectItem>
                          <SelectItem value="online">Online Transfer</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Amount Received (LKR)</label>
                      <Input
                        type="number"
                        placeholder={payment.amount.toString()}
                        value={amountReceived}
                        onChange={(e) => setAmountReceived(e.target.value)}
                      />
                    </div>
                  </div>

                  <Card className="bg-secondary">
                    <CardContent className="p-4">
                      <h4 className="mb-2">Payment Summary</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Amount Due:</span>
                          <span>{formatCurrency(payment.amount)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Method:</span>
                          <span>{paymentMethod || '-'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Amount Received:</span>
                          <span>{amountReceived ? formatCurrency(parseInt(amountReceived)) : formatCurrency(0)}</span>
                        </div>
                        {amountReceived && parseInt(amountReceived) !== payment.amount && (
                          <div className="flex justify-between text-red-500">
                            <span>Difference:</span>
                            <span>{formatCurrency(Math.abs(payment.amount - parseInt(amountReceived)))}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <div className="flex gap-2">
                    <Button
                      className="bg-green-500 hover:bg-green-600 flex-1"
                      onClick={() => handleConfirmPayment(payment.id)}
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Confirm Payment
                    </Button>
                    <Button variant="outline">
                      <Printer className="mr-2 h-4 w-4" />
                      Print Receipt
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
