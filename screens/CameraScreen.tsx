import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';

export const CameraScreen: React.FC = () => {
  const navigate = useNavigate();
  const { settings } = useSettings();
  const [isRecording, setIsRecording] = useState(false);
  const [speed, setSpeed] = useState(0.0);
  const [displaySpeed, setDisplaySpeed] = useState(0.0);
  
  // Camera State
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasCamera, setHasCamera] = useState(false);
  const prevFrameRef = useRef<Uint8ClampedArray | null>(null);

  // Initialize Camera
  useEffect(() => {
    let stream: MediaStream | null = null;

    const startCamera = async () => {
      // Check if browser supports media devices
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { 
              facingMode: 'environment', // Prefer back camera
              width: { ideal: 640 }, // Lower res is sufficient for motion analysis and saves battery
              height: { ideal: 480 },
              frameRate: { ideal: 30 }
            },
            audio: false,
          });
          
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            // Ensure video plays (sometimes needed on mobile)
            videoRef.current.onloadedmetadata = () => {
              videoRef.current?.play().catch(e => console.log("Auto-play prevented", e));
              setHasCamera(true);
            };
          }
        } catch (err) {
          console.error("Camera access denied or unavailable:", err);
          setHasCamera(false);
        }
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Optical Flow / Motion Detection Logic
  useEffect(() => {
    if (!hasCamera) return;
    
    let animationFrameId: number;
    let lastProcessTime = 0;
    const PROCESS_INTERVAL = 50; // Process every 50ms (~20fps)

    const processMotion = (timestamp: number) => {
      if (timestamp - lastProcessTime < PROCESS_INTERVAL) {
        animationFrameId = requestAnimationFrame(processMotion);
        return;
      }
      lastProcessTime = timestamp;

      if (videoRef.current && canvasRef.current && videoRef.current.readyState === 4) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        
        if (ctx) {
          // Downsample for performance analysis
          const w = 32;
          const h = 24;
          
          if (canvas.width !== w) canvas.width = w;
          if (canvas.height !== h) canvas.height = h;

          ctx.drawImage(video, 0, 0, w, h);
          
          try {
            const imageData = ctx.getImageData(0, 0, w, h);
            const data = imageData.data;
            
            if (prevFrameRef.current) {
              let totalDiff = 0;
              const prev = prevFrameRef.current;
              
              // Calculate pixel difference (Simple Frame Differencing)
              // We check every pixel's Green channel (good proxy for luminance)
              for (let i = 0; i < data.length; i += 4) {
                 const diff = Math.abs(data[i+1] - prev[i+1]);
                 totalDiff += diff;
              }
              
              const pixelCount = w * h;
              const avgDiff = totalDiff / pixelCount;
              
              // Map avgDiff (0-255) to Speed unit
              // Sensitivity: Default 85 maps to approx 1.0x multiplier
              // Higher sensitivity means smaller movements register as higher speed
              const sensitivityMult = (settings.sensitivity / 85) * 4.0; 
              
              // Non-linear mapping to suppress noise and accentuate fast motion
              let rawSpeed = Math.pow(avgDiff, 1.3) * sensitivityMult;
              
              // Apply low-pass filter to smooth out the jitter
              setSpeed(prevSpeed => {
                 const smoothing = 0.1; // 10% new value, 90% old value
                 const newSpeed = (prevSpeed * (1 - smoothing)) + (rawSpeed * smoothing);
                 // Threshold to cut off sensor noise
                 return newSpeed > 0.8 ? newSpeed : 0;
              });
            }
            
            // Store current frame
            prevFrameRef.current = new Uint8ClampedArray(data);
          } catch (e) {
            // Context lost or generic canvas error
            console.debug("Frame processing error", e);
          }
        }
      }
      animationFrameId = requestAnimationFrame(processMotion);
    };

    animationFrameId = requestAnimationFrame(processMotion);

    return () => cancelAnimationFrame(animationFrameId);
  }, [hasCamera, settings.sensitivity]);

  // Fallback Simulation (Only runs if NO camera)
  useEffect(() => {
    if (hasCamera) return;

    // Initialize random start speed
    setSpeed(45);

    const interval = setInterval(() => {
      setSpeed(prev => {
        // Random walk
        const change = (Math.random() - 0.5) * 5;
        let newSpeed = prev + change;
        // Clamp
        if (newSpeed < 0) newSpeed = 0;
        if (newSpeed > 99) newSpeed = 99;
        return newSpeed;
      });
    }, 200);
    return () => clearInterval(interval);
  }, [hasCamera]);

  // Convert speed based on settings
  useEffect(() => {
    let finalSpeed = speed;
    if (settings.unit === 'MPH') {
      finalSpeed = speed * 0.621371;
    }
    setDisplaySpeed(finalSpeed);
  }, [speed, settings.unit]);

  const formatSpeed = (val: number) => {
    // If high precision is on, use 2 decimals, else 1
    const digits = settings.highPrecision ? 2 : 1;
    return val.toFixed(digits);
  };

  const speedParts = formatSpeed(displaySpeed).split('.');
  const speedInt = speedParts[0];
  const speedDec = speedParts[1];

  return (
    <div className="relative h-[100dvh] w-full flex flex-col justify-between bg-background-dark overflow-hidden font-display select-none">
      {/* Background Feed */}
      <div className="absolute inset-0 z-0 bg-black">
        {/* Hidden Canvas for Motion Processing */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Fallback Image (shown if no camera) */}
        <img 
          alt="Live camera feed fallback" 
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${hasCamera ? 'opacity-0' : 'opacity-80'}`} 
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuAexQ2sUgp7JBhaScojQlU_6nVZpSgXVfhjrRZxexJIm4Bg3wpaSWwLujnXt06XGeIyA_MIOft5bfbBrtqMsQpkplMr47mIh0ybI3hprlMBNIkbp_C2JNLzUHsTlaxY8I6rWGpqPNyosDUjpWY_jzkyYJDmQexjdXF_5DCiPo6P5vWKQTKWvZrbYF81HWy10P426FkYdGiNPYXwrUkWAUpx_hk1u-FnalxMsl3LzatZY8RKPEMGVpHD0lXuWz6ANDyx4IJNp65_ZK8" 
        />
        
        {/* Live Video Feed */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${hasCamera ? 'opacity-100' : 'opacity-0'}`}
        />

        <div className="absolute inset-0 camera-overlay pointer-events-none"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between px-6 pt-12 pb-4 safe-top">
        <button className="flex items-center justify-center size-10 rounded-full bg-black/20 backdrop-blur-md border border-white/10 text-white/80 hover:bg-white/10 hover:text-white transition active:scale-95">
          <span className="material-symbols-outlined text-[20px]">flash_on</span>
        </button>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/20 backdrop-blur-md border border-white/5">
          <div className={`size-1.5 rounded-full ${hasCamera ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></div>
          <span className="text-[10px] font-bold tracking-widest text-white/90">
            {hasCamera ? 'OPTICAL TRACKING' : 'SIMULATION MODE'}
          </span>
        </div>
        <button 
          onClick={() => navigate('/settings')}
          className="flex items-center justify-center size-10 rounded-full bg-black/20 backdrop-blur-md border border-white/10 text-white/80 hover:bg-white/10 hover:text-white transition active:scale-95"
        >
          <span className="material-symbols-outlined text-[20px]">settings</span>
        </button>
      </div>

      {/* Main Reticle */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center pointer-events-none">
        <div className={`relative w-72 h-48 border border-white/10 rounded-2xl flex flex-col items-center justify-end mb-8 transition-all duration-500 ${settings.stabilization ? 'shadow-[0_0_50px_rgba(13,127,242,0.1)]' : ''}`}>
          <div className="reticle-corner top-0 left-0 border-t-2 border-l-2 rounded-tl-lg"></div>
          <div className="reticle-corner top-0 right-0 border-t-2 border-r-2 rounded-tr-lg"></div>
          <div className="reticle-corner bottom-0 left-0 border-b-2 border-l-2 rounded-bl-lg"></div>
          <div className="reticle-corner bottom-0 right-0 border-b-2 border-r-2 rounded-br-lg"></div>
          
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-1 bg-white/80 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.8)]"></div>
          
          {settings.autoDetect && (
             <div className="mb-4 flex items-center gap-1.5 px-2 py-1 rounded bg-black/30 backdrop-blur-sm border border-white/5 animate-pulse">
                <span className="material-symbols-outlined text-[14px] text-primary">directions_car</span>
                <span className="text-[10px] font-bold tracking-wider text-white/90">CAR MODE</span>
             </div>
          )}
        </div>

        <div className="flex flex-col items-center drop-shadow-2xl">
          <div className="flex items-baseline leading-none">
            <span className="text-[7rem] font-medium tracking-tighter text-white">{speedInt}</span>
            <span className="text-4xl font-light text-white/70 ml-1">.{speedDec}</span>
          </div>
          <h2 className="text-sm font-bold text-primary tracking-[0.3em] uppercase mt-2 bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
             {settings.unit === 'KMH' ? 'KM/H' : 'MPH'} Detected
          </h2>
        </div>
      </div>

      {/* Stats & Controls */}
      <div className="relative z-10 px-8 pb-10 pt-4 w-full flex flex-col gap-8 safe-bottom">
        {/* Stats Row */}
        <div className="flex items-center justify-center gap-8 border-t border-white/10 pt-4 w-full max-w-xs mx-auto">
          <div className="flex flex-col items-center gap-1">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Max</span>
            <span className="text-lg font-bold text-white leading-none">62</span>
          </div>
          <div className="w-px h-8 bg-gradient-to-b from-transparent via-white/20 to-transparent"></div>
          <div className="flex flex-col items-center gap-1">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Avg</span>
            <span className="text-lg font-bold text-white leading-none">45</span>
          </div>
          <div className="w-px h-8 bg-gradient-to-b from-transparent via-white/20 to-transparent"></div>
          <div className="flex flex-col items-center gap-1">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Dist</span>
            <span className="text-lg font-bold text-white leading-none">1.2<span className="text-[10px] ml-0.5 text-gray-400">km</span></span>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-between w-full max-w-sm mx-auto">
          <button className="group flex flex-col items-center justify-center size-12 rounded-full text-white/60 hover:text-white hover:bg-white/5 transition">
            <span className="material-symbols-outlined text-[26px] group-hover:scale-110 transition-transform">tune</span>
          </button>
          
          <div className="relative -mt-2">
            <button 
              onClick={() => setIsRecording(!isRecording)}
              className="relative group cursor-pointer touch-manipulation"
            >
              <div className={`absolute inset-0 bg-primary rounded-full blur-xl opacity-30 transition-opacity duration-500 ${isRecording ? 'opacity-80 animate-pulse-slow' : 'group-hover:opacity-50'}`}></div>
              <div className="relative size-20 bg-white rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(0,0,0,0.3)] active:scale-95 transition-all duration-200">
                <div className={`size-7 rounded-[4px] bg-primary transition-all duration-300 ${isRecording ? 'rounded-[2px] scale-75' : ''}`}></div>
                <div className="absolute inset-1 rounded-full border-2 border-gray-100 opacity-50"></div>
              </div>
            </button>
            {isRecording && (
              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap">
                <span className="text-[9px] font-bold tracking-[0.2em] text-white/50 animate-pulse">RECORDING</span>
              </div>
            )}
          </div>

          <button 
            onClick={() => navigate('/history')}
            className="group flex flex-col items-center justify-center size-12 rounded-full text-white/60 hover:text-white hover:bg-white/5 transition"
          >
            <span className="material-symbols-outlined text-[26px] group-hover:scale-110 transition-transform">history</span>
          </button>
        </div>
      </div>
    </div>
  );
};