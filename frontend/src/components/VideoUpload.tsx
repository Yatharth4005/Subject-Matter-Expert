'use client';

import { useRef} from 'react';

interface VideoUploadProps {
  onUpload: (file: File) => void;
  disabled?: boolean;
}

export default function VideoUpload({ onUpload, disabled }: VideoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('video/')) {
      onUpload(file);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpload(file);
    }
  };

  return (
    <div
      className="video-upload"
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      onClick={() => inputRef.current?.click()}
      role="button"
      tabIndex={0}
      id="video-upload"
    >
      <input
        ref={inputRef}
        type="file"
        accept="video/*"
        onChange={handleChange}
        style={{ display: 'none' }}
        disabled={disabled}
      />
      <div className="video-upload__icon">📹</div>
      <p className="video-upload__text">
        Drag & drop a video or <span>browse</span>
      </p>
    </div>
  );
}
