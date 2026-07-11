import { useEffect, useState, useCallback } from 'react';
import * as handPoseDetection from '@tensorflow-models/hand-pose-detection';
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';

export const useHandTracking = () => {
  const [detector, setDetector] = useState<handPoseDetection.HandDetector | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadModel = async () => {
      try {
        await tf.ready();
        // Try to set backend to WebGL, fallback to CPU if context lost
        try {
          await tf.setBackend('webgl');
        } catch (e) {
          console.warn("WebGL not available, falling back to CPU");
          await tf.setBackend('cpu');
        }

        const model = handPoseDetection.SupportedModels.MediaPipeHands;
        const detectorConfig: handPoseDetection.MediaPipeHandsTfjsModelConfig = {
          runtime: 'tfjs',
          modelType: 'full',
          maxHands: 2,
        };
        const newDetector = await handPoseDetection.createDetector(model, detectorConfig);
        setDetector(newDetector);
        setIsReady(true);
      } catch (err) {
        console.error("Error loading hand pose detector:", err);
        setError("Failed to load hand tracking model");
      }
    };

    loadModel();
  }, []);

  const detectHands = useCallback(async (video: HTMLVideoElement) => {
    if (!detector) return null;
    try {
      return await detector.estimateHands(video, {
        flipHorizontal: true,
      });
    } catch (err) {
      console.error("Detection Error:", err);
      // If WebGL context is lost, the detector might need recreation or backend switch
      return null;
    }
  }, [detector]);

  return { isReady, error, detectHands };
};
