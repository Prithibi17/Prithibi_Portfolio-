import React, { useRef, useEffect, useState } from 'react';
import { useHandTracking } from '../hooks/useHandTracking';
import { handStore } from '../state/handStore';

export const HandTrackingOverlay: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { isReady, detectHands, error } = useHandTracking();
  const [isCameraActive, setIsCameraActive] = useState(false);

  useEffect(() => {
    const setupCamera = async () => {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { width: 640, height: 480 },
            audio: false,
          });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.onloadedmetadata = () => {
              videoRef.current?.play();
              setIsCameraActive(true);
            };
          }
        } catch (err) {
          console.error("Error accessing webcam:", err);
        }
      }
    };

    setupCamera();
  }, []);

  useEffect(() => {
    let animationId: number;

    const processHands = (hands: any[] | null) => {
      const allKeypoints: any[] = [];
      let isPinching = false;
      let pinchPosition: { x: number; y: number; z: number } | null = null;
      let handDistance = 0;
      let handCenter: { x: number; y: number; z: number } | null = null;
      let isTwoHandMode = false;

      if (hands && hands.length > 0) {
        hands.forEach(hand => {
          if (hand.keypoints) {
            allKeypoints.push(hand.keypoints);
          }
        });

        const getPinchData = (hand: any) => {
          if (!hand.keypoints) return null;
          const thumb = hand.keypoints.find((k: any) => k.name === 'thumb_tip');
          const index = hand.keypoints.find((k: any) => k.name === 'index_finger_tip');
          if (thumb && index) {
            const dist = Math.sqrt(Math.pow(thumb.x - index.x, 2) + Math.pow(thumb.y - index.y, 2));
            return { 
              isPinching: dist < 40, 
              pos: { 
                x: (thumb.x + index.x) / 2, 
                y: (thumb.y + index.y) / 2, 
                z: (thumb.z + index.z) / 2 || 0 
              } 
            };
          }
          return null;
        };

        const hand1 = hands[0];
        const pinch1 = getPinchData(hand1);

        if (pinch1) {
          isPinching = pinch1.isPinching;
          pinchPosition = pinch1.pos;
          handCenter = pinch1.pos;
        }

        if (hands.length >= 2) {
          const hand2 = hands[1];
          const pinch2 = getPinchData(hand2);

          if (pinch1 && pinch2) {
            isTwoHandMode = true;
            handDistance = Math.sqrt(
              Math.pow(pinch1.pos.x - pinch2.pos.x, 2) +
              Math.pow(pinch1.pos.y - pinch2.pos.y, 2)
            );
            handCenter = {
              x: (pinch1.pos.x + pinch2.pos.x) / 2,
              y: (pinch1.pos.y + pinch2.pos.y) / 2,
              z: (pinch1.pos.z + pinch2.pos.z) / 2
            };
          }
        }

        handStore.update({
          hands,
          pinchPosition,
          isPinching,
          handDistance,
          handCenter,
          isTwoHandMode,
          rawKeypoints: allKeypoints
        });
      } else {
        handStore.update({
          hands: [],
          pinchPosition: null,
          isPinching: false,
          handDistance: 0,
          handCenter: null,
          isTwoHandMode: false,
          rawKeypoints: null
        });
      }
    };

    const drawHands = (hands: any[] | null) => {
      if (!canvasRef.current) return;
      const ctx = canvasRef.current.getContext('2d');
      if (!ctx) return;
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

      if (hands && hands.length > 0) {
        hands.forEach((hand) => {
          if (!hand.keypoints) return;
          const connections = [
            [0,1],[1,2],[2,3],[3,4], // thumb
            [0,5],[5,6],[6,7],[7,8], // index
            [0,9],[9,10],[10,11],[11,12], // middle
            [0,13],[13,14],[14,15],[15,16], // ring
            [0,17],[17,18],[18,19],[19,20], // pinky
            [0,5],[5,9],[9,13],[13,17],[17,0] // palm
          ];

          ctx.strokeStyle = '#00f2ff';
          ctx.lineWidth = 2;
          ctx.beginPath();
          connections.forEach(([i, j]) => {
            const start = hand.keypoints[i];
            const end = hand.keypoints[j];
            if (start && end) {
              ctx.moveTo(start.x, start.y);
              ctx.lineTo(end.x, end.y);
            }
          });
          ctx.stroke();

          hand.keypoints.forEach((keypoint: any, idx: number) => {
            ctx.fillStyle = [4, 8, 12, 16, 20].includes(idx) ? '#ffea00' : '#00f2ff';
            ctx.beginPath();
            ctx.arc(keypoint.x, keypoint.y, 3, 0, 2 * Math.PI);
            ctx.fill();
          });
        });
      }
    };

    const runDetection = async () => {
      try {
        if (isReady && videoRef.current && canvasRef.current && isCameraActive) {
          const handsData = await detectHands(videoRef.current);
          processHands(handsData);
          drawHands(handsData);
        }
      } catch (err) {
        console.error("Tracking Error:", err);
      }
      animationId = requestAnimationFrame(runDetection);
    };

    runDetection();

    return () => cancelAnimationFrame(animationId);
  }, [isReady, isCameraActive, detectHands]);

  return (
    <div className="relative w-full h-full overflow-hidden bg-black">
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover scale-x-[-1]"
        playsInline
      />
      <canvas
        ref={canvasRef}
        width={640}
        height={480}
        className="absolute inset-0 w-full h-full object-cover scale-x-[-1]"
      />
      {!isReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 text-hologram-blue text-[10px] tracking-widest animate-pulse">
          LOADING AI MODULE...
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-900/20 text-red-500 text-[10px] tracking-widest">
          ERROR: {error}
        </div>
      )}
    </div>
  );
};
