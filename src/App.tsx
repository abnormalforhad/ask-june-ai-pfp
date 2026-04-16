import Dropzone from './components/Dropzone';
import { Sparkles, Layers, Image as ImageIcon } from 'lucide-react';
import './App.css';

function App() {
  return (
    <div className="app-container">
      <nav className="navbar" style={{ borderBottom: '1px solid var(--card-border)', background: 'rgba(5, 13, 20, 0.8)', backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 50 }}>
        <div className="container flex-center" style={{ justifyContent: 'space-between', padding: '20px 24px' }}>
          <div className="logo" style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
             <div style={{ width: 28, height: 28, background: 'var(--accent)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000' }}>
               <Sparkles size={16} />
             </div>
             Ask June <span className="text-accent">AI</span>
          </div>
          <div className="nav-links" style={{ display: 'flex', gap: '32px', fontWeight: 500, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            <a href="#" className="hover-white" style={{ transition: 'color 0.2s' }}>Docs</a>
            <a href="#" className="hover-white" style={{ transition: 'color 0.2s' }}>Blog</a>
            <a href="#" className="hover-white" style={{ transition: 'color 0.2s' }}>Hub</a>
            <a href="#" className="text-main" style={{ color: 'var(--text-main)' }}>PFP Studio</a>
          </div>
        </div>
      </nav>

      <main className="container" style={{ padding: '80px 24px', display: 'flex', flexDirection: 'column', gap: '120px' }}>
        
        {/* Hero Section */}
        <section className="hero" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 1fr)', gap: '64px', alignItems: 'center' }}>
          <div className="hero-content animate-fade-in">
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', background: 'rgba(0, 229, 255, 0.1)', border: '1px solid rgba(0, 229, 255, 0.2)', color: 'var(--accent)', borderRadius: '99px', fontSize: '0.8rem', fontWeight: 600, marginBottom: '24px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              <Sparkles size={14} /> Official PFP Studio
            </div>
            <h1 style={{ fontSize: 'clamp(3rem, 5vw, 4.5rem)', fontWeight: 700, lineHeight: 1.1, marginBottom: '24px', letterSpacing: '-1px' }}>
              Create Your <br/>
              <span className="text-accent">Ask June AI</span> PFP
            </h1>
            <p className="text-muted" style={{ fontSize: '1.125rem', lineHeight: 1.6, marginBottom: '40px', maxWidth: '480px' }}>
              Upload your photo and get an Ask June AI-branded overlay with an AI-generated tagline powered by our inference engine. Download and rep the network.
            </p>
            <div style={{ display: 'flex', gap: '16px' }}>
              <button className="btn btn-primary" onClick={() => document.getElementById('dropzone')?.scrollIntoView({ behavior: 'smooth' })}>
                Get Started
              </button>
              <button className="btn btn-ghost">Learn More</button>
            </div>
          </div>
          
          <div className="hero-visual animate-fade-in" id="dropzone" style={{ animationDelay: '0.2s' }}>
            <Dropzone />
          </div>
        </section>

        {/* How It Works Section */}
        <section className="how-it-works" style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '16px', letterSpacing: '-0.5px' }}>How It Works</h2>
          <p className="text-muted" style={{ marginBottom: '64px', fontSize: '1.125rem' }}>Three steps to your branded profile picture.</p>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px', textAlign: 'left' }}>
            <div className="glass-panel" style={{ transition: 'transform 0.3s ease', cursor: 'default' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px', color: 'var(--text-main)' }}>
                <ImageIcon size={24} />
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '16px', fontWeight: 600 }}>1. Upload Image</h3>
              <p className="text-muted" style={{ lineHeight: 1.6, fontSize: '0.95rem' }}>Upload any profile picture or avatar. JPG, PNG, or WEBP up to 5MB. Your image is never stored permanently on our servers.</p>
            </div>
            
            <div className="glass-panel" style={{ position: 'relative', overflow: 'hidden', transition: 'transform 0.3s ease', cursor: 'default' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
              <div style={{ position: 'absolute', top: 0, right: 0, width: '150px', height: '150px', background: 'rgba(0, 229, 255, 0.1)', filter: 'blur(50px)', borderRadius: '50%' }}></div>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(0, 229, 255, 0.1)', border: '1px solid rgba(0, 229, 255, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px', color: 'var(--accent)', position: 'relative' }}>
                <Layers size={24} />
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '16px', fontWeight: 600, position: 'relative' }}>2. AI Tagline & Overlay</h3>
              <p className="text-muted" style={{ lineHeight: 1.6, fontSize: '0.95rem', position: 'relative' }}>A random sleek overlay is composited onto your image with a unique AI tagline generated via Ask June infrastructure.</p>
            </div>
            
            <div className="glass-panel" style={{ transition: 'transform 0.3s ease', cursor: 'default' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px', color: 'var(--text-main)' }}>
                <Sparkles size={24} />
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '16px', fontWeight: 600 }}>3. Download & Rep</h3>
              <p className="text-muted" style={{ lineHeight: 1.6, fontSize: '0.95rem' }}>Download your high-resolution 1080x1080 PFP. Share it on X and other socials to represent the Ask June AI ecosystem.</p>
            </div>
          </div>
        </section>

      </main>

      <footer style={{ padding: '48px 0', borderTop: '1px solid var(--card-border)', background: 'rgba(5, 13, 20, 0.5)', color: 'var(--text-muted)' }}>
        <div className="container flex-center" style={{ justifyContent: 'space-between', fontSize: '0.9rem' }}>
          <span>© 2026 Ask June AI. All rights reserved.</span>
          <div style={{ display: 'flex', gap: '24px' }}>
            <a href="#" className="hover-white" style={{ transition: 'color 0.2s' }}>Discord</a>
            <a href="#" className="hover-white" style={{ transition: 'color 0.2s' }}>X (Twitter)</a>
            <a href="#" className="hover-white" style={{ transition: 'color 0.2s' }}>Blog</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
