import { Download, RefreshCw, Share2, Sparkles } from 'lucide-react';

interface ResultDisplayProps {
  imageUrl: string;
  onReset: () => void;
}

export default function ResultDisplay({ imageUrl, onReset }: ResultDisplayProps) {
  
  const handleDownload = async () => {
    try {
      // Due to canvas/CORS rules from external URLs, we might need to fetch the blob to force download
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `AskJuneAI_Fashion_PFP_${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e) {
      // fallback
      window.open(imageUrl, '_blank');
    }
  };

  const handleShare = () => {
    const text = encodeURIComponent("Just upgraded my fit with @askjuneai Fashion Studio! 🔥 Check this out.");
    const url = encodeURIComponent("https://askjune.ai");
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
  };

  return (
    <div className="glass-panel">
      <div className="glass-panel-header">
        <h2 className="glass-panel-title">
          <div className="number-badge">3</div>
          Your Fashion PFP
        </h2>
      </div>

      <div className="result-container">
        <div className="result-image-wrapper">
          <img src={imageUrl} alt="Generated Fashion PFP" crossOrigin="anonymous" />
          <div className="watermark">
            <Sparkles size={14} /> ASK JUNE AI
          </div>
        </div>

        <div className="result-actions">
          <button className="btn-secondary" onClick={handleShare}>
            <Share2 size={18} /> Share
          </button>
          <button className="btn-primary" onClick={handleDownload} style={{ padding: '14px' }}>
            <Download size={18} /> Download
          </button>
        </div>

        <button 
          onClick={onReset}
          style={{ 
            fontFamily: 'var(--font-mono)', 
            fontSize: '0.85rem', 
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <RefreshCw size={14} /> Generate Another
        </button>
      </div>
    </div>
  );
}
