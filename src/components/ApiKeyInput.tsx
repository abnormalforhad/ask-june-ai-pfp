import { useState, useEffect } from 'react';
import { Key } from 'lucide-react';

interface ApiKeyInputProps {
  apiKey: string;
  setApiKey: (key: string) => void;
}

export default function ApiKeyInput({ apiKey, setApiKey }: ApiKeyInputProps) {
  const [inputVal, setInputVal] = useState(apiKey);

  useEffect(() => {
    // Sync initial state from prop
    setInputVal(apiKey);
  }, [apiKey]);

  const handleSave = () => {
    const val = inputVal.trim();
    setApiKey(val);
    if (val) {
      localStorage.setItem('JUNE_API_KEY', val);
    } else {
      localStorage.removeItem('JUNE_API_KEY');
    }
  };

  return (
    <div style={{
      background: 'rgba(255,255,255,0.02)',
      border: '1px solid var(--card-border)',
      borderRadius: '12px',
      padding: '20px',
      marginTop: '20px',
      textAlign: 'left'
    }}>
      <h3 style={{ fontSize: '1.1rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Key size={18} className="gradient-text" /> 
        June AI API Key
      </h3>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '16px' }}>
        This application runs fully in your browser. Enter your Ask June Developer API Key to generate images. Your key is stored locally and never sent to our servers.
      </p>
      
      <div style={{ display: 'flex', gap: '10px' }}>
        <input 
          type="password" 
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          placeholder="eyJw..."
          style={{
            flex: 1,
            background: 'rgba(0,0,0,0.2)',
            border: '1px solid var(--card-border)',
            borderRadius: '8px',
            padding: '12px 16px',
            color: 'white',
            fontSize: '1rem',
            outline: 'none'
          }}
        />
        <button 
          onClick={handleSave}
          style={{
            background: apiKey === inputVal && apiKey ? 'rgba(50, 255, 150, 0.1)' : 'rgba(255,255,255,0.1)',
            border: apiKey === inputVal && apiKey ? '1px solid rgba(50, 255, 150, 0.3)' : '1px solid rgba(255,255,255,0.2)',
            color: apiKey === inputVal && apiKey ? '#32ff96' : 'white',
            padding: '0 20px',
            borderRadius: '8px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          {apiKey === inputVal && apiKey ? 'Saved' : 'Save Key'}
        </button>
      </div>
    </div>
  );
}
