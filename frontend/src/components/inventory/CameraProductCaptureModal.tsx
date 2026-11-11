import React, { useState, useRef, useEffect } from 'react';
import { Camera, X, RefreshCw, Check, Sparkles, Upload, AlertCircle, Calendar } from 'lucide-react';
import { createWorker } from 'tesseract.js';
import { StorageType } from '../../types';

interface CameraProductCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCaptured: (data: {
    food_name?: string;
    purchase_date?: string;
    expiry_date?: string | null;
    no_expiry_date?: boolean;
  }) => void;
}

export const CameraProductCaptureModal: React.FC<CameraProductCaptureModalProps> = ({
  isOpen,
  onClose,
  onCaptured,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);

  // Extracted OCR fields
  const [detectedName, setDetectedName] = useState<string>('');
  const [detectedMfd, setDetectedMfd] = useState<string>('');
  const [detectedExp, setDetectedExp] = useState<string>('');
  const [noExpiry, setNoExpiry] = useState<boolean>(false);
  const [ocrConfidenceMessage, setOcrConfidenceMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      startCamera();
      resetState();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const resetState = () => {
    setCapturedImage(null);
    setDetectedName('');
    setDetectedMfd('');
    setDetectedExp('');
    setNoExpiry(false);
    setOcrConfidenceMessage(null);
    setCameraError(null);
  };

  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setIsCameraActive(true);
    } catch (err: any) {
      console.warn('Camera access error:', err);
      setIsCameraActive(false);
      setCameraError('Camera access denied or unavailable. You can upload a product photo from your device.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const handleCapturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setCapturedImage(dataUrl);
    stopCamera();
    processOcr(dataUrl);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setCapturedImage(dataUrl);
        stopCamera();
        processOcr(dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  // Run Tesseract OCR on captured photo
  const processOcr = async (imageDataUrl: string) => {
    setIsScanning(true);
    setScanProgress(10);
    setOcrConfidenceMessage('Analyzing dates and product text on label...');

    try {
      const worker = await createWorker('eng');
      setScanProgress(40);

      const ret = await worker.recognize(imageDataUrl);
      setScanProgress(80);
      await worker.terminate();

      const text = ret.data.text;
      parseOcrResults(text);
      setScanProgress(100);
    } catch (err: any) {
      console.error('OCR processing error:', err);
      setOcrConfidenceMessage('Could not automatically read text on label. Please enter dates manually below.');
    } finally {
      setIsScanning(false);
    }
  };

  // Helper date parse logic
  const parseOcrResults = (rawText: string) => {
    const lines = rawText
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);

    // Regex for dates in format DD/MM/YYYY, DD.MM.YYYY, DD-MM-YYYY, YYYY-MM-DD, DD MMM YYYY
    const dateRegex = /(\b\d{1,2}[\/\.\-]\d{1,2}[\/\.\-]\d{2,4}\b|\b\d{4}[\/\.\-]\d{1,2}[\/\.\-]\d{1,2}\b|\b\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{2,4}\b)/gi;

    let foundExp: string | null = null;
    let foundMfd: string | null = null;
    let titleCandidate = '';

    // Search for keywords line by line
    for (const line of lines) {
      const upperLine = line.toUpperCase();

      // Expiry keywords: EXP, EXPIRY, USE BY, BEST BEFORE, BB
      if (
        upperLine.includes('EXP') ||
        upperLine.includes('USE BY') ||
        upperLine.includes('BEST BEFORE') ||
        upperLine.includes('BEST BY') ||
        upperLine.includes('BB')
      ) {
        const matches = line.match(dateRegex);
        if (matches && matches.length > 0) {
          foundExp = convertToStandardDate(matches[0]);
        }
      }

      // Manufacturing keywords: MFD, MFG, PACKED, PROD
      if (
        upperLine.includes('MFD') ||
        upperLine.includes('MFG') ||
        upperLine.includes('PACKED') ||
        upperLine.includes('PROD')
      ) {
        const matches = line.match(dateRegex);
        if (matches && matches.length > 0) {
          foundMfd = convertToStandardDate(matches[0]);
        }
      }

      // Title line candidate (first line that looks like words)
      if (!titleCandidate && line.length > 3 && !upperLine.includes('EXP') && !upperLine.includes('MFD')) {
        titleCandidate = line;
      }
    }

    // Fallback: If no explicit keyword, but dates were found in text
    if (!foundExp || !foundMfd) {
      const allDates = rawText.match(dateRegex) || [];
      if (allDates.length > 0) {
        const parsedDates = allDates.map(convertToStandardDate).filter(Boolean) as string[];
        parsedDates.sort(); // Earlier date is usually MFD, later date is EXP

        if (parsedDates.length === 1 && !foundExp) {
          foundExp = parsedDates[0];
        } else if (parsedDates.length >= 2) {
          if (!foundMfd) foundMfd = parsedDates[0];
          if (!foundExp) foundExp = parsedDates[parsedDates.length - 1];
        }
      }
    }

    if (titleCandidate) {
      // Clean up title
      const cleanTitle = titleCandidate.replace(/[^a-zA-Z0-9\s]/g, '').trim();
      if (cleanTitle.length > 2) {
        setDetectedName(cleanTitle);
      }
    }

    if (foundMfd) setDetectedMfd(foundMfd);
    if (foundExp) setDetectedExp(foundExp);

    if (foundExp || foundMfd || titleCandidate) {
      setOcrConfidenceMessage('Detected details from product packaging label! Please review and verify.');
    } else {
      setOcrConfidenceMessage('No dates clearly detected in image. Please enter them manually below or toggle "No expiry date".');
    }
  };

  // Convert various date formats to YYYY-MM-DD
  const convertToStandardDate = (str: string): string | null => {
    try {
      const clean = str.replace(/[^\w\/\.\- ]/g, '').trim();
      const parts = clean.split(/[\/\.\-\s]+/);
      if (parts.length < 3) return null;

      let day = parseInt(parts[0], 10);
      let month = parseInt(parts[1], 10);
      let year = parseInt(parts[2], 10);

      if (year < 100) year += 2000;

      // Handle YYYY-MM-DD
      if (parts[0].length === 4) {
        year = parseInt(parts[0], 10);
        month = parseInt(parts[1], 10);
        day = parseInt(parts[2], 10);
      }

      if (month >= 1 && month <= 12 && day >= 1 && day <= 31 && year >= 2020) {
        const mm = String(month).padStart(2, '0');
        const dd = String(day).padStart(2, '0');
        return `${year}-${mm}-${dd}`;
      }
      return null;
    } catch {
      return null;
    }
  };

  const handleConfirmCaptured = () => {
    onCaptured({
      food_name: detectedName.trim() || undefined,
      purchase_date: detectedMfd || undefined,
      expiry_date: noExpiry ? null : detectedExp || undefined,
      no_expiry_date: noExpiry,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500 text-white shadow-sm">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">Scan Product Packaging</h3>
              <p className="text-xs text-slate-500">Capture Manufacturing (MFD) & Expiry (EXP) dates</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {/* Camera View / Photo Capture */}
          {!capturedImage ? (
            <div className="space-y-3">
              <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 flex items-center justify-center">
                {isCameraActive ? (
                  <>
                    <video ref={videoRef} playsInline autoPlay muted className="w-full h-full object-cover" />
                    {/* Guidance Overlay Box */}
                    <div className="absolute inset-0 border-2 border-dashed border-emerald-400/70 rounded-2xl m-6 pointer-events-none flex flex-col justify-between p-3">
                      <div className="text-[11px] font-semibold text-emerald-300 bg-slate-900/80 px-2.5 py-1 rounded-md self-center backdrop-blur-sm">
                        Point camera at MFD / EXP dates
                      </div>
                      <div className="text-[10px] text-slate-300 bg-slate-900/80 px-2 py-0.5 rounded self-center text-center">
                        Keep packaging steady and illuminated
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="p-6 text-center text-slate-400 space-y-2">
                    <Camera className="w-10 h-10 mx-auto text-slate-500" />
                    <p className="text-xs text-slate-300">{cameraError || 'Opening camera stream...'}</p>
                  </div>
                )}
              </div>

              <canvas ref={canvasRef} className="hidden" />

              {/* Camera Action Buttons */}
              <div className="flex items-center gap-3">
                {isCameraActive && (
                  <button
                    type="button"
                    onClick={handleCapturePhoto}
                    className="flex-1 py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 active:scale-98 text-white font-bold text-xs shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Capture & Scan Label</span>
                  </button>
                )}

                <label className="flex-1 py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors border border-slate-200">
                  <Upload className="w-4 h-4 text-slate-500" />
                  <span>Upload Product Photo</span>
                  <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                </label>
              </div>
            </div>
          ) : (
            /* Review & OCR Result View */
            <div className="space-y-4">
              {/* Image Preview */}
              <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-900 border border-slate-200">
                <img src={capturedImage} alt="Captured product" className="w-full h-full object-contain" />
                <button
                  type="button"
                  onClick={() => {
                    setCapturedImage(null);
                    startCamera();
                  }}
                  className="absolute top-2 right-2 p-2 rounded-xl bg-slate-900/80 hover:bg-slate-900 text-white text-xs font-semibold flex items-center gap-1.5 backdrop-blur-sm border border-slate-700"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Retake</span>
                </button>
              </div>

              {/* OCR Loading Banner */}
              {isScanning && (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs space-y-2">
                  <div className="flex items-center justify-between font-semibold">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-600 animate-spin" />
                      <span>Scanning label with Optical Character Recognition (OCR)...</span>
                    </div>
                    <span>{scanProgress}%</span>
                  </div>
                  <div className="w-full bg-emerald-200 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full transition-all duration-300 rounded-full"
                      style={{ width: `${scanProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Status Message */}
              {ocrConfidenceMessage && !isScanning && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>{ocrConfidenceMessage}</span>
                </div>
              )}

              {/* Editable Fields Form */}
              {!isScanning && (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Verify Captured Details
                  </h4>

                  {/* Product Name */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Product Name (Detected or Editable)
                    </label>
                    <input
                      type="text"
                      value={detectedName}
                      onChange={(e) => setDetectedName(e.target.value)}
                      placeholder="e.g. Greek Yogurt, Whole Milk, Fresh Bread"
                      className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-slate-800 text-xs focus:outline-none focus:border-emerald-500 font-medium"
                    />
                  </div>

                  {/* Dates */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Manufacturing (MFD) Date
                      </label>
                      <input
                        type="date"
                        value={detectedMfd}
                        onChange={(e) => setDetectedMfd(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-slate-800 text-xs focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Expiry (EXP) / Use-By Date
                      </label>
                      <input
                        type="date"
                        disabled={noExpiry}
                        value={detectedExp}
                        onChange={(e) => {
                          setDetectedExp(e.target.value);
                          if (e.target.value) setNoExpiry(false);
                        }}
                        className={`w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-slate-800 text-xs focus:outline-none focus:border-emerald-500 ${
                          noExpiry ? 'opacity-40 bg-slate-100 cursor-not-allowed' : ''
                        }`}
                      />
                    </div>
                  </div>

                  {/* No Expiry Date Checkbox */}
                  <div className="flex items-center gap-2 pt-1 border-t border-slate-200">
                    <input
                      type="checkbox"
                      id="ocrNoExpiry"
                      checked={noExpiry}
                      onChange={(e) => {
                        setNoExpiry(e.target.checked);
                        if (e.target.checked) setDetectedExp('');
                      }}
                      className="w-4 h-4 rounded text-emerald-600 accent-emerald-500 cursor-pointer"
                    />
                    <label htmlFor="ocrNoExpiry" className="text-xs text-slate-700 font-medium cursor-pointer">
                      No printed expiry date (e.g. fresh veggies, produce)
                    </label>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold text-xs transition-colors"
          >
            Cancel
          </button>
          {capturedImage && !isScanning && (
            <button
              type="button"
              onClick={handleConfirmCaptured}
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-md shadow-emerald-500/20 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Use Captured Details</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
