
import React, { useState, Suspense, useCallback, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, PerspectiveCamera, Loader, Html } from '@react-three/drei';
import { EffectComposer, Bloom, Noise, Vignette } from '@react-three/postprocessing';
import { TreeState } from './types';
import LuxuryTree from './components/LuxuryTree';
import GestureManager from './components/GestureManager';
import MusicPlayer, { MusicPlayerHandle } from './components/MusicPlayer';
import { CAMERA_START_POS } from './constants';

const App: React.FC = () => {
  const [treeState, setTreeState] = useState<TreeState>(TreeState.FORMED);
  const [handPos, setHandPos] = useState({ x: 0, y: 0 });
  const [hasStarted, setHasStarted] = useState(false);
  const [userImages, setUserImages] = useState<string[]>([]);
  const musicRef = useRef<MusicPlayerHandle>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleGesture = useCallback((isOpen: boolean, position: { x: number; y: number }) => {
    setTreeState(isOpen ? TreeState.CHAOS : TreeState.FORMED);
    setHandPos(position);
  }, []);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      // Explicitly type 'file' as File to avoid inference errors
      const urls = Array.from(files).map((file: File) => URL.createObjectURL(file));
      setUserImages(prev => [...urls, ...prev].slice(0, 30)); 
    }
  };

  const startExperience = async () => {
    // Immediate call to unlock audio context for the Christmas song
    if (musicRef.current) {
      musicRef.current.play();
    }
    
    // Request camera for gesture control
    try {
      await navigator.mediaDevices.getUserMedia({ video: true });
    } catch (err) {
      console.warn("Camera access denied or skipped. Visuals will remain interactive via mouse/orbit.", err);
    }
    
    setHasStarted(true);
  };

  return (
    <div className="w-full h-screen bg-black">
      {!hasStarted ? (
        <div className="absolute inset-0 z-[100] flex flex-col items-center justify-center bg-[#043927] text-[#D4AF37]">
          <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent" />
          <h1 className="text-6xl md:text-8xl font-serif mb-4 drop-shadow-[0_5px_15px_rgba(0,0,0,0.5)] tracking-widest text-center px-4 uppercase italic">
            Grand Luxury
          </h1>
          <h2 className="text-2xl md:text-3xl font-serif mb-12 opacity-80 tracking-[0.5em] text-white">CHRISTMAS</h2>
          
          <button
            onClick={startExperience}
            className="relative group px-12 py-5 overflow-hidden bg-transparent border-2 border-[#D4AF37] text-[#D4AF37] font-bold text-xl rounded-sm transition-all shadow-2xl uppercase tracking-widest hover:text-[#043927]"
          >
            <span className="relative z-10">Enter the Gala</span>
            <div className="absolute inset-0 bg-[#D4AF37] transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300" />
          </button>
          
          <p className="mt-12 text-sm opacity-60 font-light tracking-wide max-w-md text-center">
            Cinematic 3D visuals. Hand gestures enabled.<br/>
            (Camera access requested for interactive physics)
          </p>
        </div>
      ) : (
        <>
          {/* UI Overlay */}
          <div className="absolute top-10 left-10 z-10 pointer-events-none">
            <h2 className="text-4xl font-serif text-[#D4AF37] tracking-widest drop-shadow-[0_2px_10px_rgba(212,175,55,0.4)] uppercase">
              Luxe Edition
            </h2>
            <div className="mt-3 h-[2px] w-48 bg-gradient-to-r from-[#D4AF37] to-transparent" />
          </div>

          <div className="absolute top-10 right-10 z-20 flex flex-col gap-4 items-end">
            <input 
              type="file" 
              ref={fileInputRef} 
              multiple 
              accept="image/*" 
              onChange={handleImageUpload} 
              className="hidden" 
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="px-6 py-2 bg-black/40 border border-[#D4AF37]/40 text-[#D4AF37] text-xs uppercase tracking-widest hover:bg-[#D4AF37] hover:text-[#043927] transition-all rounded-sm backdrop-blur-md shadow-lg"
            >
              Upload Your Memories
            </button>
            {userImages.length > 0 && (
              <div className="text-[10px] text-[#D4AF37]/60 tracking-widest bg-black/40 px-2 py-1 border border-[#D4AF37]/10">
                {userImages.length} CUSTOM TEXTURES LOADED
              </div>
            )}
          </div>

          <div className="absolute bottom-10 right-10 z-10 flex flex-col items-end gap-1 text-right pointer-events-none">
            <div className="text-[10px] uppercase tracking-[0.3em] text-[#D4AF37]/60">Atmosphere State</div>
            <div className={`text-2xl font-serif italic ${treeState === TreeState.CHAOS ? 'text-red-400' : 'text-[#D4AF37]'}`}>
              {treeState === TreeState.CHAOS ? 'Eternal Chaos' : 'Architectural Form'}
            </div>
          </div>

          {/* Interaction Tutorial */}
          <div className="absolute bottom-10 left-10 z-10 p-6 border border-[#D4AF37]/20 bg-black/60 backdrop-blur-xl rounded-sm max-w-xs shadow-2xl">
            <p className="text-[#D4AF37] text-xs uppercase tracking-[0.2em] mb-4 font-bold border-b border-[#D4AF37]/30 pb-2">Interaction Guide</p>
            <div className="space-y-3 text-white/80 text-[11px] leading-relaxed tracking-wider">
              <p><span className="text-[#D4AF37] font-bold">OPEN PALM:</span> Shatter the tree & Expand uploaded memories.</p>
              <p><span className="text-[#D4AF37] font-bold">CLOSE FIST:</span> Restore the emerald architectural form.</p>
              <p><span className="text-[#D4AF37] font-bold">MOTION:</span> Command the cinematic camera perspective.</p>
            </div>
          </div>

          {/* 3D Scene */}
          <Canvas shadows dpr={[1, 2]}>
            <PerspectiveCamera makeDefault position={CAMERA_START_POS} fov={45} />
            
            <Suspense fallback={<Html center><div className="text-[#D4AF37] text-xl tracking-[0.5em] animate-pulse uppercase font-serif">Refining Luxury...</div></Html>}>
              <Environment preset="lobby" />
              <ambientLight intensity={0.4} />
              <pointLight position={[10, 10, 10]} intensity={2} color="#D4AF37" />
              <spotLight position={[-15, 25, 15]} angle={0.2} penumbra={1} intensity={3} castShadow color="#FFFFFF" />

              <LuxuryTree treeState={treeState} handOffset={handPos} userImages={userImages} />

              <OrbitControls 
                enablePan={false} 
                maxDistance={40} 
                minDistance={8} 
                autoRotate={treeState === TreeState.FORMED} 
                autoRotateSpeed={0.4}
                makeDefault
              />

              <EffectComposer disableNormalPass>
                <Bloom luminanceThreshold={0.8} intensity={1.5} levels={8} mipmapBlur />
                <Noise opacity={0.03} />
                <Vignette eskil={false} offset={0.1} darkness={1.05} />
              </EffectComposer>
            </Suspense>
          </Canvas>

          <GestureManager onGesture={handleGesture} />
          <Loader />
        </>
      )}
      
      <MusicPlayer ref={musicRef} autoPlay />
    </div>
  );
};

export default App;
