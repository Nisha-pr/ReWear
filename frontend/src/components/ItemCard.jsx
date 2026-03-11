import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, MapPin, Leaf } from 'lucide-react';

const ItemCard = ({ item, index = 0 }) => {
  const img = item?.images?.[0]?.url || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400';

  const conditionColor = {
    'Brand New': '#22c55e',
    'Like New': '#4DB6AC',
    'Good': '#3b82f6',
    'Fair': '#f59e0b',
    'Worn': '#6b7280',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
    >
      <Link to={`/item/${item._id}`} style={{ textDecoration: 'none' }}>
        <div className="item-card">
          {/* Image */}
          <div style={{ position: 'relative', overflow: 'hidden' }}>
            <img src={img} alt={item.title} loading="lazy"
              onError={e => { e.currentTarget.src = 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400'; }}
            />
            {/* Condition badge */}
            <span style={{
              position: 'absolute', top: '12px', left: '12px',
              background: 'rgba(0,0,0,0.65)', color: 'white',
              backdropFilter: 'blur(8px)', padding: '0.25rem 0.7rem',
              borderRadius: '100px', fontSize: '0.72rem', fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: '0.3rem'
            }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: conditionColor[item.condition] || '#6b7280' }} />
              {item.condition}
            </span>
            {/* Type badge */}
            {item.type && (
              <span style={{
                position: 'absolute', top: '12px', right: '12px',
                background: item.type === 'Points' ? 'rgba(77,182,172,0.9)' : 'rgba(27,94,32,0.9)',
                color: 'white', padding: '0.25rem 0.7rem', borderRadius: '100px',
                fontSize: '0.72rem', fontWeight: 700
              }}>
                {item.type === 'Points' ? '🪙 Points' : item.type === 'Swap' ? '🔄 Swap' : '✨ Both'}
              </span>
            )}
          </div>

          {/* Content */}
          <div style={{ padding: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <h3 style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1a1a2e', lineHeight: 1.3, flex: 1 }}>
                {item.title}
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', flexShrink: 0 }}>
                <Star size={13} fill="#F59E0B" color="#F59E0B" />
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#374151' }}>
                  {item.averageRating > 0 ? item.averageRating.toFixed(1) : '—'}
                </span>
              </div>
            </div>

            {/* Size & Category */}
            <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
              <span className="tag">{item.size}</span>
              <span className="tag">{item.category}</span>
            </div>

            {/* Location & Points */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#6B7280', fontSize: '0.8rem' }}>
                <MapPin size={13} />
                <span>{item.location?.city || 'Unknown'}</span>
              </div>
              <div className="points-display" style={{ fontSize: '0.9rem' }}>
                <Leaf size={14} />
                {item.pointsValue} pts
              </div>
            </div>

            {/* Owner */}
            {item.owner && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid #f3f4f6' }}>
                <img
                  src={item.owner.avatar || `https://ui-avatars.com/api/?name=${item.owner.name}&background=1B5E20&color=fff&size=32`}
                  alt={item.owner.name}
                  style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover' }}
                />
                <span style={{ fontSize: '0.8rem', color: '#6B7280' }}>{item.owner.name}</span>
              </div>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ItemCard;
