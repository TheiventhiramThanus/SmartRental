import { useState, useRef, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Save, Upload, Loader2, CheckCircle, AlertCircle, FileText } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent } from '../ui/card';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { updateDocument } from '../../firebase';

interface ProfilePageProps {
  user: any;
  onUpdateProfile: (updatedUser: any) => void;
}

export function ProfilePage({ user, onUpdateProfile }: ProfilePageProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name || '',
    email: user.email || '',
    phone: user.phone || '',
    address: user.address || '',
    licenseNumber: user.licenseNumber || '',
    nicNumber: user.nicNumber || ''
  });

  const [scanning, setScanning] = useState<string | null>(null); // 'license' | 'nic' | null
  const [scanError, setScanError] = useState<string | null>(null);
  const [uploadedDocs, setUploadedDocs] = useState({
    license: user.licenseUploaded || !!user.licenseNumber,
    nic: user.nicUploaded || !!user.nicNumber
  });

  const licenseInputRef = useRef<HTMLInputElement>(null);
  const nicInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    try {
      setIsSaving(true);
      const updatedUser = {
        ...user,
        ...formData,
        licenseUploaded: uploadedDocs.license,
        nicUploaded: uploadedDocs.nic
      };

      await updateDocument('users', user.id, updatedUser);
      onUpdateProfile(updatedUser);
      alert('Profile updated successfully in cloud storage!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to save profile changes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const simulateAIDocScan = (file: File, type: 'license' | 'nic') => {
    setScanning(type);
    setScanError(null);

    // Simulate AI processing delay
    setTimeout(() => {
      try {
        // Mock validation based on file size/name for demonstration
        if (file.size > 5 * 1024 * 1024) {
          throw new Error("File too large. Please upload an image under 5MB.");
        }

        // Simulate AI extraction logic
        let extractedData = '';

        if (type === 'license') {
          // Simulate extracting a Driving License number (Sri Lankan format: Bxxxxxxx or similar)
          const mockLicense = `B${Math.floor(Math.random() * 9000000) + 1000000}`;
          extractedData = mockLicense;

          // Regex validation for Sri Lankan DL (simplified)
          const dlRegex = /^[A-Z][0-9]{7,8}$/;
          if (!dlRegex.test(extractedData)) {
            throw new Error("Could not detect a valid Driver's License number. Please ensure the image is clear.");
          }

          setFormData(prev => ({ ...prev, licenseNumber: extractedData }));
          setUploadedDocs(prev => ({ ...prev, license: true }));
        } else {
          // Simulate extracting a NIC number (Sri Lankan format: 9xxxxxxxxxV or 19/20xxxxxxxxxx)
          const mockNIC = `${Math.floor(Math.random() * 900000000) + 100000000}V`;
          extractedData = mockNIC;

          // Regex validation for Sri Lankan NIC
          const nicRegex = /^([0-9]{9}[vVxX]|[0-9]{12})$/;
          if (!nicRegex.test(extractedData)) {
            throw new Error("Could not detect a valid NIC number. Please ensure the image is clear.");
          }

          setFormData(prev => ({ ...prev, nicNumber: extractedData }));
          setUploadedDocs(prev => ({ ...prev, nic: true }));
        }

      } catch (error: any) {
        setScanError(error.message || "Failed to scan document.");
      } finally {
        setScanning(null);
      }
    }, 2500); // 2.5s simulated delay
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'license' | 'nic') => {
    const file = e.target.files?.[0];
    if (file) {
      simulateAIDocScan(file, type);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">My Profile</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Picture */}
        <Card className="shadow-lg border-2">
          <CardContent className="p-8 text-center bg-gray-50/50">
            <div className="relative inline-block group">
              <div className="w-32 h-32 bg-accent text-accent-foreground rounded-full flex items-center justify-center text-5xl font-black mx-auto mb-6 shadow-xl border-4 border-white">
                {user.name.charAt(0)}
              </div>
              <div className="absolute inset-0 bg-black/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                <Upload className="text-white h-8 w-8" />
              </div>
            </div>
            <h3 className="text-xl font-bold mb-1">{user.name}</h3>
            <p className="text-xs font-black uppercase tracking-widest text-accent mb-6 bg-accent/10 py-1.5 rounded-full inline-block px-4">
              {user.role}
            </p>
            <Button variant="outline" className="w-full font-bold border-2 hover:bg-accent hover:text-white transition-all">
              <Upload className="mr-2 h-4 w-4" />
              Change Avatar
            </Button>
          </CardContent>
        </Card>

        {/* Profile Form */}
        <div className="lg:col-span-2">
          <Card className="shadow-lg border-2">
            <CardContent className="p-8">
              <form onSubmit={handleSave} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-wider text-muted-foreground">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-accent" />
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="pl-10 font-bold border-2 focus:border-accent"
                        required
                        disabled={isSaving}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-wider text-muted-foreground">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-accent" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="pl-10 font-bold border-2 focus:border-accent"
                        required
                        disabled={isSaving}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-wider text-muted-foreground">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-accent" />
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        className="pl-10 font-mono font-bold border-2 focus:border-accent"
                        required
                        disabled={isSaving}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-wider text-muted-foreground">Address</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-accent" />
                      <Input
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        className="pl-10 font-bold border-2 focus:border-accent"
                        required
                        disabled={isSaving}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-wider text-muted-foreground">Driving License</label>
                    <div className="relative">
                      <Input
                        id="licenseNumber"
                        name="licenseNumber"
                        value={formData.licenseNumber}
                        onChange={handleChange}
                        placeholder="e.g. B1234567"
                        className={`font-mono font-bold border-2 ${uploadedDocs.license ? "border-green-500 bg-green-50" : "focus:border-accent"}`}
                        disabled={isSaving}
                      />
                      {uploadedDocs.license && (
                        <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-green-500" />
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-wider text-muted-foreground">NIC Identification</label>
                    <div className="relative">
                      <Input
                        id="nicNumber"
                        name="nicNumber"
                        value={formData.nicNumber}
                        onChange={handleChange}
                        placeholder="e.g. 951234567V"
                        className={`font-mono font-bold border-2 ${uploadedDocs.nic ? "border-green-500 bg-green-50" : "focus:border-accent"}`}
                        disabled={isSaving}
                      />
                      {uploadedDocs.nic && (
                        <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-green-500" />
                      )}
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isSaving}
                  className="bg-accent hover:bg-accent/90 text-accent-foreground font-black px-8 py-6 rounded-xl shadow-lg shadow-accent/20"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      UPDATING CLOUD...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-5 w-5" />
                      SAVE PROFILE
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Documents AI Section */}
          <Card className="mt-8 shadow-xl border-2 border-dashed border-accent/20 bg-accent/[0.01]">
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <FileText className="text-accent h-6 w-6" />
                <h3 className="text-xl font-bold">Document Verification</h3>
              </div>

              {scanError && (
                <Alert variant="destructive" className="mb-6 border-2 animate-shake">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle className="font-bold">OCR ERROR</AlertTitle>
                  <AlertDescription className="text-xs">{scanError}</AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-white border-2 rounded-2xl relative overflow-hidden group">
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-extrabold text-sm uppercase">Driver's License</h4>
                      {uploadedDocs.license ? <BadgeVerified /> : <p className="text-[10px] font-bold text-orange-500 uppercase">Pending</p>}
                    </div>

                    <input
                      type="file"
                      ref={licenseInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => onFileChange(e, 'license')}
                    />

                    <Button
                      variant={uploadedDocs.license ? "outline" : "default"}
                      className={`w-full font-bold ${scanning === 'license' ? 'animate-pulse' : ''}`}
                      onClick={() => licenseInputRef.current?.click()}
                      disabled={!!scanning}
                    >
                      {scanning === 'license' ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          AI ANALYZING...
                        </>
                      ) : (
                        <>
                          <Upload className="mr-2 h-4 w-4" />
                          {uploadedDocs.license ? 'RE-SCAN LICENSE' : 'SCAN LICENSE'}
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                <div className="p-6 bg-white border-2 rounded-2xl relative overflow-hidden group">
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-extrabold text-sm uppercase">NIC Identity</h4>
                      {uploadedDocs.nic ? <BadgeVerified /> : <p className="text-[10px] font-bold text-orange-500 uppercase">Pending</p>}
                    </div>

                    <input
                      type="file"
                      ref={nicInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => onFileChange(e, 'nic')}
                    />

                    <Button
                      variant={uploadedDocs.nic ? "outline" : "default"}
                      className={`w-full font-bold ${scanning === 'nic' ? 'animate-pulse' : ''}`}
                      onClick={() => nicInputRef.current?.click()}
                      disabled={!!scanning}
                    >
                      {scanning === 'nic' ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          AI ANALYZING...
                        </>
                      ) : (
                        <>
                          <Upload className="mr-2 h-4 w-4" />
                          {uploadedDocs.nic ? 'RE-SCAN NIC' : 'SCAN NIC'}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
              <p className="mt-6 text-[10px] font-bold text-muted-foreground text-center uppercase tracking-widest bg-gray-100 p-2 rounded-lg">
                Your data is encrypted using AES-256 for maximum security
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function BadgeVerified() {
  return (
    <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase bg-green-100 text-green-700 border-2 border-green-200">
      <CheckCircle className="mr-1 h-3 w-3" />
      Verified
    </span>
  );
}
