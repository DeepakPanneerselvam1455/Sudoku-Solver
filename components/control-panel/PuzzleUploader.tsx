import React, { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { UploadIcon } from '../icons';

interface PuzzleUploaderProps {
  onImageParse: (file: File) => void;
  isLoading: boolean;
}

const PuzzleUploader: React.FC<PuzzleUploaderProps> = ({ onImageParse, isLoading }) => {
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

    const uploaderClassName = `puzzle-uploader ${dragActive ? 'drag-active' : ''}`;

    return (
        <div 
          onDragEnter={handleDrag} 
          onDragLeave={handleDrag} 
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={onButtonClick}
          className={uploaderClassName}
        >
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
              <div className="spinner" style={{width: 32, height: 32, margin: '0 auto 8px auto'}}></div>
              <p className="uploader-text">Analyzing Puzzle...</p>
            </div>
          ) : (
            <div className="uploader-content">
              <UploadIcon />
              <p className="uploader-text">
                <span>Click to upload</span> or drag and drop
              </p>
              <p className="uploader-subtext">PNG, JPG, or WEBP</p>
              {fileName && <p className="uploader-filename">File: {fileName}</p>}
            </div>
          )}
        </div>
    );
};

export default PuzzleUploader;
