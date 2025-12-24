
import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';

interface Props {
  autoPlay?: boolean;
}

export interface MusicPlayerHandle {
  play: () => void;
}

const MusicPlayer = forwardRef<MusicPlayerHandle, Props>(({ autoPlay }, ref) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentUrlIndex = useRef(0);

  // High-availability, diverse public domain Christmas sources
  const URLS = [
    "https://upload.wikimedia.org/wikipedia/commons/e/e0/We_Wish_You_a_Merry_Christmas_Instrumental.mp3",
    "https://ia800501.us.archive.org/1/items/JingleBells_711/JingleBells.mp3",
    "https://ia800904.us.archive.org/21/items/WeWishYouAMerryChristmas_561/WeWishYouAMerryChristmas.mp3",
    "https://www.chosic.com/wp-content/uploads/2021/11/We-Wish-You-A-Merry-Christmas.mp3"
  ];

  const initializeAudio = (index: number) => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.loop = true; // Essential: Never stop
      audioRef.current.crossOrigin = "anonymous";
      audioRef.current.preload = "auto";
      
      audioRef.current.addEventListener('canplaythrough', () => {
        if (autoPlay && !isPlaying) {
          audioRef.current?.play()
            .then(() => setIsPlaying(true))
            .catch(() => {
              // Browser likely blocked auto-play; manual trigger will catch this
            });
        }
      });

      audioRef.current.addEventListener('error', (e) => {
        console.warn(`Audio source ${index} failed to load. Error:`, e);
        handleFailure();
      });

      // Ensure looping even if browser logic hiccups
      audioRef.current.addEventListener('ended', () => {
        if (audioRef.current) {
          audioRef.current.currentTime = 0;
          audioRef.current.play().catch(console.error);
        }
      });
    }

    if (index < URLS.length) {
      audioRef.current.src = URLS[index];
      audioRef.current.load();
    }
  };

  const handleFailure = () => {
    if (currentUrlIndex.current < URLS.length - 1) {
      currentUrlIndex.current++;
      initializeAudio(currentUrlIndex.current);
      // If we were supposed to be playing, attempt to resume with the new source
      if (isPlaying) {
        audioRef.current?.play().catch(() => {});
      }
    }
  };

  useImperativeHandle(ref, () => ({
    play: () => {
      if (audioRef.current) {
        audioRef.current.volume = 0.5;
        audioRef.current.loop = true; // Re-verify loop
        audioRef.current.play()
          .then(() => {
            setIsPlaying(true);
            console.log("Christmas Atmosphere: Active & Looping.");
          })
          .catch(err => {
            console.warn("Direct play failed. Waiting for next interaction.", err);
          });
      }
    }
  }));

  useEffect(() => {
    initializeAudio(0);
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
        audioRef.current = null;
      }
    };
  }, []);

  return null;
});

export default MusicPlayer;
