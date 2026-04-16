import React, { useState, useRef, useCallback } from 'react';
import { Upload, Loader2, Download, RefreshCw, ArrowRight, Check, X, Share2, Sparkles, Wand2 } from 'lucide-react';
import { generatePFP } from '../utils/canvasBuilder';

interface PfpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Step = 'upload' | 'processing' | 'done';

const STYLES = [
  { id: 'style1', name: 'Symbol Default', thumbnail: 'rgba(0, 229, 255, 0.15)' },
  { id: 'style2', name: 'Neural Ribbon', thumbnail: '#FFFFFF' },
  { id: 'style3', name: 'Dark Theme', thumbnail: 'rgba(5, 13, 20, 0.4)' },
  { id: 'style4', name: 'Cyan Frame', thumbnail: 'transparent' },
  { id: 'style5', name: 'Minimalist', thumbnail: 'transparent' }
];

export default function PfpModal({ isOpen, onClose }: PfpModalProps) {
  const [step, setStep] = useState<Step>('upload');
  
  // Base raw image (either uploaded or generated from AI)
  const [rawImageUrl, setRawImageUrl] = useState<string | null>(null);
  
  // Prompt for AI generation
  const [prompt, setPrompt] = useState('');
  const [isGeneratingAiImage, setIsGeneratingAiImage] = useState(false);
  const [generationMode, setGenerationMode] = useState<'ai' | 'upload'>('ai');

  // Result state
  const [result, setResult] = useState<{ image: string; tagline: string; styleId: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [activeStyle, setActiveStyle] = useState<string>('style1');
  const [isRegeneratingStyle, setIsRegeneratingStyle] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetAll = useCallback(() => {
    setStep('upload');
    setRawImageUrl(null);
    setResult(null);
    setError(null);
    setIsDragOver(false);
    setActiveStyle('style1');
    setPrompt('');
  }, []);

  const handleClose = useCallback(() => {
    resetAll();
    onClose();
  }, [onClose, resetAll]);

  // Handle manual upload
  const handleFile = useCallback((selectedFile: File) => {
    if (!selectedFile.type.startsWith('image/')) return;
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File size must be under 10MB.');
      return;
    }
    setError(null);
    const reader = new FileReader();
    reader.onload = (e) => setRawImageUrl(e.target?.result as string);
    reader.readAsDataURL(selectedFile);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
  }, [handleFile]);

  // Generate Base Image using June AI
  const handleAIGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt to generate an image.');
      return;
    }
    
    setIsGeneratingAiImage(true);
    setError(null);
    
    try {
      const res = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate image');
      
      setRawImageUrl(data.url);
    } catch (err: any) {
      console.error('AI Gen Error:', err);
      setError(err.message || 'AI Generation failed');
    } finally {
      setIsGeneratingAiImage(false);
    }
  };

  // Process the final PFP (gets tagline + composites canvas)
  const processFinalPFP = useCallback(async (styleId: string, isStyleChange = false) => {
    if (!rawImageUrl) return;
    
    if (isStyleChange) {
      setIsRegeneratingStyle(true);
    } else {
      setStep('processing');
    }
    setError(null);

    try {
      // 1. Get tagline
      let currentTagline = result?.tagline;
      if (!currentTagline) {
        const tagRes = await fetch('/api/generate-tagline', { method: 'POST' });
        const tagData = await tagRes.json();
        currentTagline = tagData.tagline;
      }

      // 2. Build canvas composite on frontend
      const base64Pfp = await generatePFP(rawImageUrl, currentTagline!, styleId);

      setResult({ image: base64Pfp, tagline: currentTagline!, styleId });
      setActiveStyle(styleId);
      
      if (!isStyleChange) {
        setStep('done');
      }
    } catch (err: any) {
      console.error('Processing failed:', err);
      setError(err.message || 'Failed to process PFP. Please try again.');
      if (!isStyleChange) setStep('upload');
    } finally {
      if (isStyleChange) setIsRegeneratingStyle(false);
    }
  }, [rawImageUrl, result?.tagline]);

  const handleDownload = useCallback(() => {
    if (!result) return;
    const link = document.createElement('a');
    link.href = result.image;
    link.download = `AskJuneAI_PFP_${Date.now()}.png`;
    link.click();
  }, [result]);

  if (!isOpen) return null;

  const stepIndex = step === 'upload' ? 0 : step === 'processing' ? 1 : 2;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal animate-in" onClick={(e) => e.stopPropagation()} style={{ maxWidth: step === 'done' ? '700px' : '580px', padding: step === 'done' ? '30px' : '40px' }}>
        
        {step !== 'done' ? (
          <div className="stepper">
            <div className="stepper-step">
              <div className={`stepper-circle ${stepIndex >= 0 ? (stepIndex > 0 ? 'done' : 'active') : ''}`}>
                {stepIndex > 0 ? <Check size={14} /> : '1'}
              </div>
              <span className={`stepper-label ${stepIndex === 0 ? 'active' : ''}`}>Creation</span>
            </div>
            <div className={`stepper-line ${stepIndex > 0 ? 'done' : ''}`} />
            <div className="stepper-step">
              <div className={`stepper-circle ${stepIndex >= 1 ? (stepIndex > 1 ? 'done' : 'active') : ''}`}>
                {stepIndex > 1 ? <Check size={14} /> : '2'}
              </div>
              <span className={`stepper-label ${stepIndex === 1 ? 'active' : ''}`}>Process</span>
            </div>
            <div className={`stepper-line ${stepIndex > 1 ? 'done' : ''}`} />
            <div className="stepper-step">
              <div className={`stepper-circle ${stepIndex >= 2 ? 'active' : ''}`}>3</div>
              <span className={`stepper-label ${stepIndex === 2 ? 'active' : ''}`}>Generate</span>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--accent)', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px' }}>
              <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--accent)', boxShadow: '0 0 8px var(--accent)' }}/>
              COMPLETE
              <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--accent)', boxShadow: '0 0 8px var(--accent)' }}/>
            </div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 600, letterSpacing: '-0.5px' }}>
              Your PFP is <span style={{ color: 'var(--accent)' }}>Ready</span>
            </h2>
          </div>
        )}

        {/* ── Step 1: Upload / AI Generate ── */}
        {step === 'upload' && (
          <div className="animate-in">
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '8px', letterSpacing: '-0.5px' }}>
              Create Your Base Image
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '24px' }}>
              Generate an image via June AI or upload your own.
            </p>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              <button 
                onClick={() => { setGenerationMode('ai'); setRawImageUrl(null); }}
                style={{ flex: 1, padding: '10px', borderRadius: '10px', border: generationMode === 'ai' ? '1px solid var(--accent)' : '1px solid rgba(255,255,255,0.1)', background: generationMode === 'ai' ? 'rgba(0,229,255,0.05)' : 'transparent', color: generationMode === 'ai' ? 'var(--accent)' : 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.2s' }}
              >
                <Wand2 size={16} /> AI GENERATE
              </button>
              <button 
                onClick={() => { setGenerationMode('upload'); setRawImageUrl(null); }}
                style={{ flex: 1, padding: '10px', borderRadius: '10px', border: generationMode === 'upload' ? '1px solid var(--accent)' : '1px solid rgba(255,255,255,0.1)', background: generationMode === 'upload' ? 'rgba(0,229,255,0.05)' : 'transparent', color: generationMode === 'upload' ? 'var(--accent)' : 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.2s' }}
              >
                <Upload size={16} /> UPLOAD OWN
              </button>
            </div>

            {!rawImageUrl ? (
              generationMode === 'ai' ? (
                <div style={{ padding: '24px', border: '1px solid var(--card-border)', borderRadius: '16px', background: 'rgba(255, 255, 255, 0.015)', marginBottom: '32px' }}>
                  <textarea
                    placeholder="Describe your ideal avatar (e.g. A cyberpunk ninja hacking a mainframe, vivid neon colors...)"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    style={{ width: '100%', minHeight: '100px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '16px', color: '#fff', fontFamily: 'var(--font-sans)', fontSize: '0.95rem', resize: 'none', marginBottom: '16px', outline: 'none' }}
                  />
                  <button
                    onClick={handleAIGenerate}
                    disabled={isGeneratingAiImage || !prompt.trim()}
                    style={{ width: '100%', padding: '14px', borderRadius: '10px', background: isGeneratingAiImage ? 'rgba(255,255,255,0.1)' : 'var(--accent)', color: isGeneratingAiImage ? 'var(--text-muted)' : 'var(--bg-deep)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', fontWeight: 600, letterSpacing: '1px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.2s', cursor: isGeneratingAiImage ? 'not-allowed' : 'pointer' }}
                  >
                    {isGeneratingAiImage ? <><Loader2 size={16} className="spin" /> INFERRING FROM JUNE AI...</> : <><Sparkles size={16} /> GENERATE BASE IMAGE</>}
                  </button>
                </div>
              ) : (
                <div
                  className={`dropzone ${isDragOver ? 'active' : ''}`}
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                  onDragLeave={(e) => { e.preventDefault(); setIsDragOver(false); }}
                  onDrop={handleDrop}
                >
                  <div className="dropzone-icon">
                    <Upload size={24} />
                  </div>
                  <div className="dropzone-title">Select Image</div>
                  <div className="dropzone-formats">JPG / PNG / WEBP / HEIC • Max 10MB</div>
                  <div className="dropzone-hint">or drag and drop here</div>
                </div>
              )
            ) : (
              <div style={{ padding: '0', border: '1px solid var(--card-border)', borderRadius: '16px', marginBottom: '32px', background: 'rgba(255,255,255,0.02)' }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  <span>{generationMode === 'ai' ? 'June_AI_Generated.png' : 'Custom_Upload.png'}</span>
                  <span style={{ color: 'var(--accent)' }}>Ready for Branding</span>
                </div>
                <div style={{ padding: '24px', textAlign: 'center' }}>
                  <img src={rawImageUrl} alt="Preview" className="dropzone-preview" style={{ width: '140px', height: '140px', borderRadius: '50%', marginBottom: '24px', objectFit: 'cover' }} />
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-main)', marginBottom: '16px' }}>Base image acquired.</div>
                  <button
                    style={{
                      display: 'inline-block', fontSize: '0.8rem', color: 'var(--text-muted)',
                      transition: 'color 0.2s', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '2px'
                    }}
                    onClick={() => { setRawImageUrl(null); }}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-main)'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                  >
                    Discard and create another
                  </button>
                  <div style={{ width: '100%', height: '1px', background: 'rgba(255,255,255,0.05)', margin: '20px 0' }} />
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>Click Apply Brand Overlay to continue.</div>
                </div>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              style={{ display: 'none' }}
            />

            {error && (
              <div style={{
                padding: '12px 16px', borderRadius: '10px', background: 'rgba(255, 70, 70, 0.08)',
                border: '1px solid rgba(255, 70, 70, 0.2)', color: '#ff7070', fontSize: '0.85rem',
                marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px',
              }}>
                <X size={14} /> {error}
              </div>
            )}

            <div className="modal-footer">
              <button className="btn-cancel" onClick={handleClose}>Cancel</button>
              <button
                className={`btn-generate ${rawImageUrl ? 'ready' : ''}`}
                onClick={() => processFinalPFP('style1')}
                disabled={!rawImageUrl}
              >
                APPLY BRAND OVERLAY <ArrowRight size={14} style={{ marginLeft: '4px' }}/>
              </button>
            </div>
          </div>
        )}

        {/* ── Step 2: Processing ── */}
        {step === 'processing' && (
          <div className="processing-container animate-in">
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '8px', letterSpacing: '-0.5px' }}>
              Generating Semantic PFP
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '28px' }}>
              June AI is crafting your branded profile picture...
            </p>

            <div className="processing-preview" style={{ borderRadius: '50%' }}>
              <img src={rawImageUrl!} alt="Processing" />
              <div className="processing-overlay">
                <Loader2 size={40} className="spin" style={{ color: 'var(--accent)' }} />
              </div>
              <div className="processing-bar">
                <div className="processing-bar-fill" />
              </div>
            </div>

            <div className="processing-title">
              <Sparkles size={18} style={{ color: 'var(--accent)', verticalAlign: 'middle', marginRight: '6px' }} />
              Tagline Generation...
            </div>
            <div className="processing-subtitle">
              Generating tagline & compositing client overlay
            </div>
          </div>
        )}

        {/* ── Step 3: Result ── */}
        {step === 'done' && result && (
          <div className="result-container animate-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            
            <div className="result-image-wrapper" style={{ width: '380px', height: '380px', marginBottom: '16px', position: 'relative' }}>
              {isRegeneratingStyle && (
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(5, 13, 20, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
                  <Loader2 size={32} className="spin" style={{ color: 'var(--accent)' }} />
                </div>
              )}
              <div style={{ position: 'absolute', top: 12, left: 12, width: 12, height: 12, borderTop: '2px solid var(--accent)', borderLeft: '2px solid var(--accent)' }} />
              <div style={{ position: 'absolute', top: 12, right: 12, width: 12, height: 12, borderTop: '2px solid var(--accent)', borderRight: '2px solid var(--accent)' }} />
              <div style={{ position: 'absolute', bottom: 12, left: 12, width: 12, height: 12, borderBottom: '2px solid var(--accent)', borderLeft: '2px solid var(--accent)' }} />
              <div style={{ position: 'absolute', bottom: 12, right: 12, width: 12, height: 12, borderBottom: '2px solid var(--accent)', borderRight: '2px solid var(--accent)' }} />
              
              <img src={result.image} alt="Generated PFP" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>

            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
              {STYLES.find(s => s.id === activeStyle)?.name} – "{result.tagline}"
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--accent)', marginBottom: '24px' }}>
              Verified by ASK JUNE AI / {Math.random().toString(16).slice(2, 10).toUpperCase()}
            </div>

            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>
              Choose Style
            </div>
            
            <div style={{ display: 'flex', gap: '8px', marginBottom: '28px' }}>
              {STYLES.map((style) => (
                <button
                  key={style.id}
                  onClick={() => processFinalPFP(style.id, true)}
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '8px',
                    border: activeStyle === style.id ? '2px solid var(--accent)' : '1px solid rgba(255, 255, 255, 0.1)',
                    background: `linear-gradient(135deg, ${style.thumbnail} 0%, rgba(10, 25, 40, 0.9) 100%)`,
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'all 0.2s',
                    opacity: isRegeneratingStyle && activeStyle !== style.id ? 0.5 : 1
                  }}
                  title={style.name}
                >
                   {style.id === 'style1' && <div style={{position: 'absolute', top: 4, left: 4, width: 6, height: 6, borderRadius: '2px', background: 'var(--accent)'}} />}
                   {style.id === 'style2' && <div style={{position: 'absolute', top: 0, right: -4, width: 24, height: 6, background: '#fff', transform: 'rotate(45deg)'}} />}
                   {style.id === 'style4' && <div style={{position: 'absolute', inset: 3, border: '1px solid var(--accent)'}} />}
                </button>
              ))}
            </div>

            <div className="result-actions" style={{ width: '100%', maxWidth: '420px', gap: '10px' }}>
              <button 
                className="btn-secondary" 
                onClick={() => processFinalPFP(activeStyle, true)} 
                title="Regenerate Tagline & Layout"
                style={{ padding: '12px 14px', flexShrink: 0 }}
              >
                <RefreshCw size={14} style={{ marginRight: '4px' }}/>
                REGENERATE
              </button>
              
              <button 
                className="btn-primary" 
                onClick={handleDownload} 
                style={{ padding: '14px', flex: 1, justifyContent: 'center' }}
              >
                <Download size={14} /> DOWNLOAD PNG
              </button>

              <button 
                className="btn-secondary" 
                style={{ padding: '12px 14px', flexShrink: 0 }}
                onClick={() => {
                  const xUrl = `https://twitter.com/intent/tweet?text=Just%20generated%20my%20@askjuneai%20PFP.%20${result.tagline}&url=https://askjune.ai`;
                  window.open(xUrl, '_blank');
                }}
              >
                <Share2 size={14} style={{ marginRight: '4px' }}/> SHARE ON X
              </button>
            </div>

            <button 
              onClick={resetAll}
              style={{
                marginTop: '24px', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', 
                color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px',
                display: 'inline-flex', alignItems: 'center', gap: '6px'
              }}
            >
              ← Start Over
            </button>

          </div>
        )}
      </div>
    </div>
  );
}
