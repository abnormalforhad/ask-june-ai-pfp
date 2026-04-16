import { useState, useEffect } from 'react';
import { Sparkles, Upload, Download } from 'lucide-react';
import PfpModal from './components/PfpModal';
import './index.css';

function App() {
  const [modalOpen, setModalOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <div className="app-bg" />

      {/* ── Navbar ── */}
      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="container navbar-inner">
          <div className="logo">
            <div className="logo-icon">
              <Sparkles size={18} />
            </div>
            Ask June AI
          </div>
          <div className="nav-pills">
            <a href="https://askjune.ai/docs" target="_blank" rel="noopener noreferrer" className="nav-pill">Docs</a>
            <a href="#" className="nav-pill">Blog</a>
            <a href="#" className="nav-pill">Hub</a>
            <button className="nav-pill active" onClick={() => setModalOpen(true)}>PFP Studio</button>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="hero container">
        <div>
          <div className="hero-badge">
            <div className="hero-badge-dot" />
            PFP Generator
          </div>
          <h1 className="hero-title">
            Create Your<br />
            <span className="accent">Ask June AI</span><br />
            PFP
          </h1>
          <p className="hero-desc">
            Upload your photo and get an <strong>Ask June AI-branded overlay</strong> with
            an <span className="accent-text">AI-generated tagline</span> powered by June's
            inference engine. Download and rep the network.
          </p>
          <div className="hero-actions">
            <button className="btn-primary" onClick={() => setModalOpen(true)}>
              Generate My PFP
            </button>
            <a href="https://askjune.ai" target="_blank" rel="noopener noreferrer" className="btn-secondary">
              Ask June AI Labs
            </a>
          </div>
        </div>

        <div>
          <div className="sample-stack">
            {/* Sample PFP cards stack */}
            <div className="sample-card">
              <div className="sample-card-inner">
                <div className="sample-brand">
                  <Sparkles size={14} style={{ color: 'var(--accent)' }} />
                </div>
                <div className="sample-badge">Neural Pioneer</div>
                <svg className="sample-logo" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(0,229,255,0.15)" strokeWidth="2" />
                  <circle cx="50" cy="50" r="25" fill="none" stroke="rgba(0,229,255,0.1)" strokeWidth="1.5" />
                  <circle cx="50" cy="50" r="10" fill="rgba(0,229,255,0.08)" />
                  <line x1="10" y1="50" x2="90" y2="50" stroke="rgba(0,229,255,0.08)" strokeWidth="1" />
                  <line x1="50" y1="10" x2="50" y2="90" stroke="rgba(0,229,255,0.08)" strokeWidth="1" />
                </svg>
              </div>
            </div>
            <div className="sample-card">
              <div className="sample-card-inner">
                <div className="sample-brand">
                  <Sparkles size={14} style={{ color: 'var(--accent)' }} />
                </div>
                <div className="sample-badge">AI Architect</div>
                <svg className="sample-logo" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(0,229,255,0.15)" strokeWidth="2" />
                  <circle cx="50" cy="50" r="25" fill="none" stroke="rgba(0,229,255,0.1)" strokeWidth="1.5" />
                  <circle cx="50" cy="50" r="10" fill="rgba(0,229,255,0.08)" />
                  <line x1="10" y1="50" x2="90" y2="50" stroke="rgba(0,229,255,0.08)" strokeWidth="1" />
                  <line x1="50" y1="10" x2="50" y2="90" stroke="rgba(0,229,255,0.08)" strokeWidth="1" />
                </svg>
              </div>
            </div>
            <div className="sample-card">
              <div className="sample-card-inner">
                <div className="sample-brand">
                  <Sparkles size={14} style={{ color: 'var(--accent)' }} />
                </div>
                <div className="sample-badge">Quantum Thinker</div>
                <svg className="sample-logo" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(0,229,255,0.15)" strokeWidth="2" />
                  <circle cx="50" cy="50" r="25" fill="none" stroke="rgba(0,229,255,0.1)" strokeWidth="1.5" />
                  <circle cx="50" cy="50" r="10" fill="rgba(0,229,255,0.08)" />
                  <line x1="10" y1="50" x2="90" y2="50" stroke="rgba(0,229,255,0.08)" strokeWidth="1" />
                  <line x1="50" y1="10" x2="50" y2="90" stroke="rgba(0,229,255,0.08)" strokeWidth="1" />
                </svg>
              </div>
            </div>
          </div>
          <div className="sample-label">Sample Outputs</div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="section container">
        <h2 className="section-title">How It Works</h2>
        <p className="section-subtitle">Three steps to your AI-branded profile picture</p>

        <div className="steps-grid">
          <div className="step-card">
            <div className="step-number">
              <Upload size={18} />
            </div>
            <h3 className="step-title">Upload Your Photo</h3>
            <p className="step-desc">
              Select any profile picture or avatar. Supports JPG, PNG, WEBP, and HEIC formats up to 10MB.
              Your image is processed server-side and never stored permanently.
            </p>
          </div>

          <div className="step-card">
            <div className="step-number">
              <Sparkles size={18} />
            </div>
            <h3 className="step-title">AI Tagline & Overlay</h3>
            <p className="step-desc">
              Our backend calls June's AI inference engine to generate a unique tagline, then composites
              a branded overlay onto your image with the Ask June AI identity.
            </p>
          </div>

          <div className="step-card">
            <div className="step-number">
              <Download size={18} />
            </div>
            <h3 className="step-title">Download & Rep</h3>
            <p className="step-desc">
              Get your high-resolution 1080×1080 PFP ready for social media. Share it on X, Discord,
              and beyond to represent the Ask June AI ecosystem.
            </p>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="footer">
        <div className="container footer-inner">
          <span>© 2026 Ask June AI. All rights reserved.</span>
          <div className="footer-links">
            <a href="#">Discord</a>
            <a href="#">X (Twitter)</a>
            <a href="https://askjune.ai" target="_blank" rel="noopener noreferrer">askjune.ai</a>
          </div>
        </div>
      </footer>

      {/* ── Modal ── */}
      <PfpModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}

export default App;
