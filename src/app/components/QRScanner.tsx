import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Button } from './ui/button';
import { Camera, CameraOff } from 'lucide-react';

interface QRScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onScanError?: (error: string) => void;
}

export function QRScanner({ onScanSuccess, onScanError }: QRScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const qrCodeRegionId = "qr-reader";

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (scannerRef.current && isScanning) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, [isScanning]);

  const startScanning = async () => {
    try {
      setError(null);
      const html5QrCode = new Html5Qrcode(qrCodeRegionId);
      scannerRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: "environment" }, // Use back camera
        {
          fps: 10,
          qrbox: { width: 250, height: 250 }
        },
        (decodedText) => {
          // Success callback
          onScanSuccess(decodedText);
        },
        (errorMessage) => {
          // Error callback (this fires continuously, so we ignore it)
          // Only show actual errors
        }
      );

      setIsScanning(true);
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to start camera';
      setError(errorMsg);
      if (onScanError) {
        onScanError(errorMsg);
      }
      console.error('Scanner error:', err);
    }
  };

  const stopScanning = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        setIsScanning(false);
      } catch (err) {
        console.error('Error stopping scanner:', err);
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-center">
        {!isScanning ? (
          <Button 
            onClick={startScanning}
            className="bg-green-600 hover:bg-green-700 gap-2"
          >
            <Camera className="h-4 w-4" />
            Start Scanner
          </Button>
        ) : (
          <Button 
            onClick={stopScanning}
            variant="destructive"
            className="gap-2"
          >
            <CameraOff className="h-4 w-4" />
            Stop Scanner
          </Button>
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      <div 
        id={qrCodeRegionId} 
        className="w-full rounded-lg overflow-hidden"
        style={{ minHeight: isScanning ? '300px' : '0px' }}
      />
    </div>
  );
}
