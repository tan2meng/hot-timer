
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { X, Camera, RefreshCw, AlertTriangle, Zap } from 'lucide-react';

interface ScannerModalProps {
  onScan: (data: string) => void;
  onClose: () => void;
}

const ScannerModal: React.FC<ScannerModalProps> = ({ onScan, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [needsPermission, setNeedsPermission] = useState(true);
  const isScanningRef = useRef(false);
  const streamRef = useRef<MediaStream | null>(null);
  const [isUiScanning, setIsUiScanning] = useState(false);
  const lastScanTimeRef = useRef<number>(0);

  const stopCamera = () => {
    isScanningRef.current = false;
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const tick = useCallback((time: number) => {
    if (!isScanningRef.current) return;

    if (videoRef.current?.readyState === 4) { // HAVE_ENOUGH_DATA
      const canvas = canvasRef.current;
      const video = videoRef.current;

      if (canvas && video) {
        if (time - lastScanTimeRef.current > 150) { // Scan every 150ms
          lastScanTimeRef.current = time;
          const context = canvas.getContext('2d', { willReadFrequently: true });
          if (context) {
            canvas.height = video.videoHeight;
            canvas.width = video.videoWidth;
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            
            const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
            
            // @ts-ignore
            const jsQR = window.jsQR;
            
            if (jsQR) {
              const code = jsQR(imageData.data, imageData.width, imageData.height, {
                inversionAttempts: 'attemptBoth',
              });

              if (code) {
                isScanningRef.current = false;
                setIsUiScanning(false);
                onScan(code.data);
                return; 
              }
            }
          }
        }
      }
    }
    requestAnimationFrame(tick);
  }, [onScan]);

  const startCamera = useCallback(async () => {
    setError(null);
    setNeedsPermission(false);
    setIsUiScanning(true);
    isScanningRef.current = true;
    
    // Stop any existing stream first
    if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError('您的浏览器不支持摄像头访问，请使用 Safari 或 Chrome。');
      setIsUiScanning(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
        requestAnimationFrame(tick);
      }
    } catch (err: any) {
      console.error('Camera access error:', err);
      setIsUiScanning(false);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setError('无法访问摄像头：权限被拒绝。\n请在浏览器设置中允许相机权限，然后点击下方重试。');
      } else if (err.name === 'NotFoundError') {
        setError('未找到摄像头设备。');
      } else if (err.name === 'NotReadableError') {
        setError('无法访问摄像头：设备可能被其他应用占用。');
      } else {
        setError('无法开启摄像头，请检查设备权限设置。');
      }
    }
  }, [tick]);

  useEffect(() => {
    return () => stopCamera();
  }, []);

  return (
    <div className="fixed inset-0 z-[120] bg-black flex flex-col items-center justify-center animate-fade-in">
      <header className="absolute top-0 w-full p-6 flex justify-between items-center z-10">
        <h2 className="text-white font-bold flex items-center gap-2">
            <Camera size={20} className="text-orange-500" />
            扫描店家食材库
        </h2>
        <button onClick={onClose} className="p-3 bg-white/10 rounded-full text-white backdrop-blur-md transition-transform active:scale-90">
          <X size={24} />
        </button>
      </header>

      <div className="relative w-full aspect-square max-w-sm border-2 border-white/20 rounded-[2rem] overflow-hidden shadow-2xl mx-6 bg-[#1c1917]">
        <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />
        <canvas ref={canvasRef} className="hidden" />
        
        {isUiScanning && !error && !needsPermission && (
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-0.5 bg-orange-500 shadow-[0_0_15px_#ea580c] animate-scan-line" />
                <div className="absolute inset-0 border-[40px] border-black/60" />
                <div className="absolute top-[40px] left-[40px] right-[40px] bottom-[40px] border-2 border-orange-500/50 rounded-lg shadow-inner" />
            </div>
        )}

        {needsPermission && !error && (
            <div className="absolute inset-0 bg-stone-900/90 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center z-20">
                <div className="w-20 h-20 bg-orange-500/20 rounded-full flex items-center justify-center mb-6 border border-orange-500/30">
                    <Zap size={32} className="text-orange-500" />
                </div>
                <h3 className="text-white text-xl font-black mb-3">准备开启摄像头</h3>
                <p className="text-white/60 mb-8 text-sm">点击下方按钮授权相机权限以扫描二维码</p>
                <button 
                  onClick={startCamera} 
                  className="flex items-center gap-2 px-10 py-4 bg-orange-600 rounded-2xl text-white font-black active:scale-95 transition-transform shadow-xl shadow-orange-900/40 text-lg"
                >
                    <Camera size={20} /> 开启扫描
                </button>
            </div>
        )}

        {error && (
            <div className="absolute inset-0 bg-stone-900 flex flex-col items-center justify-center p-8 text-center z-20">
                <AlertTriangle size={48} className="text-orange-500 mb-4" />
                <p className="text-white/90 mb-8 font-medium whitespace-pre-line leading-relaxed">{error}</p>
                <button 
                  onClick={startCamera} 
                  className="flex items-center gap-2 px-8 py-3.5 bg-orange-600 rounded-xl text-white font-bold active:scale-95 transition-transform shadow-lg shadow-orange-900/20"
                >
                    <RefreshCw size={18} /> 重试
                </button>
            </div>
        )}
      </div>

      <div className="mt-8 flex flex-col items-center gap-2 px-6 text-center">
        <p className="text-white/60 text-sm font-bold tracking-widest uppercase">
            {error ? '相机访问失败' : (needsPermission ? '等待授权' : '请将二维码置于框内')}
        </p>
      </div>
    </div>
  );
};

export default ScannerModal;
