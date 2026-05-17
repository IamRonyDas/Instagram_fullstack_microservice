import { useCallback, useEffect, useRef, useState } from 'react';
import './CameraCapture.css';

interface CameraCaptureProps {
  onCapture: (imageUrl: string) => void;
  onClose: () => void;
}

export default function CameraCapture({ onCapture, onClose }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
      } catch {
        if (!cancelled) {
          setError('Could not access camera. Check permissions or try gallery instead.');
        }
      }
    }

    startCamera();
    return () => {
      cancelled = true;
      stopStream();
    };
  }, [stopStream]);

  const handleCapture = () => {
    const video = videoRef.current;
    if (!video) return;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        stopStream();
        onCapture(url);
      },
      'image/jpeg',
      0.92
    );
  };

  return (
    <div className="camera-capture__backdrop" role="presentation">
      <div className="camera-capture" role="dialog" aria-modal="true" aria-label="Camera">
        <header className="camera-capture__header">
          <button type="button" className="camera-capture__close" onClick={onClose}>
            Cancel
          </button>
          <span>Camera</span>
          <span className="camera-capture__spacer" />
        </header>

        {error ? (
          <p className="camera-capture__error">{error}</p>
        ) : (
          <video ref={videoRef} className="camera-capture__video" playsInline muted autoPlay />
        )}

        <footer className="camera-capture__footer">
          <button
            type="button"
            className="camera-capture__shutter"
            onClick={handleCapture}
            disabled={Boolean(error)}
            aria-label="Take photo"
          />
        </footer>
      </div>
    </div>
  );
}
