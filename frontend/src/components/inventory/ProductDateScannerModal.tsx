import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Camera,
  Upload,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Calendar,
  ArrowRight,
  RefreshCw,
  Eye,
  Edit3,
  SwitchCamera,
  Info
} from 'lucide-react';
import { scanImageWithOcr, OcrDetectionResult } from '../../services/ocrService';
import { StorageType } from '../../types';

export interface ScannedProductPayload {
  food_name: string;
  purchase_date: string;
  expiry_date: string | null;
  no_expiry_date: boolean;
  notes?: string;
  image_url?: string;
  storage_location?: StorageType;
}

interface ProductDateScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProductScanned: (payload: ScannedProductPayload) => void;
  onOpenManualEntry?: () => void;
}

export const ProductDateScannerModal: React.FC<ProductDateScannerModalProps> = ({
  isOpen,
  onClose,
  onProductScanned,
  onOpenManualEntry,
}) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [isProcessing, setIsProcessing] = useState(false);
  const [ocrProgress, setOcrProgress] = useState<{ progress: number; status: string }>({
    progress: 0,
    status: '',
  });
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [ocrResult, setOcrResult] = useState<OcrDetectionResult | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [showRawText, setShowRawText] = useState(false);

  // Editable review state before confirming
  const [reviewFoodName, setReviewFoodName] = useState('');
  const [reviewMfd, setReviewMfd] = useState('');
  const [reviewExp, setReviewExp] = useState('');
  const [reviewNoExpiry, setReviewNoExpiry] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Cleanup on close
  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      setCapturedImage(null);
      setOcrResult(null);
      setCameraError(null);
      setIsProcessing(false);
      setShowRawText(false);
      setReviewFoodName('');
      setReviewMfd('');
      setReviewExp('');
      setReviewNoExpiry(false);
    } else {
      startCamera();
    }
  }, [isOpen, facingMode]);

  const startCamera = async () => {
    stopCamera();
    setCameraError(null);
    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setIsCameraActive(true);
    } catch (err: any) {
      console.warn('Camera access error:', err);
      setIsCameraActive(false);
      setCameraError(
        'Camera permission was denied or is not supported. You can upload a photo of your product packaging below.'
      );
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setIsCameraActive(false);
  };

  const switchCameraFacing = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  const handleCaptureFrame = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
    setCapturedImage(dataUrl);

    stopCamera();
    await processImage(canvas, dataUrl);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      setCapturedImage(dataUrl);
      stopCamera();
      await processImage(file, dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const processImage = async (
    source: HTMLCanvasElement | File,
    previewUrl: string
  ) => {
    setIsProcessing(true);
    setOcrProgress({ progress: 0.1, status: 'Starting packaging scanner...' });

    try {
      const result = await scanImageWithOcr(source, (progress, status) => {
        setOcrProgress({ progress, status });
      });

      setOcrResult(result);
      setReviewFoodName(result.productName || '');
      setReviewMfd(result.mfdDate || new Date().toISOString().split('T')[0]);
      setReviewExp(result.expiryDate || '');
      setReviewNoExpiry(!result.expiryDate);
    } catch (err: any) {
      console.error('OCR processing error:', err);
      setCameraError('Could not process image. Please try again or enter manually.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setOcrResult(null);
    setCameraError(null);
    setReviewFoodName('');
    setReviewMfd('');
    setReviewExp('');
    setReviewNoExpiry(false);
    startCamera();
  };

  const handleConfirmAndProceed = () => {
    const finalPayload: ScannedProductPayload = {
      food_name: reviewFoodName.trim() || 'Scanned Food Product',
      purchase_date: reviewMfd || new Date().toISOString().split('T')[0],
      expiry_date: reviewNoExpiry ? null : reviewExp || null,
      no_expiry_date: reviewNoExpiry,
      image_url: capturedImage || undefined,
      notes: ocrResult?.mfdDate ? `Scanned MFD: ${ocrResult.mfdDate}` : undefined,
    };

    onProductScanned(finalPayload);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-xl rounded-2xl border border-slate-200 shadow-2xl p-5 sm:p-6 relative max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800 tracking-tight">Camera Date Scanner</h3>
              <p className="text-xs text-slate-500">
                Point at MFD & EXP dates on packaging to auto-fill details
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Camera or Photo Capture View */}
        <div className="mt-4 space-y-4">
          <canvas ref={canvasRef} className="hidden" />
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            capture="environment"
            onChange={handleFileUpload}
            className="hidden"
          />

          {!capturedImage ? (
            <div className="relative rounded-2xl bg-slate-900 border border-slate-200 overflow-hidden min-h-[300px] flex flex-col items-center justify-center">
              {isCameraActive ? (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover max-h-[380px]"
                  />

                  {/* Date Scanning Target Framing Box */}
                  <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-6">
                    <div className="w-full max-w-xs h-36 border-2 border-dashed border-emerald-400/90 rounded-2xl relative shadow-lg">
                      <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-slate-900/80 text-[10px] font-bold text-emerald-400">
                        Align MFD / EXP Dates Here
                      </div>
                      <div className="absolute -bottom-6 left-0 right-0 text-center text-[11px] font-medium text-white/90 drop-shadow">
                        Keep packaging flat & well-lit
                      </div>
                    </div>
                  </div>

                  {/* Camera Controls Overlay */}
                  <div className="absolute bottom-3 left-0 right-0 px-4 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={switchCameraFacing}
                      className="p-2.5 rounded-full bg-slate-900/80 text-white hover:bg-slate-800 backdrop-blur-md transition-colors"
                      title="Switch camera"
                    >
                      <SwitchCamera className="w-5 h-5" />
                    </button>

                    <button
                      type="button"
                      onClick={handleCaptureFrame}
                      className="px-6 py-3 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm shadow-lg shadow-emerald-500/30 active:scale-95 transition-all flex items-center gap-2"
                    >
                      <Camera className="w-4 h-4" />
                      <span>Capture & Scan</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="p-2.5 rounded-full bg-slate-900/80 text-white hover:bg-slate-800 backdrop-blur-md transition-colors"
                      title="Upload photo"
                    >
                      <Upload className="w-5 h-5" />
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center py-10 px-4 text-white">
                  <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center mx-auto mb-3 text-emerald-400">
                    <Camera className="w-8 h-8" />
                  </div>
                  <h4 className="text-base font-bold text-white">Camera Access</h4>
                  <p className="text-xs text-slate-300 mt-1 max-w-sm mx-auto">
                    Capture packaging with your phone/webcam or upload a photo to auto-detect MFD and EXP dates.
                  </p>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 mt-5">
                    <button
                      type="button"
                      onClick={startCamera}
                      className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-md shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                      <Camera className="w-4 h-4" />
                      <span>Start Camera</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <Upload className="w-4 h-4" />
                      <span>Upload Packaging Photo</span>
                    </button>
                  </div>

                  {cameraError && (
                    <p className="text-[11px] text-amber-300 text-center mt-3 max-w-sm mx-auto">
                      {cameraError}
                    </p>
                  )}
                </div>
              )}
            </div>
          ) : (
            /* Image Preview & OCR Processing / Result Display */
            <div className="space-y-4">
              <div className="relative rounded-2xl bg-slate-900 border border-slate-200 overflow-hidden max-h-56 flex items-center justify-center">
                <img
                  src={capturedImage}
                  alt="Captured Packaging"
                  className="w-full h-full object-contain max-h-56"
                />

                <div className="absolute top-2 right-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleRetake}
                    className="px-3 py-1.5 rounded-lg bg-slate-900/80 text-white hover:bg-slate-800 text-xs font-semibold backdrop-blur-md flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Retake</span>
                  </button>
                </div>
              </div>

              {/* OCR Processing State */}
              {isProcessing && (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 text-center space-y-2">
                  <div className="flex items-center justify-center gap-2 text-emerald-700 font-bold text-xs">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>{ocrProgress.status || 'Scanning text on packaging...'}</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-emerald-100 overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                      style={{ width: `${Math.round(ocrProgress.progress * 100)}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Locating Manufacturing (MFD) & Expiry (EXP) dates
                  </p>
                </div>
              )}

              {/* Detection Result & Editable Review Form */}
              {!isProcessing && ocrResult && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  {/* Status Banner */}
                  <div
                    className={`p-3.5 rounded-xl border flex items-start gap-3 ${
                      ocrResult.expiryDate
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                        : 'bg-amber-50 border-amber-200 text-amber-800'
                    }`}
                  >
                    {ocrResult.expiryDate ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    )}
                    <div className="text-xs">
                      <p className="font-bold">
                        {ocrResult.expiryDate && ocrResult.mfdDate
                          ? 'MFD and EXP Dates Detected'
                          : ocrResult.expiryDate
                          ? 'Expiry Date Detected'
                          : 'No Expiry Date Detected'}
                      </p>
                      <p className="text-slate-600 mt-0.5">
                        {ocrResult.expiryDate
                          ? 'Review and adjust the detected details below before saving.'
                          : 'Dates were not clearly legible on the image. You can enter them manually or check "No expiry date".'}
                      </p>
                    </div>
                  </div>

                  {/* Review & Edit Form Fields */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                      <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <Edit3 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Review Scanned Information</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowRawText(!showRawText)}
                        className="text-[11px] font-semibold text-slate-500 hover:text-slate-700 flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" />
                        <span>{showRawText ? 'Hide OCR text' : 'View OCR text'}</span>
                      </button>
                    </div>

                    {showRawText && (
                      <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-[11px] font-mono text-slate-600 whitespace-pre-wrap max-h-32 overflow-y-auto">
                        {ocrResult.rawText || 'No text recognized.'}
                      </div>
                    )}

                    {/* Product Name */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Product Name *
                      </label>
                      <input
                        type="text"
                        value={reviewFoodName}
                        onChange={(e) => setReviewFoodName(e.target.value)}
                        placeholder="e.g., Greek Yogurt, Fresh Milk, Cheese"
                        className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-slate-800 text-xs focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>

                    {/* Dates Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Manufacturing Date */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-xs font-semibold text-slate-700">
                            Mfg / Purchase Date (MFD)
                          </label>
                          {ocrResult.mfdConfidence && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-700 font-bold">
                              Auto-detected
                            </span>
                          )}
                        </div>
                        <input
                          type="date"
                          value={reviewMfd}
                          onChange={(e) => setReviewMfd(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-slate-800 text-xs focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      {/* Expiry Date */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-xs font-semibold text-slate-700">
                            Expiry Date (EXP)
                          </label>
                          {ocrResult.expConfidence && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-700 font-bold">
                              Auto-detected
                            </span>
                          )}
                        </div>
                        <input
                          type="date"
                          disabled={reviewNoExpiry}
                          value={reviewExp}
                          onChange={(e) => {
                            setReviewExp(e.target.value);
                            if (e.target.value) setReviewNoExpiry(false);
                          }}
                          className={`w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-slate-800 text-xs focus:outline-none focus:border-emerald-500 ${
                            reviewNoExpiry ? 'opacity-40 bg-slate-100 cursor-not-allowed' : ''
                          }`}
                        />
                      </div>
                    </div>

                    {/* No Expiry Date Checkbox */}
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="checkbox"
                        id="scannerNoExpiry"
                        checked={reviewNoExpiry}
                        onChange={(e) => {
                          setReviewNoExpiry(e.target.checked);
                          if (e.target.checked) setReviewExp('');
                        }}
                        className="w-4 h-4 rounded text-emerald-600 accent-emerald-500 cursor-pointer"
                      />
                      <label htmlFor="scannerNoExpiry" className="text-xs text-slate-600 cursor-pointer">
                        This product has no expiry date (e.g., fresh produce, pantry staples)
                      </label>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={handleRetake}
                      className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors"
                    >
                      Scan Another Product
                    </button>

                    <button
                      type="button"
                      onClick={handleConfirmAndProceed}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-md shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer"
                    >
                      <span>Proceed with Details</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Quick Manual Entry Option Footer */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Unpackaged or fresh food?</span>
            <button
              type="button"
              onClick={() => {
                stopCamera();
                onClose();
                if (onOpenManualEntry) onOpenManualEntry();
              }}
              className="text-emerald-600 hover:text-emerald-700 font-semibold hover:underline"
            >
              Enter manually without camera →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
