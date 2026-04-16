import React, { useState, useEffect } from 'react';
import { Key, Check, X, ExternalLink, Eye, EyeOff } from 'lucide-react';
import { getStoredApiKey, setStoredApiKey, clearStoredApiKey } from '../utils/juneApi';

interface ApiKeyInputProps {
  onKeyChange: (key: string | null) => void;
}

export default function ApiKeyInput({ onKeyChange }: ApiKeyInputProps) {
  const [key, setKey] = useState('');
  const [saved, setSaved] = useState(false);
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    const stored = getStoredApiKey();
    if (stored) {
      setKey(stored);
      setSaved(true);
      onKeyChange(stored);
    }
  }, []);

  const handleSave = () => {
    if (!key.trim()) return;
    setStoredApiKey(key.trim());
    setSaved(true);
    onKeyChange(key.trim());
  };

  const handleClear = () => {
    clearStoredApiKey();
    setKey('');
    setSaved(false);
    onKeyChange(null);
  };

  const maskedKey = key ? `${key.slice(0, 8)}${'•'.repeat(Math.max(0, key.length - 12))}${key.slice(-4)}` : '';

  return (
    <div className="api-key-container glass-panel" style={{ padding: '24px', marginBottom: '32px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '12px',
          background: saved ? 'rgba(0, 229, 255, 0.15)' : 'rgba(255,255,255,0.05)',
          border: `1px solid ${saved ? 'rgba(0, 229, 255, 0.3)' : 'rgba(255,255,255,0.1)'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.3s ease',
        }}>
          <Key size={18} style={{ color: saved ? 'var(--accent)' : 'var(--text-muted)' }} />
        </div>
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '2px' }}>
            June API Key
            {saved && (
              <span style={{
                marginLeft: '10px',
                fontSize: '0.7rem',
                padding: '3px 10px',
                borderRadius: '99px',
                background: 'rgba(0, 229, 255, 0.1)',
                color: 'var(--accent)',
                border: '1px solid rgba(0, 229, 255, 0.2)',
                fontWeight: 500,
                verticalAlign: 'middle',
              }}>Connected</span>
            )}
          </h3>
          <p className="text-muted" style={{ fontSize: '0.8rem' }}>
            Get your key from{' '}
            <a
              href="https://askjune.ai/platform/api-keys"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--accent)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
            >
              askjune.ai <ExternalLink size={11} />
            </a>
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '8px' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <input
            type={showKey ? 'text' : 'password'}
            value={saved && !showKey ? maskedKey : key}
            onChange={(e) => {
              setKey(e.target.value);
              if (saved) setSaved(false);
            }}
            placeholder="Enter your June API key..."
            style={{
              width: '100%',
              padding: '12px 44px 12px 16px',
              background: 'rgba(255,255,255,0.03)',
              border: `1px solid ${saved ? 'rgba(0, 229, 255, 0.2)' : 'rgba(255,255,255,0.12)'}`,
              borderRadius: '12px',
              color: 'var(--text-main)',
              fontSize: '0.9rem',
              fontFamily: 'monospace',
              outline: 'none',
              transition: 'all 0.3s ease',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'rgba(0, 229, 255, 0.4)';
              e.currentTarget.style.boxShadow = '0 0 16px rgba(0, 229, 255, 0.08)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = saved ? 'rgba(0, 229, 255, 0.2)' : 'rgba(255,255,255,0.12)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          />
          <button
            onClick={() => setShowKey(!showKey)}
            style={{
              position: 'absolute',
              right: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              transition: 'color 0.2s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-main)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
          >
            {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {!saved ? (
          <button
            className="btn btn-accent"
            onClick={handleSave}
            style={{ padding: '12px 20px', borderRadius: '12px', fontSize: '0.85rem' }}
          >
            <Check size={16} /> Save
          </button>
        ) : (
          <button
            className="btn btn-ghost"
            onClick={handleClear}
            style={{ padding: '12px 16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', fontSize: '0.85rem' }}
          >
            <X size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
