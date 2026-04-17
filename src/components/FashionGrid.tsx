import { useState } from 'react';
import { Check, X } from 'lucide-react';
import { FASHION_ITEMS, CATEGORY_LABELS, type FashionCategory } from '../data/fashionItems';

interface FashionGridProps {
  selectedIds: string[];
  onToggleItem: (id: string) => void;
  onClear: () => void;
}

export default function FashionGrid({ selectedIds, onToggleItem, onClear }: FashionGridProps) {
  const [activeCategory, setActiveCategory] = useState<FashionCategory | 'all'>('all');

  const filteredItems = activeCategory === 'all' 
    ? FASHION_ITEMS 
    : FASHION_ITEMS.filter(item => item.category === activeCategory);

  const selectedItemsDetails = FASHION_ITEMS.filter(item => selectedIds.includes(item.id));

  return (
    <div className="glass-panel">
      <div className="glass-panel-header">
        <h2 className="glass-panel-title">
          <div className="number-badge">2</div>
          Select Fashion
        </h2>
        {selectedIds.length > 0 && (
          <span style={{ fontSize: '0.85rem', color: 'var(--accent-cyan)' }}>
            {selectedIds.length} item{selectedIds.length !== 1 ? 's' : ''} selected
          </span>
        )}
      </div>

      {/* Category Tabs */}
      <div className="fashion-category-tabs">
        <button 
          className={`category-tab ${activeCategory === 'all' ? 'active' : ''}`}
          onClick={() => setActiveCategory('all')}
        >
          All Items
        </button>
        {(['headwear', 'eyewear', 'tops', 'accessories', 'footwear'] as FashionCategory[]).map(cat => (
          <button
            key={cat}
            className={`category-tab ${activeCategory === cat ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat)}
          >
            {CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      {/* Items Grid */}
      <div className="fashion-items-grid">
        {filteredItems.map(item => {
          const isSelected = selectedIds.includes(item.id);
          return (
            <div 
              key={item.id}
              className={`fashion-item-card ${isSelected ? 'selected' : ''}`}
              onClick={() => onToggleItem(item.id)}
            >
              <div className="fashion-item-check">
                <Check size={14} strokeWidth={3} />
              </div>
              <img src={item.thumbnail} alt={item.name} className="fashion-item-image" />
              <div className="fashion-item-name">{item.name}</div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      {selectedItemsDetails.length > 0 && (
        <div className="selected-summary">
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginRight: 'auto' }}>
            Your Selection:
          </div>
          {selectedItemsDetails.map(item => (
            <div key={`summary-${item.id}`} className="selected-item-chip">
              <img src={item.thumbnail} alt={item.name} />
              <span>{item.name}</span>
              <button 
                className="selected-item-remove"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleItem(item.id);
                }}
              >
                <X size={14} />
              </button>
            </div>
          ))}
          <button 
            onClick={onClear}
            style={{ 
              fontSize: '0.8rem', 
              color: 'var(--text-muted)', 
              textDecoration: 'underline',
              marginLeft: '8px' 
            }}
          >
            Clear All
          </button>
        </div>
      )}
    </div>
  );
}
