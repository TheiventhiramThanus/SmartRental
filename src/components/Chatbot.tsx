import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Bot, User, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { formatCurrency } from './ui/utils';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export function Chatbot({ user }: { user?: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hi! I\'m the SmartRental AI assistant. How can I help you today?',
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  // System Data for Chatbot Knowledge Base
  const systemData = {
    cars: [
      { name: 'Tesla Model 3', price: 24000, type: 'Electric', available: 3 },
      { name: 'BMW 5 Series', price: 36000, type: 'Luxury', available: 2 },
      { name: 'Toyota RAV4', price: 19500, type: 'SUV', available: 5 },
      { name: 'Porsche 911', price: 60000, type: 'Sports', available: 1 }
    ],
    bookings: user ? JSON.parse(localStorage.getItem('bookings') || '[]').filter((b: any) => b.customerId === user.id) : [],
    company: {
      name: 'SmartRental',
      phone: '+94 11 234 5678',
      email: 'support@smartrental.lk',
      address: '123 Galle Road, Colombo 03',
      hours: 'Mon-Sun: 24/7'
    }
  };

  const handleSend = () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    // Simulate AI processing delay
    setTimeout(() => {
      const responseText = generateResponse(userMessage.text.toLowerCase());
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: responseText,
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000);
  };

  const generateResponse = (query: string): string => {
    // Greeting
    if (query.match(/hello|hi|hey|greetings/)) {
      return `Hello ${user ? user.name.split(' ')[0] : 'there'}! How can I assist you with your rental needs today?`;
    }

    // Car Availability & Pricing
    if (query.includes('car') || query.includes('vehicle') || query.includes('price') || query.includes('cost') || query.includes('rate')) {
      if (query.includes('tesla') || query.includes('electric')) {
        const car = systemData.cars.find(c => c.name.includes('Tesla'));
        return `${car?.name} is available starting at ${formatCurrency(car?.price || 0)}/day. We have ${car?.available} units ready for booking.`;
      }
      if (query.includes('bmw') || query.includes('luxury')) {
        const car = systemData.cars.find(c => c.name.includes('BMW'));
        return `${car?.name} is available for ${formatCurrency(car?.price || 0)}/day. ${car?.available} units available.`;
      }
      
      const cheapest = systemData.cars.reduce((prev, curr) => prev.price < curr.price ? prev : curr);
      return `We have a wide range of vehicles starting from ${formatCurrency(cheapest.price)}/day (Toyota RAV4). You can check our full fleet on the "Cars" page.`;
    }

    // Booking Status
    if (query.includes('booking') || query.includes('reservation') || query.includes('order')) {
      if (!user) {
        return "Please log in to check your booking status.";
      }
      if (systemData.bookings.length === 0) {
        return "You don't have any active bookings at the moment. Would you like to make one?";
      }
      
      const recent = systemData.bookings[systemData.bookings.length - 1];
      return `You have ${systemData.bookings.length} booking(s). Your most recent booking for ${recent.carName} is currently ${recent.status}. Pickup is scheduled for ${recent.pickupDate}.`;
    }

    // Contact Info
    if (query.includes('contact') || query.includes('phone') || query.includes('email') || query.includes('support') || query.includes('location')) {
      return `You can reach us at ${systemData.company.phone} or ${systemData.company.email}. We are located at ${systemData.company.address}.`;
    }

    // Returns
    if (query.includes('return')) {
      return "To return a vehicle, please bring it to the designated return location specified in your booking. Ensure the fuel level matches pickup level to avoid extra charges.";
    }

    // Fallback
    return "I'm not sure about that. You can ask me about car prices, availability, your bookings, or our contact information.";
  };

  return (
    <>
      {/* Chat Bubble */}
      <Button
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50 bg-primary hover:bg-primary/90 text-white p-0"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </Button>

      {/* Chat Window */}
      {isOpen && (
        <Card className="fixed bottom-24 right-6 w-80 md:w-96 shadow-2xl z-50 animate-in slide-in-from-bottom-5 duration-300">
          <CardHeader className="bg-primary text-primary-foreground p-4 rounded-t-lg flex flex-row items-center justify-between space-y-0">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              <CardTitle className="text-base">Smart Assistant</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              <span className="text-xs opacity-80">Online</span>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {/* Messages Area */}
            <div className="h-80 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg text-sm ${
                      msg.sender === 'user'
                        ? 'bg-primary text-primary-foreground rounded-br-none'
                        : 'bg-white border shadow-sm rounded-bl-none text-foreground'
                    }`}
                  >
                    {msg.text}
                    <div className={`text-[10px] mt-1 ${msg.sender === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white border shadow-sm rounded-lg rounded-bl-none p-3 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 bg-white border-t flex gap-2">
              <Input
                placeholder="Ask about cars, bookings..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                className="flex-1 focus-visible:ring-primary"
              />
              <Button size="icon" onClick={handleSend} disabled={!inputText.trim() || isTyping}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}
