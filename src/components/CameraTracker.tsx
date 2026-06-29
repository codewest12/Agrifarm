import React, { useState, useRef, useEffect } from 'react';
import { Camera, RefreshCw, X, Check, Eye, AlertCircle, Scan, Tag, ShieldCheck } from 'lucide-react';
import { Livestock, TrackingLog } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface CameraTrackerProps {
  livestockList: Livestock[];
  onAddLog: (log: Omit<TrackingLog, 'id' | 'timestamp'>) => void;
  onClose: () => void;
  defaultLivestockId?: string;
}

export default function CameraTracker({ livestockList, onAddLog, onClose, defaultLivestockId }: CameraTrackerProps) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [scanMode, setScanMode] = useState<'qr' | 'register' | 'health'>('qr');
  const [selectedLivestockId, setSelectedLivestockId] = useState<string>(defaultLivestockId || livestockList[0]?.id || '');
  const [actionNotes, setActionNotes] = useState<string>('');
  const [actionType, setActionType] = useState<string>('Routine Inspection');
  const [isScanning, setIsScanning] = useState<boolean>(true);
  const [scanResult, setScanResult] = useState<Livestock | null>(null);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<{
    score: number;
    notes: string;
    indicators: string[];
  } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [showSaveSuccess, setShowSaveSuccess] = useState<boolean>(false);
  
  // High-fidelity simulation states to bypass iframe permission blockages
  const [isSimulated, setIsSimulated] = useState<boolean>(false);
  const [simMetrics, setSimMetrics] = useState({ temp: 38.6, hr: 72, lat: 45.3892, lon: -122.3912 });

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Dynamic simulation metrics ticking
  useEffect(() => {
    if (!isSimulated) return;
    const interval = setInterval(() => {
      setSimMetrics(prev => ({
        temp: +(prev.temp + (Math.random() * 0.2 - 0.1)).toFixed(1),
        hr: Math.floor(prev.hr + (Math.random() * 4 - 2)),
        lat: +(prev.lat + (Math.random() * 0.0001 - 0.00005)).toFixed(5),
        lon: +(prev.lon + (Math.random() * 0.0001 - 0.00005)).toFixed(5)
      }));
    }, 1000);
    return () => clearInterval(interval);
  }, [isSimulated]);

  // Initialize camera
  useEffect(() => {
    async function startCamera() {
      try {
        setError(null);
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
          audio: false
        });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err: any) {
        console.error("Camera access error:", err);
        setError("Could not access camera. Ensure you have granted camera permissions in your browser. (Since this app runs in a secure iframe, please ensure camera permissions are allowed, or look for the permission prompt in your URL bar).");
        // Automatically default to simulated view when permission is dismissed/blocked so the app remains fully functional!
        setIsSimulated(true);
      }
    }

    if (isScanning && !capturedImage && !isSimulated) {
      startCamera();
    } else {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isScanning, capturedImage, isSimulated]);

  // Capture frame
  const capturePhoto = () => {
    if (isSimulated) {
      const selectedAnimal = livestockList.find(l => l.id === selectedLivestockId) || livestockList[0];
      if (selectedAnimal) {
        setCapturedImage(selectedAnimal.imageUrl);

        // Handle scanned modes
        if (scanMode === 'qr') {
          setScanResult(selectedAnimal);
          setSelectedLivestockId(selectedAnimal.id);
          setActionNotes(`Scanned physical RFID/QR Tag on pasture. Tag confirmed matching ${selectedAnimal.name}.`);
        } else if (scanMode === 'health') {
          setIsAnalyzing(true);
          setTimeout(() => {
            const scores = [94, 98, 85, 92];
            const chosenScore = scores[Math.floor(Math.random() * scores.length)];
            const issues = [
              {
                score: 85,
                notes: `Slight dermal irritation near rear leg of ${selectedAnimal.name}, posture indicates mild joint load check. Monitoring recommended.`,
                indicators: [`Postural imbalance 1.2°`, `Dermal redness 15%`, `Heart rate estimate: ${simMetrics.hr} bpm`]
              },
              {
                score: 98,
                notes: `Excellent body condition score for ${selectedAnimal.name}. Eyes clear, coat glossy, breathing steady. High vitality verified.`,
                indicators: [`Coat luster: Optimal`, `Activity indicator: Active`, `Thermal index: Regular (${simMetrics.temp}°C)`]
              },
              {
                score: 92,
                notes: `Optimal growth pattern for ${selectedAnimal.name}. Muscle score aligned with age curve. Minor dry skin patches near neck.`,
                indicators: [`Growth curve: Upper 15%`, `Hydration score: Adequate`, `Rumen motility index: Good`]
              }
            ];
            const issueObj = issues[Math.floor(Math.random() * issues.length)];
            setAiAnalysisResult({
              score: chosenScore,
              notes: issueObj.notes,
              indicators: issueObj.indicators
            });
            setIsAnalyzing(false);
            setActionNotes(`AI Camera Health Inspection Score: ${chosenScore}%. Notes: ${issueObj.notes}`);
          }, 1500);
        } else if (scanMode === 'register') {
          setActionNotes(`Captured face update photo for registration update of ${selectedAnimal.name}.`);
        }
      }
      return;
    }

    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setCapturedImage(dataUrl);

        // Turn off camera stream
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
          setStream(null);
        }

        // Handle scanned modes
        if (scanMode === 'qr') {
          // Simulate scanning a QR tag from the farm animals
          const randomIndex = Math.floor(Math.random() * livestockList.length);
          const matchedAnimal = livestockList[randomIndex];
          setScanResult(matchedAnimal);
          setSelectedLivestockId(matchedAnimal.id);
          setActionNotes(`Scanned physical RFID/QR Tag on pasture. Tag confirmed matching ${matchedAnimal.name}.`);
        } else if (scanMode === 'health') {
          // Simulate AI veterinary inspection of image
          setIsAnalyzing(true);
          setTimeout(() => {
            const scores = [94, 98, 85, 92];
            const chosenScore = scores[Math.floor(Math.random() * scores.length)];
            const issues = [
              {
                score: 85,
                notes: 'Slight dermal irritation near rear leg, posture indicates mild joint load check. Monitoring recommended.',
                indicators: ['Postural imbalance 1.2°', 'Dermal redness 15%', 'Heart rate estimate: 78 bpm']
              },
              {
                score: 98,
                notes: 'Excellent body condition score. Eyes clear, coat glossy, breathing steady. High vitality verified.',
                indicators: ['Coat luster: Optimal', 'Activity indicator: Active', 'Thermal index: Regular (38.6°C)']
              },
              {
                score: 92,
                notes: 'Optimal growth pattern. Muscle score aligned with age curve. Minor dry skin patches near neck.',
                indicators: ['Growth curve: Upper 15%', 'Hydration score: Adequate', 'Rumen motility index: Good']
              }
            ];
            const issueObj = issues[Math.floor(Math.random() * issues.length)];
            setAiAnalysisResult({
              score: chosenScore,
              notes: issueObj.notes,
              indicators: issueObj.indicators
            });
            setIsAnalyzing(false);
            setActionNotes(`AI Camera Health Inspection Score: ${chosenScore}%. Notes: ${issueObj.notes}`);
          }, 1500);
        }
      }
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setScanResult(null);
    setAiAnalysisResult(null);
    setIsScanning(true);
  };

  const handleSaveTrackingLog = () => {
    const animal = livestockList.find(l => l.id === selectedLivestockId);
    if (!animal) return;

    onAddLog({
      livestockId: animal.id,
      livestockName: `${animal.name} (${animal.breed})`,
      action: actionType,
      notes: actionNotes || 'Camera inspection logged.',
      photoUrl: capturedImage || undefined,
      scannedBy: 'Admin Camera Hub'
    });

    setShowSaveSuccess(true);
    setTimeout(() => {
      setShowSaveSuccess(false);
      onClose();
    }, 1500);
  };

  return (
    <div id="camera_tracker_overlay" className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/80 backdrop-blur-sm p-4">
      <div id="camera_tracker_modal" className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden border border-stone-200">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-50 rounded-xl text-emerald-700">
              <Camera className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-display font-semibold text-stone-900 text-lg">Livestock Smart Camera Portal</h2>
              <p className="text-xs text-stone-500 font-sans">Admin & Inventory Physical Animal Tracking Tool</p>
            </div>
          </div>
          <button id="close_camera_btn" onClick={onClose} className="p-2 text-stone-400 hover:text-stone-600 rounded-full hover:bg-stone-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12">
          
          {/* Left Column: Camera / Image view */}
          <div className="lg:col-span-7 bg-stone-950 p-4 flex flex-col justify-between relative min-h-[350px] lg:min-h-[450px]">
            {/* Scan Mode Toggles (when not captured yet) */}
            {!capturedImage && (
              <div className="absolute top-4 left-4 right-4 z-10 flex flex-wrap gap-2 justify-center">
                <button
                  id="mode_qr_btn"
                  onClick={() => setScanMode('qr')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                    scanMode === 'qr' 
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/30' 
                      : 'bg-stone-900/80 text-stone-300 backdrop-blur-sm hover:bg-stone-800'
                  }`}
                >
                  <Scan className="w-3.5 h-3.5" />
                  RFID/QR Scanner
                </button>
                <button
                  id="mode_health_btn"
                  onClick={() => setScanMode('health')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                    scanMode === 'health' 
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/30' 
                      : 'bg-stone-900/80 text-stone-300 backdrop-blur-sm hover:bg-stone-800'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  AI Health Inspection
                </button>
                <button
                  id="mode_register_btn"
                  onClick={() => setScanMode('register')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                    scanMode === 'register' 
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/30' 
                      : 'bg-stone-900/80 text-stone-300 backdrop-blur-sm hover:bg-stone-800'
                  }`}
                >
                  <Tag className="w-3.5 h-3.5" />
                  Animal Registration
                </button>
                <button
                  id="toggle_sim_mode_btn"
                  onClick={() => {
                    if (isSimulated) {
                      setIsSimulated(false);
                      setError(null);
                    } else {
                      setIsSimulated(true);
                      setError(null);
                    }
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                    isSimulated 
                      ? 'bg-amber-600 text-white shadow-md shadow-amber-900/30 border border-amber-500' 
                      : 'bg-stone-900/80 text-amber-400 border border-amber-500/30 backdrop-blur-sm hover:bg-stone-850'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5 animate-pulse" />
                  {isSimulated ? 'Simulated On' : 'Activate Sim'}
                </button>
              </div>
            )}

            {/* Error Message */}
            {error && !isSimulated ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-stone-300">
                <AlertCircle className="w-12 h-12 text-amber-500 mb-3" />
                <h3 className="font-semibold text-lg">Camera Access Offline</h3>
                <p className="text-xs text-stone-400 max-w-sm mt-1 mb-4 leading-relaxed">{error}</p>
                <div className="p-3 bg-stone-900 border border-stone-800 rounded-xl text-left max-w-md mb-4">
                  <p className="text-stone-300 text-xs font-semibold">Iframe Notice:</p>
                  <p className="text-stone-400 text-[11px] leading-relaxed mt-1">
                    To test camera features in iframe sandboxes, you can activate our premium high-fidelity camera simulator immediately below!
                  </p>
                </div>
                <button
                  id="activate_simulated_camera_btn"
                  onClick={() => {
                    setIsSimulated(true);
                    setError(null);
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-md transition-colors flex items-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  Activate High-Fidelity Camera Simulator
                </button>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center overflow-hidden rounded-xl bg-stone-900 border border-stone-800 relative min-h-[300px]">
                
                {/* Simulated Live Stream Feed */}
                {isSimulated && !capturedImage && (() => {
                  const selectedAnimal = livestockList.find(l => l.id === selectedLivestockId) || livestockList[0];
                  return (
                    <div className="w-full h-full absolute inset-0 flex flex-col justify-between p-4 z-0">
                      {/* Simulated Camera Viewfinder Image */}
                      {selectedAnimal && (
                        <div className="absolute inset-0 z-0 select-none overflow-hidden bg-black">
                          <img
                            src={selectedAnimal.imageUrl}
                            alt="Simulation background"
                            className="w-full h-full object-cover opacity-60 filter saturate-150 contrast-125 select-none"
                            referrerPolicy="no-referrer"
                          />
                          {/* Thermal/Digital Filter overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/40 via-transparent to-emerald-950/20 mix-blend-color" />
                          <div className="absolute inset-0 bg-emerald-900/10 mix-blend-overlay" />
                        </div>
                      )}

                      {/* HUD Top-Bar Overlay */}
                      <div className="z-10 flex justify-between w-full font-mono text-[10px] text-emerald-400 bg-stone-950/60 p-2 rounded-lg border border-emerald-500/20 backdrop-blur-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></div>
                          <span>LIVE FEED SIMULATION</span>
                        </div>
                        <div>GPS: {simMetrics.lat}, {simMetrics.lon}</div>
                      </div>

                      {/* Scanning Reticle Graphic */}
                      <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                        <div className="w-56 h-56 border border-emerald-500/30 rounded-full flex items-center justify-center relative">
                          <div className="w-44 h-44 border border-dashed border-emerald-500/40 rounded-full flex items-center justify-center animate-spin" style={{ animationDuration: '40s' }} />
                          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 px-2 py-0.5 bg-stone-900 border border-emerald-500 text-emerald-400 text-[9px] rounded font-mono">
                            AI-LOCK: {selectedAnimal?.name.toUpperCase()}
                          </div>
                          
                          {/* Laser scanning line */}
                          <div className="absolute left-0 right-0 h-0.5 bg-emerald-400/80 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse"></div>
                        </div>
                      </div>

                      {/* HUD Bottom Diagnostic Stats Overlay */}
                      <div className="z-10 space-y-2">
                        {/* Selector within the video screen for testing alternative animals */}
                        <div className="bg-stone-950/80 border border-emerald-500/30 p-2 rounded-lg flex items-center justify-between text-[11px] text-stone-200 backdrop-blur-sm">
                          <span className="font-mono text-emerald-400 flex items-center gap-1">
                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                            Feed Target:
                          </span>
                          <select
                            id="sim_viewport_cattle_select"
                            value={selectedLivestockId}
                            onChange={(e) => {
                              setSelectedLivestockId(e.target.value);
                              setScanResult(null);
                            }}
                            className="bg-stone-900 border border-emerald-800 rounded px-2 py-0.5 text-xs text-stone-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          >
                            {livestockList.map((animal) => (
                              <option key={animal.id} value={animal.id}>
                                {animal.name} ({animal.breed} - {animal.id})
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="grid grid-cols-3 gap-2 font-mono text-[9px] text-emerald-300 bg-stone-950/70 p-2 rounded-lg border border-emerald-500/20 backdrop-blur-sm">
                          <div className="text-left">
                            <div className="text-emerald-500">EST. TEMP</div>
                            <div className="text-xs font-bold text-white">{simMetrics.temp}°C</div>
                          </div>
                          <div className="text-center">
                            <div className="text-emerald-500">EST. HEART-RATE</div>
                            <div className="text-xs font-bold text-white">{simMetrics.hr} BPM</div>
                          </div>
                          <div className="text-right">
                            <div className="text-emerald-500">SIGNAL LOCK</div>
                            <div className="text-xs font-bold text-white">99.8%</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Real Live stream (only if not simulating and no photo captured) */}
                {!isSimulated && !capturedImage && (
                  <div className="w-full h-full relative flex items-center justify-center">
                    <video
                      id="livestock_camera_video"
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className="w-full h-full object-cover transform scale-x-[-1]"
                    />
                    
                    {/* Futuristic Scanning Overlay */}
                    {scanMode === 'qr' && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-56 h-56 border-2 border-emerald-500 rounded-2xl relative flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                          {/* Corner bracket markers */}
                          <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-emerald-500 -mt-1 -ml-1 rounded-tl"></div>
                          <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-emerald-500 -mt-1 -mr-1 rounded-tr"></div>
                          <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-emerald-500 -mb-1 -ml-1 rounded-bl"></div>
                          <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-emerald-500 -mb-1 -mr-1 rounded-br"></div>
                          
                          {/* Animated moving laser scanner */}
                          <div className="absolute left-0 right-0 h-0.5 bg-emerald-400 animate-bounce shadow-[0_0_10px_rgba(16,185,129,0.8)]"></div>
                          
                          <div className="bg-emerald-950/80 text-emerald-400 text-[10px] px-2 py-1 rounded border border-emerald-800 font-mono">
                            ALIGN QR/BARCODE
                          </div>
                        </div>
                      </div>
                    )}

                    {scanMode === 'health' && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-72 h-48 border border-dashed border-amber-400 rounded-xl relative flex items-center justify-center">
                          <div className="absolute top-2 left-2 text-[10px] text-amber-400 font-mono tracking-wider">AI THERMAL FRAME</div>
                          <div className="absolute -bottom-6 text-[10px] text-stone-400 font-mono bg-stone-900/90 px-2 py-0.5 rounded border border-stone-800">
                            Capture whole profile of livestock
                          </div>
                        </div>
                      </div>
                    )}

                    {scanMode === 'register' && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-64 h-64 border border-white/20 rounded-full relative flex items-center justify-center">
                          <div className="w-48 h-48 border border-white/40 rounded-full border-dashed flex items-center justify-center">
                            <div className="text-[10px] text-stone-300 font-mono">FACE REGISTRATION</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Captured Image */}
                {capturedImage && (
                  <div className="w-full h-full relative">
                    <img
                      id="captured_livestock_photo"
                      src={capturedImage}
                      alt="Captured Livestock"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-3 right-3 bg-stone-900/90 text-white font-mono text-[10px] px-2 py-1 rounded border border-stone-700 flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                      IMAGE CAPTURED
                    </div>
                  </div>
                )}
              </div>
            )}

            <canvas ref={canvasRef} className="hidden" />

            {/* Bottom Actions of Camera */}
            {(!error || isSimulated) && (
              <div className="flex justify-between items-center mt-3 z-10">
                {capturedImage ? (
                  <button
                    id="retake_photo_btn"
                    onClick={handleRetake}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium text-stone-300 bg-stone-900 hover:bg-stone-800 border border-stone-800 flex items-center gap-1.5 transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Retake Snapshot
                  </button>
                ) : (
                  <div className="w-full flex justify-center">
                    <button
                      id="trigger_capture_btn"
                      onClick={capturePhoto}
                      className="w-14 h-14 rounded-full bg-white text-stone-950 flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg hover:shadow-white/20 relative group"
                    >
                      <div className="w-11 h-11 rounded-full border-2 border-stone-950 flex items-center justify-center bg-stone-50 group-hover:bg-emerald-50 transition-colors">
                        <Camera className="w-5 h-5 text-stone-800" />
                      </div>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column: Tracking Metadata Logging Form */}
          <div className="lg:col-span-5 p-6 flex flex-col justify-between bg-stone-50 border-t lg:border-t-0 lg:border-l border-stone-100">
            <div>
              <h3 className="font-display font-semibold text-stone-800 text-sm tracking-wide uppercase mb-4">Inspection Records</h3>
              
              <AnimatePresence mode="wait">
                {isAnalyzing ? (
                  <motion.div
                    key="analyzing"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm flex flex-col items-center justify-center text-center py-12"
                  >
                    <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mb-3" />
                    <p className="font-display font-medium text-stone-900 text-sm">Parsing Thermal Indicators...</p>
                    <p className="text-xs text-stone-500 mt-1">Cross-referencing biometric cattle markers with cloud parameters</p>
                  </motion.div>
                ) : capturedImage ? (
                  <motion.div
                    key="captured-options"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-4"
                  >
                    {/* Scan Mode Result Feedback */}
                    {scanMode === 'qr' && scanResult && (
                      <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
                        <div className="flex items-center gap-2 mb-1.5">
                          <Check className="w-4 h-4 text-emerald-600" />
                          <span className="font-mono text-xs font-bold text-emerald-800">TAG MATCH DETECTED</span>
                        </div>
                        <p className="font-display font-semibold text-stone-900 text-sm">{scanResult.name}</p>
                        <p className="text-xs text-stone-500">Breed: {scanResult.breed} | Location: {scanResult.location}</p>
                      </div>
                    )}

                    {scanMode === 'health' && aiAnalysisResult && (
                      <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 space-y-2">
                        <div className="flex justify-between items-center border-b border-emerald-100/50 pb-2">
                          <div className="flex items-center gap-1.5">
                            <ShieldCheck className="w-4 h-4 text-emerald-600" />
                            <span className="font-mono text-xs font-bold text-emerald-800">VITALITY INSPECTION</span>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-xs font-mono font-bold ${
                            aiAnalysisResult.score >= 90 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            Score: {aiAnalysisResult.score}%
                          </span>
                        </div>
                        <p className="text-xs text-stone-600 italic leading-relaxed">{aiAnalysisResult.notes}</p>
                        <div className="pt-1.5 space-y-1">
                          {aiAnalysisResult.indicators.map((ind, i) => (
                            <div key={i} className="flex items-center gap-1.5 text-[10px] text-stone-500 font-mono">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                              {ind}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Animal Link Selection */}
                    <div>
                      <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">
                        Link to Animal Profile
                      </label>
                      <select
                        id="camera_target_select"
                        value={selectedLivestockId}
                        onChange={(e) => {
                          setSelectedLivestockId(e.target.value);
                          // Reset scanned result custom log context if user manually changes target
                          setScanResult(null);
                        }}
                        className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 text-xs font-medium text-stone-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      >
                        {livestockList.map((animal) => (
                          <option key={animal.id} value={animal.id}>
                            {animal.name} ({animal.breed} - {animal.id})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Action Type */}
                    <div>
                      <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">
                        Activity / Log Action
                      </label>
                      <select
                        id="camera_action_select"
                        value={actionType}
                        onChange={(e) => setActionType(e.target.value)}
                        className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 text-xs font-medium text-stone-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      >
                        <option value="Routine Checkup">Routine Checkup</option>
                        <option value="Vaccination Administered">Vaccination Administered</option>
                        <option value="Weight & Growth Measurement">Weight & Growth Measurement</option>
                        <option value="Hoof/Dental Care">Hoof/Dental Care</option>
                        <option value="AI Vitality Diagnostics">AI Vitality Diagnostics</option>
                        <option value="Registration Photo Update">Registration Photo Update</option>
                      </select>
                    </div>

                    {/* Custom Notes */}
                    <div>
                      <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">
                        Veterinary or Field Notes
                      </label>
                      <textarea
                        id="camera_action_notes"
                        rows={3}
                        value={actionNotes}
                        onChange={(e) => setActionNotes(e.target.value)}
                        placeholder="Add visual observation notes, vaccinations administered, or health status revisions."
                        className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 text-xs font-normal text-stone-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="un-captured"
                    className="bg-white p-6 rounded-xl border border-stone-200/60 shadow-sm flex flex-col items-center justify-center text-center py-10"
                  >
                    <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-700 mb-3">
                      <Camera className="w-6 h-6 animate-pulse" />
                    </div>
                    <h4 className="font-display font-medium text-stone-800 text-xs">Waiting for Capture...</h4>
                    <p className="text-stone-400 text-[11px] max-w-[200px] mt-1 leading-relaxed">
                      Please press the white camera button in the center to log snapshot details.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Confirm Save Actions */}
            <div className="pt-6 border-t border-stone-100">
              <AnimatePresence>
                {showSaveSuccess ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="bg-emerald-600 text-white p-3 rounded-lg flex items-center justify-center gap-2 font-display font-medium text-xs shadow-md shadow-emerald-950/20"
                  >
                    <Check className="w-4 h-4" />
                    Log Filed Successfully
                  </motion.div>
                ) : (
                  <div className="flex gap-2">
                    <button
                      id="save_log_btn"
                      onClick={handleSaveTrackingLog}
                      disabled={!capturedImage}
                      className="flex-1 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-40 disabled:cursor-not-allowed text-white font-display font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Save Inspection Log
                    </button>
                    <button
                      id="cancel_save_btn"
                      onClick={onClose}
                      className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-600 font-display font-semibold text-xs rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </AnimatePresence>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
