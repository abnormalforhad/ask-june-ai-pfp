import { useState, useEffect } from 'react';
import { Sparkles, Pickaxe, AlertCircle } from 'lucide-react';
import PhotoUpload from './components/PhotoUpload';
import FashionGrid from './components/FashionGrid';
import ResultDisplay from './components/ResultDisplay';
import ApiKeyInput from './components/ApiKeyInput';
import { generateClientPFP } from './utils/juneClientApi';
import './index.css';

function App() {
  const [photo, setPhoto] = useState<string | null>(null);
  const [selectedFashionIds, setSelectedFashionIds] = useState<string[]>([]);
  const [apiKey, setApiKey] = useState<string>('');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('JUNE_API_KEY');
    if (stored) {
      setApiKey(stored);
    }
  }, []);

  const handleToggleFashion = (id: string) => {
    setSelectedFashionIds((prev) => 
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleGenerate = async () => {
    if (!photo || selectedFashionIds.length === 0 || !apiKey) {
      if (!apiKey) setError('Please enter your June AI API Key first.');
      return;
    }
    
    setIsGenerating(true);
    setError(null);
    setResultImage(null);

    try {
      const data = await generateClientPFP(apiKey, photo, selectedFashionIds);

      if (data.b64) {
        setResultImage(`data:image/png;base64,${data.b64}`);
      } else if (data.url) {
        setResultImage(data.url);
      } else {
        throw new Error('No image returned from API');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const resetAll = () => {
    setPhoto(null);
    setSelectedFashionIds([]);
    setResultImage(null);
    setError(null);
  };

  return (
    <>
      {/* ── Navbar ── */}
      <nav className="navbar">
        <div className="container navbar-inner">
          <div className="logo">
            <div className="logo-icon">
              <Sparkles size={20} />
            </div>
            Ask June AI
          </div>
          <div className="nav-pills">
            <a href="https://askjune.ai" target="_blank" rel="noopener noreferrer" className="nav-pill">Powered by June AI</a>
          </div>
        </div>
      </nav>

      <main className="app-main container">
        
        {/* ── Hero ── */}
        <div className="text-center" style={{ marginBottom: '60px' }}>
          <div className="section-label">Fashion Studio</div>
          <h1 className="title-main">
            Upgrade Your PFP <br />
            with <span className="gradient-text">AI Fashion</span>
          </h1>
          <p className="subtitle-main">
            Upload your photo, select from our curated virtual wardrobe, and let Ask June AI seamlessly composite them onto your avatar while preserving your identity.
          </p>
        </div>

        {/* ── Main Flow ── */}
        {!resultImage ? (
          <div className="flow-container" style={{ position: 'relative' }}>
            
            {/* Loading Overlay */}
            {isGenerating && (
              <div className="processing-overlay">
                <div className="loader-pulse">
                  <Pickaxe size={28} />
                </div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 600, marginBottom: '8px' }}>
                  Stitching your fit...
                </h3>
                <p style={{ color: 'var(--text-secondary)' }}>
                  June AI is mapping the garments to your avatar.
                </p>
                <div style={{ marginTop: '24px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  This can take 15-30 seconds.
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div style={{
                background: 'rgba(255, 50, 100, 0.1)',
                border: '1px solid rgba(255, 50, 100, 0.3)',
                padding: '16px 24px',
                borderRadius: '12px',
                color: '#ff6b8b',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '-16px'
              }}>
                <AlertCircle size={20} />
                {error}
              </div>
            )}

            {/* Step 1: Upload */}
            <PhotoUpload 
              selectedPhoto={photo} 
              onPhotoSelected={setPhoto} 
              onClear={() => setPhoto(null)} 
            />

            {/* Step 2: Select Fashion (only enabled if photo uploaded) */}
            <div style={{ opacity: photo ? 1 : 0.5, pointerEvents: photo && !isGenerating ? 'auto' : 'none', transition: 'opacity 0.3s' }}>
              <FashionGrid 
                selectedIds={selectedFashionIds}
                onToggleItem={handleToggleFashion}
                onClear={() => setSelectedFashionIds([])}
              />
            </div>

            {/* Step 3: API Key & Generate */}
            <div style={{ opacity: selectedFashionIds.length > 0 ? 1 : 0.5, transition: 'opacity 0.3s' }}>
              <ApiKeyInput apiKey={apiKey} setApiKey={setApiKey} />

              <div style={{ textAlign: 'center', marginTop: '20px' }}>
                <button 
                  className="btn-primary" 
                  onClick={handleGenerate}
                  disabled={!photo || selectedFashionIds.length === 0 || !apiKey || isGenerating}
                  style={{ width: '100%', maxWidth: '320px', padding: '18px' }}
                >
                  <Sparkles size={18} /> GENERATE PFP
                </button>
              </div>
            </div>

          </div>
        ) : (
          <ResultDisplay 
            imageUrl={resultImage} 
            onReset={resetAll}
          />
        )}
      </main>

      {/* ── Footer ── */}
      <footer style={{ borderTop: '1px solid var(--card-border)', padding: '32px 0', marginTop: '60px' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          <span>© 2026 Ask June AI. All rights reserved.</span>
          <span>Powered by June AI Inference</span>
        </div>
      </footer>
    </>
  );
}

export default App;
