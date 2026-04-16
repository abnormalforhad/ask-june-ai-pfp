import React, { useState, useRef } from 'react';
import { UploadCloud, Loader2, Download, RefreshCw, Sparkles } from 'lucide-react';

export default function Dropzone() {
  const [isHovering, setIsHovering] = useState(false);
  const [file, setFile] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'processing' | 'done'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsHovering(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsHovering(false);
  };

  const processFile = (selectedFile: File) => {
    if (!selectedFile.type.startsWith('image/')) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      setFile(e.target?.result as string);
      setStatus('processing');
      // Simulate Backend AI Processing
      setTimeout(() => {
        setStatus('done');
      }, 2500);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsHovering(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const handleDownload = () => {
    // Basic download anchor behavior matching the preview
    const link = document.createElement('a');
    link.href = file || '';
    link.download = 'AskJuneAI_PFP.png';
    link.click();
  };

  const resetProcess = () => {
    setFile(null);
    setStatus('idle');
  }

  return (
    <div className="glass-panel dropzone-container" style={{ position: 'relative', minHeight: '460px', display: 'flex', flexDirection: 'column' }}>
      
      {status === 'idle' && (
        <div 
          className="drop-area hover-glow"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          style={{
            flex: 1,
            border: `2px dashed ${isHovering ? 'var(--accent)' : 'rgba(255,255,255,0.15)'}`,
            borderRadius: '16px',
            background: isHovering ? 'rgba(0, 229, 255, 0.05)' : 'rgba(255,255,255,0.02)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            padding: '40px',
            textAlign: 'center'
          }}
        >
          <div style={{ width: '72px', height: '72px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px', transition: 'all 0.3s', transform: isHovering ? 'scale(1.05)' : 'scale(1)' }}>
            <UploadCloud size={32} className="text-accent" />
          </div>
          <h3 style={{ fontSize: '1.35rem', marginBottom: '8px', fontWeight: 600 }}>Select an Image</h3>
          <p className="text-muted" style={{ marginBottom: '32px', fontSize: '0.95rem', maxWidth: '80%' }}>Drag & drop your Avatar or click to browse files.</p>
          
          <button className="btn btn-ghost" style={{ border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.03)' }} onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>
            Browse Files
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleChange} 
            accept="image/*" 
            style={{ display: 'none' }} 
          />
        </div>
      )}

      {status === 'processing' && (
        <div className="animate-fade-in" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
          <div className="processing-image-wrapper" style={{ position: 'relative', width: '220px', height: '220px', borderRadius: '24px', overflow: 'hidden', marginBottom: '40px', boxShadow: '0 0 40px rgba(0, 229, 255, 0.2)' }}>
            <img src={file!} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.4, filter: 'blur(2px)' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(5, 13, 20, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Loader2 size={48} className="text-accent" style={{ animation: 'spin 1.5s linear infinite' }} />
            </div>
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '4px', background: 'rgba(255,255,255,0.1)' }}>
              <div style={{ height: '100%', width: '100%', background: 'var(--accent)', animation: 'progress 2.5s ease-in-out forwards', transformOrigin: 'left' }}></div>
            </div>
          </div>
          <h3 style={{ fontSize: '1.35rem', marginBottom: '12px', fontWeight: 600 }}>AI Processing...</h3>
          <p className="text-muted" style={{ fontSize: '0.95rem' }}>Generating intelligent tagline & composition.</p>
        </div>
      )}

      {status === 'done' && (
        <div className="animate-fade-in" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div 
            style={{ 
              position: 'relative', 
              width: '100%', 
              aspectRatio: '1/1', 
              borderRadius: '20px', 
              overflow: 'hidden', 
              marginBottom: '32px', 
              border: '2px solid rgba(0, 229, 255, 0.3)',
              boxShadow: '0 12px 40px rgba(0, 229, 255, 0.15)'
            }}
          >
            {/* The overlay composition representation */}
            <img src={file!} alt="Final PFP" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(0,229,255,0.2) 0%, transparent 60%)', mixBlendMode: 'overlay' }}></div>
            
            {/* Watermark/Branding */}
            <div style={{ position: 'absolute', top: '24px', right: '24px', background: 'rgba(5, 13, 20, 0.8)', backdropFilter: 'blur(8px)', padding: '6px 12px', borderRadius: '99px', fontSize: '10px', fontWeight: 600, color: 'var(--text-main)', border: '1px solid rgba(255,255,255,0.1)', textTransform: 'uppercase', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: 6, height: 6, background: 'var(--accent)', borderRadius: '50%' }}></div>
              Ask June AI
            </div>

            {/* AI Generated Tagline Overlay */}
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '40px 24px 24px', background: 'linear-gradient(to top, rgba(5,13,20,0.95) 0%, rgba(5,13,20,0.7) 40%, transparent 100%)' }}>
               <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)', padding: '8px 16px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 500, color: '#fff', border: '1px solid rgba(255,255,255,0.15)' }}>
                 <Sparkles size={14} className="text-accent" />
                 "Visionary Intelligence Architect"
               </div>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '16px', width: '100%' }}>
            <button className="btn btn-accent" style={{ flex: 1, padding: '16px' }} onClick={handleDownload}>
              <Download size={20} /> Download PFP
            </button>
            <button className="btn btn-ghost" onClick={resetProcess} style={{ padding: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <RefreshCw size={20} />
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
        @keyframes progress { 
          0% { transform: scaleX(0); } 
          50% { transform: scaleX(0.7); } 
          100% { transform: scaleX(1); } 
        }
        .hover-glow:hover {
          box-shadow: 0 0 24px rgba(0, 229, 255, 0.05) inset;
        }
        .text-accent { color: var(--accent); }
      `}</style>
    </div>
  );
}
