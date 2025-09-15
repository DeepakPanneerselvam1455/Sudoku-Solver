import React, { useState, useRef, DragEvent, ChangeEvent, CSSProperties } from 'react';
import { UploadIcon } from './icons';

interface ImageUploaderProps {
  onImageParse: (file: File) => void;
  isLoading: boolean;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageParse, isLoading }) => {
    const [dragActive, setDragActive] = useState(false);
    const [fileName, setFileName] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);
  
    const handleFile = (file: File | null) => {
      if (file && file.type.startsWith('image/')) {
        setFileName(file.name);
        onImageParse(file);
      }
    };
  
    const handleDrag = (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.type === "dragenter" || e.type === "dragover") {
        setDragActive(true);
      } else if (e.type === "dragleave") {
        setDragActive(false);
      }
    };
  
    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleFile(e.dataTransfer.files[0]);
      }
    };
  
    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
      e.preventDefault();
      if (e.target.files && e.target.files[0]) {
        handleFile(e.target.files[0]);
      }
    };
  
    const onButtonClick = () => {
      inputRef.current?.click();
    };

    const uploaderStyle: CSSProperties = {
        position: 'relative',
        width: '100%',
        padding: '24px',
        border: `2px dashed ${dragActive ? '#3b82f6' : '#4b5563'}`,
        borderRadius: '8px',
        textAlign: 'center',
        cursor: 'pointer',
        transition: 'border-color 0.3s, background-color 0.3s',
        backgroundColor: dragActive ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
    };

    const textStyle: CSSProperties = {
        color: '#d1d5db'
    };
    
    const keyframes = `
        @keyframes spin {
            to {
                transform: rotate(360deg);
            }
        }
    `;

    const spinnerStyle: CSSProperties = {
        width: 32,
        height: 32,
        margin: '0 auto 8px auto',
        border: '4px solid #3b82f6',
        borderTopColor: 'transparent',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
    };

    return (
        <div 
          onDragEnter={handleDrag} 
          onDragLeave={handleDrag} 
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={onButtonClick}
          style={uploaderStyle}
        >
          <style>{keyframes}</style>
          <input
            ref={inputRef}
            type="file"
            style={{ display: 'none' }}
            accept="image/*"
            onChange={handleChange}
            disabled={isLoading}
          />
          {isLoading ? (
            <div>
              <div style={spinnerStyle}></div>
              <p style={textStyle}>Analyzing Puzzle...</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <UploadIcon style={{ width: 40, height: 40, color: '#6b7280' }} />
              <p style={textStyle}>
                <span style={{ fontWeight: '600', color: '#60a5fa' }}>Click to upload</span> or drag and drop
              </p>
              <p style={{ fontSize: '12px', color: '#9ca3af' }}>PNG, JPG, or WEBP</p>
              {fileName && <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: 8 }}>File: {fileName}</p>}
            </div>
          )}
        </div>
    );
};

export default ImageUploader;
