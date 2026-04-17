import { useRef, useState } from 'react';
import { X, Camera } from 'lucide-react';

interface PhotoUploadProps {
  onPhotoSelected: (base64: string) => void;
  selectedPhoto: string | null;
  onClear: () => void;
}

export default function PhotoUpload({ onPhotoSelected, selectedPhoto, onClear }: PhotoUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    
    // Read and compress standard to Base64
    const reader = new FileReader();
    reader.onload = (e) => {
      onPhotoSelected(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files?.[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div className="glass-panel">
      <div className="glass-panel-header">
        <h2 className="glass-panel-title">
          <div className="number-badge">1</div>
          Upload Photo
        </h2>
      </div>

      {!selectedPhoto ? (
        <div 
          className={`upload-zone ${isDragOver ? 'drag-active' : ''}`}
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={(e) => { e.preventDefault(); setIsDragOver(false); }}
          onDrop={handleDrop}
        >
          <div className="upload-icon">
            <Camera size={28} />
          </div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '8px' }}>Choose your base photo</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '16px' }}>
            Drag and drop or click to browse
          </p>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Supports JPG, PNG, WEBP max 10MB
          </p>
        </div>
      ) : (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <div className="upload-preview">
            <img src={selectedPhoto} alt="Uploaded base" />
            <button className="upload-clear-btn" onClick={onClear} title="Remove photo">
              <X size={16} />
            </button>
          </div>
          <h3 style={{ margin: '24px 0 8px', fontSize: '1.1rem' }}>Looking good!</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Now pick your fashion items below.
          </p>
        </div>
      )}

      <input 
        type="file" 
        accept="image/*" 
        style={{ display: 'none' }} 
        ref={fileInputRef}
        onChange={handleChange}
      />
    </div>
  );
}
