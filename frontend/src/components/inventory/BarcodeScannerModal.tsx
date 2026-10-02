import React, { useState, useEffect, useRef } from 'react';
import { X, Camera, ScanLine, Search, CheckCircle2, AlertCircle, Sparkles, ArrowRight } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import { api } from '../../services/api';
import { BarcodeLookup } from '../../types';

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProductConfirmed: (lookupData: BarcodeLookup) => void;
}

export const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({
  isOpen,
  onClose,
  onProductConfirmed,
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [manualBarcode, setManualBarcode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lookupResult, setLookupResult] = useState<BarcodeLookup | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);

  // Quick test barcode presets
  const sampleBarcodes = [
    { name: 'Chicken Breast', code: '012345678901' },
    { name: 'Fresh Tomato', code: '012345678902' },
    { name: 'Whole Milk', code: '012345678905' },
    { name: 'Pasta Spaghetti', code: '012345678914' },
    { name: 'Salmon Fillet', code: '012345678912' },
    { name: 'Avocado', code: '012345678922' },
  ];

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      setLookupResult(null);
      setError(null);
      setCameraError(null);
      setManualBarcode('');
    }
  }, [isOpen]);

  const startCamera = async () => {
    setCameraError(null);
    try {
      const qrCode = new Html5Qrcode('qr-reader');
      html5QrCodeRef.current = qrCode;

      await qrCode.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 180 },
        },
        async (decodedText) => {
          // Success callback
          stopCamera();
          await handleBarcodeLookup(decodedText);
        },
        () => {
          // Ignore scanning frame errors
        }
      );
      setIsScanning(true);
    } catch (err: any) {
      console.warn('Camera access error', err);
      setCameraError('Camera access unavailable or permission denied. You can enter or select a test barcode below.');
      setIsScanning(false);
    }
  };

  const stopCamera = () => {
    if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
      html5QrCodeRef.current
        .stop()
        .then(() => {
          html5QrCodeRef.current?.clear();
          html5QrCodeRef.current = null;
        })
        .catch((e) => console.error(e));
    }
    setIsScanning(false);
  };

  const handleBarcodeLookup = async (code: string) => {
    if (!code || code.trim().length < 3) {
      setError('Please enter a valid barcode number.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await api.scanBarcode(code.trim());
      setLookupResult(result);
    } catch (err: any) {
      setError(err.message || 'Error looking up product barcode.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmAndProceed = () => {
    if (lookupResult) {
      onProductConfirmed(lookupResult);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="glass-panel w-full max-w-lg rounded-3xl border border-slate-700/60 shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <ScanLine className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Barcode Scanner</h3>
              <p className="text-xs text-slate-400">Scan packaging with camera or test presets</p>
            </div>
          </div>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Scanner Body */}
        <div className="mt-4 space-y-4">
          {/* Camera View Area */}
          <div className="relative rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden min-h-[220px] flex flex-col items-center justify-center p-4">
            <div id="qr-reader" className="w-full max-w-[320px] rounded-xl overflow-hidden" />

            {!isScanning && (
              <div className="text-center py-6 px-4">
                <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto mb-3 text-emerald-400">
                  <Camera className="w-7 h-7" />
                </div>
                <h4 className="text-sm font-bold text-slate-200">Device Camera Scanner</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-xs">
                  Point your smartphone or webcam at the food barcode.
                </p>
                <button
                  type="button"
                  onClick={startCamera}
                  className="mt-4 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer"
                >
                  Start Camera
                </button>
              </div>
            )}

            {isScanning && (
              <button
                type="button"
                onClick={stopCamera}
                className="mt-3 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Stop Camera
              </button>
            )}

            {cameraError && (
              <p className="text-[11px] text-amber-400 text-center mt-2 px-2">{cameraError}</p>
            )}
          </div>

          {/* Manual / Presets Barcode Lookup */}
          <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
            <label className="block text-xs font-semibold text-slate-300">
              Or Enter / Select a Test Barcode
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={manualBarcode}
                onChange={(e) => setManualBarcode(e.target.value)}
                placeholder="Enter barcode e.g. 012345678901"
                className="flex-1 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-emerald-500"
              />
              <button
                type="button"
                onClick={() => handleBarcodeLookup(manualBarcode)}
                disabled={isLoading}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Searching...' : 'Search'}
              </button>
            </div>

            {/* Test Presets */}
            <div>
              <span className="text-[11px] text-slate-400 font-medium">Quick Test Barcodes:</span>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {sampleBarcodes.map((item) => (
                  <button
                    key={item.code}
                    type="button"
                    onClick={() => {
                      setManualBarcode(item.code);
                      handleBarcodeLookup(item.code);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-emerald-500/20 hover:text-emerald-300 hover:border-emerald-500/30 text-[11px] text-slate-300 border border-slate-700/60 transition-colors cursor-pointer"
                  >
                    {item.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Product Lookup Result Display */}
          {lookupResult && (
            <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border border-emerald-500/30 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-xl bg-slate-900/80 border border-emerald-500/30 flex items-center justify-center shrink-0 overflow-hidden">
                    {lookupResult.image_url ? (
                      <img
                        src={lookupResult.image_url}
                        alt="Product"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        {lookupResult.found ? 'Product Found' : 'Manual Entry Needed'}
                      </span>
                      {lookupResult.brand && (
                        <span className="text-[10px] text-slate-400 font-medium">{lookupResult.brand}</span>
                      )}
                    </div>
                    <h4 className="text-sm font-bold text-white mt-0.5">
                      {lookupResult.food_name || 'Unrecognized Product'}
                    </h4>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Category: <span className="font-semibold text-emerald-400">{lookupResult.category_name || 'Other'}</span> | Storage: <span className="font-semibold text-cyan-400">{lookupResult.suggested_storage || 'Refrigerator'}</span>
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleConfirmAndProceed}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 active:scale-95 transition-all shrink-0 cursor-pointer"
                >
                  <span>Confirm</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
