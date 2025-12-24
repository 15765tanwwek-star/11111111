
import React, { useEffect, useRef } from 'react';

interface Props {
  onGesture: (isOpen: boolean, position: { x: number; y: number }) => void;
}

const GestureManager: React.FC<Props> = ({ onGesture }) => {
  const videoRef = useRef<HTMLVideoElement>(null!);
  const isDestroyed = useRef(false);

  useEffect(() => {
    isDestroyed.current = false;
    let camera: any = null;
    let hands: any = null;

    const setupHands = async () => {
      try {
        // Use the global Hands constructor from the CDN script
        hands = new (window as any).Hands({
          locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
        });

        hands.setOptions({
          maxNumHands: 1,
          modelComplexity: 1,
          minDetectionConfidence: 0.7,
          minTrackingConfidence: 0.7
        });

        hands.onResults((results: any) => {
          if (isDestroyed.current) return;
          
          if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            const landmarks = results.multiHandLandmarks[0];
            
            // Logic for hand open/close:
            // Check if fingertips (8, 12, 16, 20) are above the corresponding joints (6, 10, 14, 18)
            // Landmarks Y decreases as you go up in the frame
            const fingerCount = [8, 12, 16, 20].filter(index => {
              return landmarks[index].y < landmarks[index - 2].y;
            }).length;

            const isOpen = fingerCount >= 3; 
            
            // Normalize position for interaction [ -1 to 1 ]
            // Landmarks are 0 to 1. 0.5 is center.
            const posX = (landmarks[0].x - 0.5) * 2;
            const posY = (landmarks[0].y - 0.5) * 2;

            onGesture(isOpen, { x: posX, y: posY });
          }
        });

        if (videoRef.current) {
          camera = new (window as any).Camera(videoRef.current, {
            onFrame: async () => {
              if (isDestroyed.current || !hands) return;
              try {
                await hands.send({ image: videoRef.current });
              } catch (e) {
                console.error("MediaPipe send error:", e);
              }
            },
            width: 640,
            height: 480
          });
          
          await camera.start().catch((err: any) => {
            console.error("Camera start failed:", err);
            // This is often where PermissionDenied happens if not handled by platform
          });
        }
      } catch (err) {
        console.error("Gesture Manager Setup Error:", err);
      }
    };

    setupHands();

    return () => {
      isDestroyed.current = true;
      if (camera) {
        camera.stop();
      }
      if (hands) {
        hands.close();
      }
    };
  }, [onGesture]);

  return (
    <div className="fixed bottom-4 right-4 w-48 h-36 rounded-lg overflow-hidden border-2 border-[#D4AF37]/50 opacity-40 hover:opacity-100 transition-opacity bg-black shadow-2xl z-30">
      <video 
        ref={videoRef} 
        className="w-full h-full object-cover scale-x-[-1]" 
        playsInline 
        muted
      />
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none border border-white/10" />
      <div className="absolute bottom-1 right-1 px-1 bg-black/60 text-[8px] uppercase tracking-tighter text-[#D4AF37]">
        Gesture Input
      </div>
    </div>
  );
};

export default GestureManager;
