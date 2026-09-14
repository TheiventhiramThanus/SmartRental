import { useState, useRef } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Camera, Upload, CheckCircle, AlertTriangle, X, Loader2, ShieldCheck, FileText } from 'lucide-react';
import { Alert, AlertDescription } from '../ui/alert';
import { updateDocument } from '../../firebase';

interface DocumentsPageProps {
  user: any;
  onUpdateProfile: (user: any) => void;
}

export function DocumentsPage({ user, onUpdateProfile }: DocumentsPageProps) {
  const [documents, setDocuments] = useState({
    driversLicense: user.licenseUploaded || false,
    nationalId: user.nicUploaded || false,
    licenseImage: user.licenseImage || '',
    nicImage: user.nicImage || ''
  });

  const [showCamera, setShowCamera] = useState<'license' | 'nic' | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = async (docType: 'license' | 'nic') => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }
      setShowCamera(docType);
    } catch (err) {
      alert('Camera access denied. Please allow camera permissions.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setShowCamera(null);
  };

  const capturePhoto = async () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const imageData = canvasRef.current.toDataURL('image/jpeg');

        try {
          setIsUploading(true);
          const updateData: any = {};
          if (showCamera === 'license') {
            updateData.licenseUploaded = true;
            updateData.licenseImage = imageData;
            setDocuments(prev => ({ ...prev, driversLicense: true, licenseImage: imageData }));
          } else if (showCamera === 'nic') {
            updateData.nicUploaded = true;
            updateData.nicImage = imageData;
            setDocuments(prev => ({ ...prev, nationalId: true, nicImage: imageData }));
          }

          const updatedUser = { ...user, ...updateData };
          await updateDocument('users', user.id, updatedUser);
          onUpdateProfile(updatedUser);
          stopCamera();
        } catch (error) {
          console.error('Error saving captured photo:', error);
          alert('Failed to save photo. Please try again.');
        } finally {
          setIsUploading(false);
        }
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, docType: 'license' | 'nic') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const imageData = reader.result as string;

        try {
          setIsUploading(true);
          const updateData: any = {};
          if (docType === 'license') {
            updateData.licenseUploaded = true;
            updateData.licenseImage = imageData;
            setDocuments(prev => ({ ...prev, driversLicense: true, licenseImage: imageData }));
          } else {
            updateData.nicUploaded = true;
            updateData.nicImage = imageData;
            setDocuments(prev => ({ ...prev, nationalId: true, nicImage: imageData }));
          }

          const updatedUser = { ...user, ...updateData };
          await updateDocument('users', user.id, updatedUser);
          onUpdateProfile(updatedUser);
        } catch (error) {
          console.error('Error uploading document:', error);
          alert('Failed to upload document. Please try again.');
        } finally {
          setIsUploading(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-black text-gray-900 tracking-tight mb-2 uppercase">Official Documentation</h2>
        <p className="text-muted-foreground font-medium">Verified documents are required for vehicle insurance coverage</p>
      </div>

      {/* Alerts */}
      {(!documents.driversLicense || !documents.nationalId) && (
        <Alert className="border-accent/50 bg-accent/[0.03] border-2 shadow-sm animate-pulse">
          <ShieldCheck className="h-5 w-5 text-accent" />
          <AlertDescription className="text-accent font-bold ml-2">
            RESTRICTED ACCESS: Please upload all required documents to enable vehicle booking privileges.
          </AlertDescription>
        </Alert>
      )}

      {/* Camera Modal */}
      {showCamera && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4 backdrop-blur-md">
          <div className="bg-white rounded-3xl p-8 max-w-2xl w-full shadow-[0_0_100px_rgba(255,59,48,0.3)]">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-2xl font-black text-gray-900">
                  DOCUMENT SCANNER
                </h3>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">
                  Capturing: {showCamera === 'license' ? "Driver's License" : 'National ID'}
                </p>
              </div>
              <Button variant="ghost" onClick={stopCamera} className="rounded-full hover:bg-red-50 hover:text-red-600">
                <X className="h-6 w-6" />
              </Button>
            </div>

            <div className="relative rounded-2xl overflow-hidden border-4 border-accent shadow-2xl bg-black mb-8 aspect-video flex items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 border-[40px] border-black/20 pointer-events-none">
                <div className="w-full h-full border-2 border-white/50 border-dashed rounded-lg flex items-center justify-center">
                  <div className="text-white/30 text-[10px] font-black uppercase tracking-[0.5em]">Align document within frame</div>
                </div>
              </div>
              {isUploading && (
                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white">
                  <Loader2 className="h-12 w-12 animate-spin mb-4" />
                  <p className="font-bold tracking-widest text-xs">PROCESSING IMAGE...</p>
                </div>
              )}
            </div>

            <canvas ref={canvasRef} className="hidden" />

            <div className="flex gap-6">
              <Button
                disabled={isUploading}
                className="flex-1 bg-accent hover:bg-accent/90 text-white font-black h-16 rounded-2xl shadow-xl shadow-accent/20"
                onClick={capturePhoto}
              >
                <Camera className="mr-3 h-6 w-6" />
                CAPTURE NOW
              </Button>
              <Button
                variant="outline"
                className="flex-1 font-black h-16 rounded-2xl border-2"
                onClick={stopCamera}
                disabled={isUploading}
              >
                CANCEL
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Driver's License */}
        <Card className="border-2 group hover:border-accent/40 transition-all shadow-md hover:shadow-2xl overflow-hidden">
          <CardContent className="p-0">
            <div className="p-6 bg-gray-50/50 border-b-2 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-gray-900 group-hover:text-accent transition-colors">DRIVER'S LICENSE</h3>
                <p className="text-[10px] font-bold text-muted-foreground uppercase mt-0.5">Primary validation</p>
              </div>
              {documents.driversLicense ? (
                <Badge className="bg-green-500 hover:bg-green-600 text-white font-bold px-4 py-1.5 rounded-full shadow-lg shadow-green-200">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  VERIFIED
                </Badge>
              ) : (
                <Badge variant="destructive" className="font-bold px-4 py-1.5 rounded-full animate-pulse shadow-lg shadow-red-200">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  REQUIRED
                </Badge>
              )}
            </div>

            <div className="p-8">
              {documents.licenseImage ? (
                <div className="relative group/img mb-8 rounded-2xl overflow-hidden border-4 border-white shadow-xl aspect-video">
                  <img
                    src={documents.licenseImage}
                    alt="Driver's License"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                    <CheckCircle className="text-white h-12 w-12" />
                  </div>
                </div>
              ) : (
                <div className="mb-8 h-48 bg-slate-100 rounded-2xl border-4 border-dashed border-slate-200 flex flex-col items-center justify-center gap-3">
                  <FileText className="h-10 w-10 text-slate-300" />
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest">No preview available</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  disabled={isUploading}
                  className="w-full font-black border-2 h-12 rounded-xl hover:bg-accent hover:text-white hover:border-accent transition-all"
                  onClick={() => startCamera('license')}
                >
                  <Camera className="mr-2 h-5 w-5" />
                  CAMERA
                </Button>
                <Button
                  variant="outline"
                  disabled={isUploading}
                  className="w-full font-black border-2 h-12 rounded-xl hover:bg-accent hover:text-white hover:border-accent transition-all"
                  onClick={() => document.getElementById('license-upload')?.click()}
                >
                  {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-5 w-5" />}
                  UPLOAD
                </Button>
                <input
                  id="license-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e, 'license')}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* National ID Card */}
        <Card className="border-2 group hover:border-accent/40 transition-all shadow-md hover:shadow-2xl overflow-hidden">
          <CardContent className="p-0">
            <div className="p-6 bg-gray-50/50 border-b-2 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-gray-900 group-hover:text-accent transition-colors">NATIONAL ID CARD</h3>
                <p className="text-[10px] font-bold text-muted-foreground uppercase mt-0.5">Identity verification</p>
              </div>
              {documents.nationalId ? (
                <Badge className="bg-green-500 hover:bg-green-600 text-white font-bold px-4 py-1.5 rounded-full shadow-lg shadow-green-200">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  VERIFIED
                </Badge>
              ) : (
                <Badge variant="destructive" className="font-bold px-4 py-1.5 rounded-full animate-pulse shadow-lg shadow-red-200">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  REQUIRED
                </Badge>
              )}
            </div>

            <div className="p-8">
              {documents.nicImage ? (
                <div className="relative group/img mb-8 rounded-2xl overflow-hidden border-4 border-white shadow-xl aspect-video">
                  <img
                    src={documents.nicImage}
                    alt="National ID"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                    <CheckCircle className="text-white h-12 w-12" />
                  </div>
                </div>
              ) : (
                <div className="mb-8 h-48 bg-slate-100 rounded-2xl border-4 border-dashed border-slate-200 flex flex-col items-center justify-center gap-3">
                  <FileText className="h-10 w-10 text-slate-300" />
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest">No preview available</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  disabled={isUploading}
                  className="w-full font-black border-2 h-12 rounded-xl hover:bg-accent hover:text-white hover:border-accent transition-all"
                  onClick={() => startCamera('nic')}
                >
                  <Camera className="mr-2 h-5 w-5" />
                  CAMERA
                </Button>
                <Button
                  variant="outline"
                  disabled={isUploading}
                  className="w-full font-black border-2 h-12 rounded-xl hover:bg-accent hover:text-white hover:border-accent transition-all"
                  onClick={() => document.getElementById('nic-upload')?.click()}
                >
                  {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-5 w-5" />}
                  UPLOAD
                </Button>
                <input
                  id="nic-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e, 'nic')}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Verification Status */}
      <Card className="border-2 border-slate-200 bg-white text-slate-900 shadow-2xl rounded-3xl overflow-hidden">
        <CardContent className="p-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-accent rounded-2xl flex items-center justify-center">
              <ShieldCheck className="h-7 w-7 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-black uppercase tracking-tighter">Security Compliance Status</h3>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Updated in real-time from cloud vault</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="flex items-center gap-4">
                <div className={`w-3 h-3 rounded-full ${documents.driversLicense ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-red-500 animate-pulse'}`} />
                <span className="text-sm font-bold uppercase tracking-widest">Driver's License Approval</span>
              </div>
              <span className={`text-[10px] font-black px-3 py-1 rounded-full ${documents.driversLicense ? 'bg-green-500/20 text-green-600' : 'bg-red-500/20 text-red-600'}`}>
                {documents.driversLicense ? 'APPROVED' : 'ACTION REQUIRED'}
              </span>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="flex items-center gap-4">
                <div className={`w-3 h-3 rounded-full ${documents.nationalId ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-red-500 animate-pulse'}`} />
                <span className="text-sm font-bold uppercase tracking-widest">National Identity Verification</span>
              </div>
              <span className={`text-[10px] font-black px-3 py-1 rounded-full ${documents.nationalId ? 'bg-green-500/20 text-green-600' : 'bg-red-500/20 text-red-600'}`}>
                {documents.nationalId ? 'APPROVED' : 'ACTION REQUIRED'}
              </span>
            </div>

            <div className="flex items-center justify-between pt-8 border-t border-slate-100 mt-4">
              <span className="text-xl font-black uppercase tracking-tighter italic text-slate-800">Rental Eligibility</span>
              <div className="flex items-center gap-3">
                <div className={`flex items-center justify-center px-8 py-3 rounded-2xl font-black shadow-2xl transition-all duration-500 ${documents.driversLicense && documents.nationalId ? 'bg-green-500 text-white shadow-green-500/20' : 'bg-red-500/20 text-red-500 border border-red-500/50'}`}>
                  {documents.driversLicense && documents.nationalId ? 'ELIGIBLE TO RENT' : 'INCOMPLETE PROFILE'}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
