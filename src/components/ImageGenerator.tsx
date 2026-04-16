import React, { useState, useRef } from 'react';
import { Sparkles, Wand2, Download, RefreshCw, Loader2, AlertCircle, ChevronDown, ImageIcon } from 'lucide-react';
import { generateImage } from '../utils/juneApi';

interface ImageGeneratorProps {
  apiKey: string | null;
}

const STYLE_PRESETS = [
  { label: 'Photorealistic', prefix: 'A photorealistic image of ' },
  { label: 'Digital Art', prefix: 'Digital art, highly detailed illustration of ' },
  { label: 'Anime', prefix: 'Anime style artwork of ' },
  { label: 'Oil Painting', prefix: 'Oil painting masterpiece of ' },
  { label: '3D Render', prefix: 'Professional 3D render of ' },
  { label: 'Pixel Art', prefix: 'Retro pixel art of ' },
  { label: 'Cyberpunk', prefix: 'Cyberpunk futuristic scene of ' },
  { label: 'Watercolor', prefix: 'Delicate watercolor painting of ' },
];

const SIZE_OPTIONS = [
  { label: '1024×1024', value: '1024x1024' },
  { label: '1024×1792', value: '1024x1792' },
  { label: '1792×1024', value: '1792x1024' },
];

const QUALITY_OPTIONS = [
  { label: 'Standard', value: 'standard' },
  { label: 'HD', value: 'hd' },
];

interface GeneratedImage {
  url: string;
  prompt: string;
  timestamp: number;
  revisedPrompt?: string;
}

export default function ImageGenerator({ apiKey }: ImageGeneratorProps) {
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState(0);
  const [size, setSize] = useState('1024x1024');
  const [quality, setQuality] = useState('standard');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleGenerate = async () => {
    if (!apiKey || !prompt.trim()) return;

    setIsGenerating(true);
    setError(null);

    const fullPrompt = STYLE_PRESETS[style].prefix + prompt.trim();

    try {
      const response = await generateImage(apiKey, fullPrompt, {
        size,
        quality,
        response_format: 'url',
      });

      if (response.data && response.data.length > 0) {
        const newImages = response.data.map((img) => ({
          url: img.url || img.b64_json || '',
          prompt: fullPrompt,
          revisedPrompt: img.revised_prompt,
          timestamp: Date.now(),
        }));
        setImages((prev) => [...newImages, ...prev]);
        setSelectedImage(newImages[0]);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to generate image. Check your API key and try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async (img: GeneratedImage) => {
    try {
      const response = await fetch(img.url);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `june-ai-${img.timestamp}.png`;
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      // Fallback: open in new tab
      window.open(img.url, '_blank');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
  };

  if (!apiKey) {
    return (
      <div className="glass-panel animate-fade-in" style={{
        padding: '64px 40px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px',
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '8px',
        }}>
          <Wand2 size={36} style={{ color: 'var(--text-muted)', opacity: 0.5 }} />
        </div>
        <h3 style={{ fontSize: '1.5rem', fontWeight: 600 }}>API Key Required</h3>
        <p className="text-muted" style={{ maxWidth: '400px', lineHeight: 1.6, fontSize: '0.95rem' }}>
          Enter your June API key above to unlock AI-powered image generation. Create stunning visuals with a simple text prompt.
        </p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Prompt Input Area */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
          {STYLE_PRESETS.map((s, i) => (
            <button
              key={s.label}
              onClick={() => setStyle(i)}
              style={{
                padding: '6px 14px',
                borderRadius: '99px',
                fontSize: '0.78rem',
                fontWeight: 500,
                border: `1px solid ${i === style ? 'rgba(0, 229, 255, 0.4)' : 'rgba(255,255,255,0.1)'}`,
                background: i === style ? 'rgba(0, 229, 255, 0.12)' : 'rgba(255,255,255,0.03)',
                color: i === style ? 'var(--accent)' : 'var(--text-muted)',
                cursor: 'pointer',
                transition: 'all 0.25s ease',
              }}
              onMouseEnter={(e) => {
                if (i !== style) {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                  e.currentTarget.style.color = 'var(--text-main)';
                }
              }}
              onMouseLeave={(e) => {
                if (i !== style) {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                  e.currentTarget.style.color = 'var(--text-muted)';
                }
              }}
            >
              {s.label}
            </button>
          ))}
        </div>

        <div style={{ position: 'relative' }}>
          <textarea
            ref={textareaRef}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe the image you want to create..."
            rows={3}
            style={{
              width: '100%',
              padding: '16px 80px 16px 16px',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '16px',
              color: 'var(--text-main)',
              fontSize: '0.95rem',
              fontFamily: 'Inter, sans-serif',
              outline: 'none',
              resize: 'vertical',
              lineHeight: 1.5,
              transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'rgba(0, 229, 255, 0.3)';
              e.currentTarget.style.boxShadow = '0 0 20px rgba(0, 229, 255, 0.06)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          />
          <button
            className="btn btn-accent"
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            style={{
              position: 'absolute',
              right: '12px',
              bottom: '12px',
              padding: '10px 16px',
              borderRadius: '12px',
              fontSize: '0.85rem',
              opacity: isGenerating || !prompt.trim() ? 0.5 : 1,
              cursor: isGenerating || !prompt.trim() ? 'not-allowed' : 'pointer',
            }}
          >
            {isGenerating ? <Loader2 size={18} className="spin-icon" /> : <Wand2 size={18} />}
          </button>
        </div>

        {/* Advanced Options Toggle */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            marginTop: '12px',
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            fontSize: '0.8rem',
            cursor: 'pointer',
            padding: '4px 0',
            transition: 'color 0.2s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-main)'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
        >
          <ChevronDown
            size={14}
            style={{
              transform: showAdvanced ? 'rotate(180deg)' : 'rotate(0)',
              transition: 'transform 0.3s ease',
            }}
          />
          Advanced Options
        </button>

        {showAdvanced && (
          <div className="animate-fade-in" style={{
            display: 'flex',
            gap: '16px',
            marginTop: '12px',
            padding: '16px',
            background: 'rgba(255,255,255,0.02)',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.06)',
          }}>
            <div style={{ flex: 1 }}>
              <label className="text-muted" style={{ fontSize: '0.75rem', fontWeight: 500, display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Size
              </label>
              <div style={{ display: 'flex', gap: '6px' }}>
                {SIZE_OPTIONS.map((s) => (
                  <button
                    key={s.value}
                    onClick={() => setSize(s.value)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '8px',
                      fontSize: '0.75rem',
                      border: `1px solid ${s.value === size ? 'rgba(0,229,255,0.3)' : 'rgba(255,255,255,0.08)'}`,
                      background: s.value === size ? 'rgba(0,229,255,0.1)' : 'transparent',
                      color: s.value === size ? 'var(--accent)' : 'var(--text-muted)',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-muted" style={{ fontSize: '0.75rem', fontWeight: 500, display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Quality
              </label>
              <div style={{ display: 'flex', gap: '6px' }}>
                {QUALITY_OPTIONS.map((q) => (
                  <button
                    key={q.value}
                    onClick={() => setQuality(q.value)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '8px',
                      fontSize: '0.75rem',
                      border: `1px solid ${q.value === quality ? 'rgba(0,229,255,0.3)' : 'rgba(255,255,255,0.08)'}`,
                      background: q.value === quality ? 'rgba(0,229,255,0.1)' : 'transparent',
                      color: q.value === quality ? 'var(--accent)' : 'var(--text-muted)',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    {q.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="animate-fade-in" style={{
            marginTop: '12px',
            padding: '12px 16px',
            borderRadius: '12px',
            background: 'rgba(255, 85, 85, 0.08)',
            border: '1px solid rgba(255, 85, 85, 0.2)',
            color: '#ff7070',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px',
          }}>
            <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Loading State */}
      {isGenerating && (
        <div className="glass-panel animate-fade-in" style={{
          padding: '48px',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
        }}>
          <div style={{
            width: '72px',
            height: '72px',
            borderRadius: '50%',
            background: 'rgba(0, 229, 255, 0.08)',
            border: '1px solid rgba(0, 229, 255, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}>
            <Loader2 size={32} className="spin-icon" style={{ color: 'var(--accent)' }} />
            <div style={{
              position: 'absolute',
              inset: '-4px',
              borderRadius: '50%',
              border: '2px solid transparent',
              borderTopColor: 'var(--accent)',
              animation: 'spin 2s linear infinite',
            }} />
          </div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 600 }}>Creating your masterpiece...</h3>
          <p className="text-muted" style={{ fontSize: '0.9rem' }}>This typically takes 10-30 seconds</p>
          <div style={{
            width: '200px',
            height: '3px',
            borderRadius: '99px',
            background: 'rgba(255,255,255,0.06)',
            marginTop: '8px',
            overflow: 'hidden',
          }}>
            <div style={{
              width: '100%',
              height: '100%',
              background: 'linear-gradient(90deg, var(--accent), rgba(0, 229, 255, 0.3))',
              animation: 'shimmer 1.5s ease-in-out infinite',
              transformOrigin: 'left',
            }} />
          </div>
        </div>
      )}

      {/* Selected Image Preview */}
      {selectedImage && !isGenerating && (
        <div className="glass-panel animate-fade-in" style={{ padding: '24px', overflow: 'hidden' }}>
          <div style={{
            position: 'relative',
            borderRadius: '16px',
            overflow: 'hidden',
            marginBottom: '20px',
            border: '1px solid rgba(0, 229, 255, 0.15)',
            boxShadow: '0 8px 32px rgba(0, 229, 255, 0.08)',
          }}>
            <img
              src={selectedImage.url}
              alt="Generated"
              style={{
                width: '100%',
                display: 'block',
                borderRadius: '16px',
              }}
            />
            {/* Branding Overlay */}
            <div style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              background: 'rgba(5, 13, 20, 0.8)',
              backdropFilter: 'blur(8px)',
              padding: '6px 12px',
              borderRadius: '99px',
              fontSize: '10px',
              fontWeight: 600,
              color: 'var(--text-main)',
              border: '1px solid rgba(255,255,255,0.1)',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}>
              <Sparkles size={10} style={{ color: 'var(--accent)' }} />
              Powered by June AI
            </div>
          </div>

          {selectedImage.revisedPrompt && (
            <p className="text-muted" style={{
              fontSize: '0.8rem',
              lineHeight: 1.5,
              marginBottom: '16px',
              padding: '12px',
              background: 'rgba(255,255,255,0.02)',
              borderRadius: '10px',
              border: '1px solid rgba(255,255,255,0.05)',
              fontStyle: 'italic',
            }}>
              <Sparkles size={12} style={{ color: 'var(--accent)', marginRight: '6px', verticalAlign: 'middle' }} />
              {selectedImage.revisedPrompt}
            </p>
          )}

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              className="btn btn-accent"
              onClick={() => handleDownload(selectedImage)}
              style={{ flex: 1, padding: '14px', borderRadius: '12px' }}
            >
              <Download size={18} /> Download Image
            </button>
            <button
              className="btn btn-ghost"
              onClick={() => {
                setPrompt('');
                setSelectedImage(null);
              }}
              style={{ padding: '14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <RefreshCw size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Image Gallery */}
      {images.length > 1 && (
        <div>
          <h4 className="text-muted" style={{ fontSize: '0.8rem', fontWeight: 500, marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Recent Generations ({images.length})
          </h4>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
            gap: '12px',
          }}>
            {images.map((img, i) => (
              <div
                key={img.timestamp + i}
                onClick={() => setSelectedImage(img)}
                style={{
                  borderRadius: '12px',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  border: selectedImage?.timestamp === img.timestamp
                    ? '2px solid var(--accent)'
                    : '2px solid transparent',
                  transition: 'all 0.25s ease',
                  aspectRatio: '1/1',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.03)';
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,229,255,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <img
                  src={img.url}
                  alt={`Generated ${i + 1}`}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
