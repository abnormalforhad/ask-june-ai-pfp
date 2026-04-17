import { useState } from 'react';
import { Sparkles, AlertCircle, RefreshCw } from 'lucide-react';
import PhotoUpload from './components/PhotoUpload';
import FashionGrid from './components/FashionGrid';
import ResultDisplay from './components/ResultDisplay';
import './index.css';

/**
 * Utility to drastically compress a base64 image (scales to max 512x512)
 * This shrinks the payload to sneak past Cloudflare Datacenter WAF blocks.
 */
const compressImage = async (base64Str: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const MAX_WIDTH = 512;
      const MAX_HEIGHT = 512;
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > MAX_WIDTH) {
          height = Math.round((height *= MAX_WIDTH / width));
          width = MAX_WIDTH;
        }
      } else {
        if (height > MAX_HEIGHT) {
          width = Math.round((width *= MAX_HEIGHT / height));
          height = MAX_HEIGHT;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject('No canvas context');
      
      // Draw white background in case of PNG transparency
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);
      
      // Compress heavily (quality 0.82)
      resolve(canvas.toDataURL('image/jpeg', 0.82));
    };
    img.onerror = (err) => reject(err);
  });
};

function App() {
  const [photo, setPhoto] = useState<string | null>(null);
  const [selectedFashionIds, setSelectedFashionIds] = useState<string[]>([]);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleToggleFashion = (id: string) => {
    setSelectedFashionIds((prev) => 
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleGenerate = async () => {
    if (!photo || selectedFashionIds.length === 0) return;
    
    setIsGenerating(true);
    setError(null);
    setResultImage(null);

    try {
      // Compress image before sending to backend to avoid Cloudflare WAF payload limits
      const compressedBase64 = await compressImage(photo);

      const response = await fetch('/api/generate-pfp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: compressedBase64,
          selectedItems: selectedFashionIds
        })
      });

      let data;
      try {
        data = await response.json();
      } catch (e) {
        throw new Error('Server error: API did not return valid JSON. Ensure Vercel environment is active.');
      }

      if (!response.ok) {
        throw new Error(data?.error || 'Failed to generate PFP');
      }

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
        <div className="hero-section">
          <div className="section-label">Fashion Studio</div>
          <h1 className="title-main">
            Upgrade Your Profile
            <br />
            with <span className="gradient-text">AI Fashion</span>.
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
                  <RefreshCw size={28} className="spin-anim" />
                </div>
                <h3>Stitching your fit...</h3>
                <p>June AI is securely mapping garments to your avatar.</p>
                <div className="loading-hint">This usually takes 15-30 seconds.</div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="alert-error">
                <AlertCircle size={20} />
                {error}
              </div>
            )}

            <div className="card">
              {/* Step 1: Upload */}
              <PhotoUpload 
                selectedPhoto={photo} 
                onPhotoSelected={setPhoto} 
                onClear={() => setPhoto(null)} 
              />
              <hr className="divider" />
              {/* Step 2: Select Fashion (only enabled if photo uploaded) */}
              <div className={photo ? "step-active" : "step-disabled"}>
                <FashionGrid 
                  selectedIds={selectedFashionIds}
                  onToggleItem={handleToggleFashion}
                  onClear={() => setSelectedFashionIds([])}
                />
              </div>

              {/* Step 3: Generate Button */}
              <div className={`generate-wrapper ${selectedFashionIds.length > 0 ? "step-active" : "step-disabled"}`}>
                <button 
                  className="btn-primary" 
                  onClick={handleGenerate}
                  disabled={!photo || selectedFashionIds.length === 0 || isGenerating}
                >
                  <Sparkles size={18} /> Generate PFP
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
      <footer className="footer">
        <div className="container footer-inner">
          <span>© 2026 Ask June AI. All rights reserved.</span>
          <span>OpenGradient / June AI Inference</span>
        </div>
      </footer>
    </>
  );
}

export default App;
