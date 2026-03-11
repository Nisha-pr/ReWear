import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Star, MapPin, User, Heart, RefreshCw, Coins, ChevronLeft,
  ChevronRight, Shield, Clock, BadgeCheck, Send, ArrowLeft, Leaf
} from 'lucide-react';
import { itemService, reviewService, swapService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import ItemCard from '../components/ItemCard';
import toast from 'react-hot-toast';

const StarRating = ({ rating, interactive = false, onRate }) => {
  const [hover, setHover] = useState(0);
  return (
    <div style={{ display: 'flex', gap: '2px' }}>
      {[1, 2, 3, 4, 5].map(star => (
        <button key={star} type="button" onClick={() => interactive && onRate?.(star)}
          onMouseEnter={() => interactive && setHover(star)}
          onMouseLeave={() => interactive && setHover(0)}
          style={{ background: 'none', border: 'none', cursor: interactive ? 'pointer' : 'default', padding: '2px', transition: 'transform 0.1s' }}
          onMouseDown={e => interactive && (e.currentTarget.style.transform = 'scale(1.3)')}
          onMouseUp={e => interactive && (e.currentTarget.style.transform = 'scale(1)')}
        >
          <Star size={interactive ? 24 : 16}
            fill={(hover || rating) >= star ? '#F59E0B' : 'none'}
            color={(hover || rating) >= star ? '#F59E0B' : '#D1D5DB'}
          />
        </button>
      ))}
    </div>
  );
};

const ItemDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [item, setItem] = useState(null);
  const [ownerItems, setOwnerItems] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [swapModal, setSwapModal] = useState(false);
  const [swapType, setSwapType] = useState('points');
  const [swapMessage, setSwapMessage] = useState('');
  const [swapping, setSwapping] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 0, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [itemRes, reviewRes] = await Promise.all([
          itemService.getItem(id),
          reviewService.getItemReviews(id),
        ]);
        setItem(itemRes.data.item);
        setOwnerItems(itemRes.data.ownerItems || []);
        setReviews(reviewRes.data.reviews || []);
      } catch (e) {
        console.error(e);
        toast.error('Item not found');
        navigate('/browse');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleSwapRequest = async () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    setSwapping(true);
    try {
      await swapService.createSwap({ itemId: id, type: swapType, message: swapMessage });
      toast.success('Swap request sent successfully! 🎉');
      setSwapModal(false);
      setSwapMessage('');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to send swap request');
    } finally {
      setSwapping(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!newReview.rating) { toast.error('Please select a rating'); return; }
    setSubmittingReview(true);
    try {
      const { data } = await reviewService.createReview(id, newReview);
      setReviews(prev => [data.review, ...prev]);
      setNewReview({ rating: 0, comment: '' });
      toast.success('Review submitted! ⭐');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" />
      </div>
    );
  }

  if (!item) return null;

  const images = item.images?.length > 0 ? item.images : [{ url: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600' }];
  const isOwner = user?._id === item.owner?._id;
  const conditionColors = { 'Brand New': '#22c55e', 'Like New': '#4DB6AC', 'Good': '#3b82f6', 'Fair': '#f59e0b', 'Worn': '#6b7280' };

  return (
    <div style={{ minHeight: '100vh', background: '#F5F5F5' }}>
      <div className="container-main" style={{ padding: '2rem 1.5rem' }}>
        {/* Back button */}
        <button onClick={() => navigate(-1)} className="btn-ghost" style={{ marginBottom: '1.5rem' }}>
          <ArrowLeft size={18} /> Back
        </button>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2.5rem' }}>
          {/* ─── LEFT: Images ─────────────────────────────────────────────── */}
          <div>
            {/* Main Image */}
            <div style={{ position: 'relative', borderRadius: '20px', overflow: 'hidden', background: '#f9f9f9', marginBottom: '1rem' }}>
              <motion.img
                key={activeImage}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                src={images[activeImage]?.url}
                alt={item.title}
                style={{ width: '100%', aspectRatio: '4/5', objectFit: 'cover' }}
              />
              {images.length > 1 && (
                <>
                  <button onClick={() => setActiveImage(i => (i - 1 + images.length) % images.length)}
                    style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
                    <ChevronLeft size={20} />
                  </button>
                  <button onClick={() => setActiveImage(i => (i + 1) % images.length)}
                    style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
                    <ChevronRight size={20} />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail row */}
            {images.length > 1 && (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {images.map((img, i) => (
                  <button key={i} onClick={() => setActiveImage(i)}
                    style={{ width: '70px', height: '70px', borderRadius: '10px', overflow: 'hidden', border: `2px solid ${i === activeImage ? '#1B5E20' : '#E5E7EB'}`, cursor: 'pointer', background: 'none', padding: 0, transition: 'all 0.2s' }}>
                    <img src={img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ─── RIGHT: Details ────────────────────────────────────────────── */}
          <div>
            {/* Tags row */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
              <span style={{ padding: '0.3rem 0.85rem', borderRadius: '100px', background: `${conditionColors[item.condition]}20`, color: conditionColors[item.condition], fontSize: '0.8rem', fontWeight: 700 }}>
                {item.condition}
              </span>
              <span className="badge badge-green">{item.category}</span>
              {item.type && <span className="badge badge-teal">{item.type === 'Both' ? 'Swap & Points' : item.type}</span>}
              <span style={{
                padding: '0.3rem 0.85rem', borderRadius: '100px', fontSize: '0.8rem', fontWeight: 700,
                background: item.status === 'approved' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.1)',
                color: item.status === 'approved' ? '#16a34a' : '#dc2626'
              }}>
                {item.status === 'approved' ? '✓ Available' : `Status: ${item.status}`}
              </span>
            </div>

            <h1 style={{ fontFamily: 'Poppins', fontWeight: 800, fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', color: '#1a1a2e', marginBottom: '0.75rem' }}>
              {item.title}
            </h1>

            {/* Rating */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <StarRating rating={item.averageRating || 0} />
              <span style={{ fontWeight: 700, color: '#374151' }}>{item.averageRating?.toFixed(1) || '—'}</span>
              <span style={{ color: '#9CA3AF', fontSize: '0.9rem' }}>({item.reviewCount || 0} reviews)</span>
            </div>

            {/* Points Value */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'linear-gradient(135deg, rgba(77,182,172,0.1), rgba(27,94,32,0.1))', border: '2px solid rgba(77,182,172,0.3)', borderRadius: '14px', padding: '0.75rem 1.25rem', marginBottom: '1.5rem' }}>
              <Leaf size={22} color="#4DB6AC" />
              <span style={{ fontFamily: 'Poppins', fontWeight: 800, fontSize: '1.5rem', color: '#1B5E20' }}>{item.pointsValue}</span>
              <span style={{ color: '#4DB6AC', fontWeight: 600 }}>points</span>
            </div>

            {/* Details grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
              {[
                { label: 'Size', value: item.size },
                { label: 'Category', value: item.category },
                { label: 'Condition', value: item.condition },
                { label: 'Type', value: item.type },
              ].map(({ label, value }) => (
                <div key={label} style={{ background: 'white', borderRadius: '12px', padding: '0.85rem', border: '1px solid #F3F4F6' }}>
                  <p style={{ fontSize: '0.75rem', color: '#9CA3AF', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.2rem' }}>{label}</p>
                  <p style={{ fontWeight: 700, color: '#1a1a2e', fontSize: '0.95rem' }}>{value}</p>
                </div>
              ))}
            </div>

            {/* Description */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontWeight: 700, fontSize: '1rem', color: '#374151', marginBottom: '0.5rem' }}>Description</h3>
              <p style={{ color: '#6B7280', lineHeight: 1.7, fontSize: '0.95rem' }}>{item.description}</p>
            </div>

            {/* Tags */}
            {item.tags?.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1.5rem' }}>
                {item.tags.map(tag => <span key={tag} className="tag">#{tag}</span>)}
              </div>
            )}

            {/* Location */}
            {item.location?.city && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6B7280', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                <MapPin size={16} color="#4DB6AC" />
                {item.location.city}{item.location.state ? `, ${item.location.state}` : ''}
              </div>
            )}

            {/* Action buttons */}
            {!isOwner && item.status === 'approved' && item.isAvailable && (
              <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                <button onClick={() => { setSwapType('swap'); setSwapModal(true); }}
                  className="btn-primary" style={{ flex: 1, justifyContent: 'center', padding: '0.9rem' }}>
                  <RefreshCw size={18} /> Request Swap
                </button>
                <button onClick={() => { setSwapType('points'); setSwapModal(true); }}
                  className="btn-accent" style={{ flex: 1, justifyContent: 'center', padding: '0.9rem' }}>
                  <Coins size={18} /> Redeem with Points
                </button>
              </div>
            )}

            {isOwner && (
              <div style={{ background: 'rgba(27,94,32,0.08)', borderRadius: '14px', padding: '1rem', marginBottom: '1.5rem', textAlign: 'center', color: '#1B5E20', fontWeight: 600 }}>
                ✅ This is your listing
              </div>
            )}

            {/* Owner card */}
            <div style={{ background: 'white', borderRadius: '16px', padding: '1.25rem', border: '1px solid rgba(165,214,167,0.3)' }}>
              <h3 style={{ fontWeight: 700, fontSize: '0.9rem', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '1rem' }}>Listed By</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <img
                  src={item.owner?.avatar || `https://ui-avatars.com/api/?name=${item.owner?.name}&background=1B5E20&color=fff`}
                  alt={item.owner?.name}
                  style={{ width: '52px', height: '52px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #A5D6A7' }}
                />
                <div>
                  <p style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '1rem', color: '#1a1a2e' }}>{item.owner?.name}</p>
                  <p style={{ fontSize: '0.8rem', color: '#6B7280' }}>{item.owner?.totalSwaps || 0} swaps completed</p>
                  <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.3rem' }}>
                    {item.owner?.badges?.slice(0, 2).map(badge => (
                      <span key={badge} style={{ fontSize: '0.7rem', background: 'rgba(27,94,32,0.1)', color: '#1B5E20', padding: '0.1rem 0.5rem', borderRadius: '100px', fontWeight: 600 }}>
                        {badge}
                      </span>
                    ))}
                  </div>
                </div>
                <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                  <p style={{ fontSize: '0.8rem', color: '#9CA3AF' }}>Points</p>
                  <p style={{ fontWeight: 700, color: '#4DB6AC', fontSize: '1rem' }}>🌿 {item.owner?.points}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ─── REVIEWS SECTION ──────────────────────────────────────────────── */}
        <div style={{ marginTop: '3rem' }}>
          <h2 style={{ fontFamily: 'Poppins', fontWeight: 800, fontSize: '1.5rem', color: '#1a1a2e', marginBottom: '2rem' }}>
            ⭐ Reviews ({reviews.length})
          </h2>

          {/* Add Review */}
          {isAuthenticated && !isOwner && (
            <div className="card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
              <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>Leave a Review</h3>
              <form onSubmit={handleSubmitReview} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ fontWeight: 600, fontSize: '0.875rem', color: '#374151', display: 'block', marginBottom: '0.5rem' }}>Rating</label>
                  <StarRating rating={newReview.rating} interactive onRate={r => setNewReview(prev => ({ ...prev, rating: r }))} />
                </div>
                <div>
                  <label style={{ fontWeight: 600, fontSize: '0.875rem', color: '#374151', display: 'block', marginBottom: '0.5rem' }}>Comment</label>
                  <textarea className="input-field" rows={3} placeholder="Share your experience..."
                    value={newReview.comment} onChange={e => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                    style={{ resize: 'vertical' }} />
                </div>
                <button type="submit" className="btn-primary" disabled={submittingReview} style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {submittingReview ? <div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }} /> : <Send size={16} />}
                  Submit Review
                </button>
              </form>
            </div>
          )}

          {/* Reviews list */}
          {reviews.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {reviews.map(review => (
                <motion.div key={review._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className="card" style={{ padding: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
                    <img src={review.user?.avatar || `https://ui-avatars.com/api/?name=${review.user?.name}&background=1B5E20&color=fff`}
                      alt="" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                    <div>
                      <p style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1a1a2e' }}>{review.user?.name}</p>
                      <p style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>{new Date(review.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div style={{ marginLeft: 'auto' }}>
                      <StarRating rating={review.rating} />
                    </div>
                  </div>
                  {review.comment && <p style={{ color: '#6B7280', fontSize: '0.9rem', lineHeight: 1.6 }}>{review.comment}</p>}
                </motion.div>
              ))}
            </div>
          ) : (
            <p style={{ color: '#9CA3AF', textAlign: 'center', padding: '2rem' }}>No reviews yet. Be the first to review!</p>
          )}
        </div>

        {/* ─── MORE FROM OWNER ──────────────────────────────────────────────── */}
        {ownerItems.length > 0 && (
          <div style={{ marginTop: '3rem' }}>
            <h2 style={{ fontFamily: 'Poppins', fontWeight: 800, fontSize: '1.5rem', color: '#1a1a2e', marginBottom: '1.5rem' }}>
              More from {item.owner?.name?.split(' ')[0]}
            </h2>
            <div className="items-grid">
              {ownerItems.map((oi, i) => <ItemCard key={oi._id} item={oi} index={i} />)}
            </div>
          </div>
        )}
      </div>

      {/* ─── SWAP MODAL ──────────────────────────────────────────────────────── */}
      {swapModal && (
        <>
          <div className="overlay" onClick={() => setSwapModal(false)} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            style={{
              position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
              background: 'white', borderRadius: '24px', padding: '2rem',
              width: 'min(500px, calc(100vw - 2rem))', zIndex: 300,
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
            }}>
            <h2 style={{ fontFamily: 'Poppins', fontWeight: 800, fontSize: '1.4rem', marginBottom: '0.5rem' }}>
              {swapType === 'points' ? '🌿 Redeem with Points' : '🔄 Request Swap'}
            </h2>
            <p style={{ color: '#6B7280', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              {swapType === 'points'
                ? `This will cost ${item.pointsValue} points. Your balance: 🌿 ${user?.points} pts`
                : 'Send a swap request to the owner'}
            </p>

            {swapType === 'points' && user?.points < item.pointsValue && (
              <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '12px', padding: '0.75rem', marginBottom: '1rem', color: '#dc2626', fontSize: '0.875rem' }}>
                ⚠️ Insufficient points. You need {item.pointsValue - user.points} more points.
              </div>
            )}

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontWeight: 600, fontSize: '0.875rem', color: '#374151', display: 'block', marginBottom: '0.5rem' }}>Message (optional)</label>
              <textarea className="input-field" rows={3} placeholder="Add a message to the owner..."
                value={swapMessage} onChange={e => setSwapMessage(e.target.value)} style={{ resize: 'none' }} />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button onClick={() => setSwapModal(false)} className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
              <button onClick={handleSwapRequest} className="btn-primary" disabled={swapping || (swapType === 'points' && user?.points < item.pointsValue)}
                style={{ flex: 1, justifyContent: 'center' }}>
                {swapping ? <div className="spinner" style={{ width: '18px', height: '18px', borderWidth: '2px' }} /> : 'Send Request'}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
};

export default ItemDetailPage;
