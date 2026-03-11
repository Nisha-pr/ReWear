import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView, useMotionValue, useSpring } from 'framer-motion';
import {
  Leaf, ArrowRight, ShoppingBag, RefreshCw, Star,
  MapPin, Zap, Shield, Users, Recycle, Droplets, Wind
} from 'lucide-react';
import ItemCard from '../components/ItemCard';
import { itemService, statsService } from '../services/api';

// ─── Animated Counter ─────────────────────────────────────────────────────────
const AnimatedCounter = ({ target, suffix = '', prefix = '' }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const motionValue = useMotionValue(0);
  const spring = useSpring(motionValue, { duration: 2000, bounce: 0 });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (isInView) motionValue.set(target);
  }, [isInView, target, motionValue]);

  useEffect(() => {
    return spring.on('change', (v) => setDisplay(Math.round(v)));
  }, [spring]);

  return (
    <span ref={ref} className="stat-counter">
      {prefix}{display.toLocaleString()}{suffix}
    </span>
  );
};

// ─── Category Card ────────────────────────────────────────────────────────────
const categories = [
  { name: 'Tops', icon: '👕', color: '#E8F5E9', img: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=300' },
  { name: 'Dresses', icon: '👗', color: '#E0F2F1', img: 'https://images.unsplash.com/photo-1582533561751-ef6f6ab93a2e?w=300' },
  { name: 'Outerwear', icon: '🧥', color: '#F3E5F5', img: 'https://images.unsplash.com/photo-1548123378-bde4eca81d2d?w=300' },
  { name: 'Shoes', icon: '👟', color: '#FFF3E0', img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300' },
  { name: 'Accessories', icon: '👜', color: '#FCE4EC', img: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300' },
  { name: 'Activewear', icon: '🏃', color: '#E8EAF6', img: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300' },
];

const LandingPage = () => {
  const [featuredItems, setFeaturedItems] = useState([]);
  const [stats, setStats] = useState({ totalItemsReused: 2400, totalWaterSaved: 6480000, totalCarbonSaved: 6000, totalUsers: 1200 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [itemsRes, statsRes] = await Promise.allSettled([
          itemService.getFeatured(),
          statsService.getSustainabilityStats(),
        ]);
        if (itemsRes.status === 'fulfilled') setFeaturedItems(itemsRes.value.data.items || []);
        if (statsRes.status === 'fulfilled') setStats(prev => ({ ...prev, ...statsRes.value.data.stats }));
      } catch {}
    };
    fetchData();
  }, []);

  return (
    <div>
      {/* ─── HERO SECTION ─────────────────────────────────────────────────── */}
      <section className="hero-gradient" style={{ color: 'white', padding: 'clamp(5rem, 12vw, 8rem) 0 clamp(4rem, 8vw, 6rem)', position: 'relative', overflow: 'hidden' }}>
        {/* Decorative elements */}
        <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '500px', height: '500px', borderRadius: '50%', background: 'rgba(77,182,172,0.1)', filter: 'blur(80px)' }} />
        <div style={{ position: 'absolute', bottom: '-80px', left: '-80px', width: '350px', height: '350px', borderRadius: '50%', background: 'rgba(165,214,167,0.08)', filter: 'blur(60px)' }} />

        <div className="container-main" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '4rem', alignItems: 'center' }}>
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(165,214,167,0.2)', border: '1px solid rgba(165,214,167,0.4)', color: '#A5D6A7', padding: '0.4rem 1rem', borderRadius: '100px', fontSize: '0.85rem', fontWeight: 600, marginBottom: '1.5rem' }}>
                <Leaf size={14} /> 🌍 Sustainable Fashion Movement
              </span>

              <h1 style={{ fontFamily: 'Poppins', fontWeight: 900, fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', lineHeight: 1.05, marginBottom: '1.25rem' }}>
                Swap Clothes,{' '}
                <span style={{ color: '#A5D6A7' }}>Save the</span>{' '}
                <span style={{ background: 'linear-gradient(135deg, #4DB6AC, #80CBC4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Planet</span>
              </h1>

              <p style={{ fontSize: 'clamp(1rem, 2vw, 1.2rem)', color: 'rgba(255,255,255,0.75)', lineHeight: 1.7, marginBottom: '2.5rem', maxWidth: '520px' }}>
                Join thousands of eco-conscious fashion lovers exchanging clothes. Refresh your wardrobe sustainably — swap, earn points, reduce waste.
              </p>

              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <Link to="/browse" className="btn-accent" style={{ fontSize: '1rem', padding: '0.9rem 2rem' }}>
                  <ShoppingBag size={18} /> Start Swapping
                </Link>
                <Link to="/browse" style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                  color: 'rgba(255,255,255,0.85)', textDecoration: 'none',
                  fontWeight: 600, fontSize: '0.95rem', padding: '0.9rem 1.5rem',
                  border: '2px solid rgba(255,255,255,0.25)', borderRadius: '12px',
                  transition: 'all 0.2s'
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.5)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'; }}
                >
                  Browse Items <ArrowRight size={16} />
                </Link>
                <Link to="/add-item" style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                  color: '#A5D6A7', textDecoration: 'none', fontWeight: 600, fontSize: '0.95rem'
                }}>
                  + List an Item
                </Link>
              </div>

              {/* Trust indicators */}
              <div style={{ display: 'flex', gap: '1.5rem', marginTop: '2.5rem', flexWrap: 'wrap' }}>
                {[
                  { label: '1200+ Users', icon: Users },
                  { label: 'Free to Join', icon: Zap },
                  { label: '100% Secure', icon: Shield },
                ].map(({ label, icon: Icon }) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem' }}>
                    <Icon size={15} color="#4DB6AC" />
                    {label}
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Right - Floating Cards */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', position: 'relative' }}
              className="hidden-mobile"
            >
              {[
                { img: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=300', title: 'Summer Dress', pts: 80, stars: '4.9' },
                { img: 'https://images.unsplash.com/photo-1548123378-bde4eca81d2d?w=300', title: 'Vintage Jacket', pts: 120, stars: '4.8', delay: 1 },
                { img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300', title: 'Sport Shoes', pts: 150, stars: '5.0', delay: 2 },
                { img: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=300', title: 'Floral Top', pts: 60, stars: '4.7', delay: 0.5 },
              ].map((card, i) => (
                <motion.div
                  key={i}
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 3, delay: card.delay || 0, repeat: Infinity, ease: 'easeInOut' }}
                  style={{
                    background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255,255,255,0.2)', borderRadius: '16px',
                    overflow: 'hidden'
                  }}
                >
                  <img src={card.img} alt={card.title} style={{ width: '100%', aspectRatio: '3/4', objectFit: 'cover' }} />
                  <div style={{ padding: '0.75rem' }}>
                    <p style={{ fontWeight: 700, fontSize: '0.85rem', color: 'white' }}>{card.title}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.3rem' }}>
                      <span style={{ fontSize: '0.75rem', color: '#A5D6A7' }}>🌿 {card.pts} pts</span>
                      <span style={{ fontSize: '0.75rem', color: '#fbbf24' }}>⭐ {card.stars}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
              <style>{`.hidden-mobile { @media (max-width: 768px) { display: none; } }`}</style>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── SUSTAINABILITY STATS ──────────────────────────────────────────── */}
      <section id="impact" style={{ background: 'white', padding: '4rem 0', borderBottom: '1px solid #f3f4f6' }}>
        <div className="container-main">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', textAlign: 'center' }}>
            {[
              { label: 'Items Reused', value: stats.totalItemsReused, suffix: '+', icon: Recycle, color: '#1B5E20' },
              { label: 'Liters Water Saved', value: Math.round((stats.totalWaterSaved || 0) / 1000), suffix: 'K L', icon: Droplets, color: '#0288D1' },
              { label: 'kg CO₂ Reduced', value: stats.totalCarbonSaved, suffix: ' kg', icon: Wind, color: '#4DB6AC' },
              { label: 'Active Members', value: stats.totalUsers || 1200, suffix: '+', icon: Users, color: '#7B1FA2' },
            ].map(stat => (
              <motion.div
                key={stat.label}
                whileHover={{ y: -4 }}
                style={{ padding: '2rem', borderRadius: '16px', background: '#F9FBF9', border: '1px solid rgba(165,214,167,0.2)' }}
              >
                <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: `${stat.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                  <stat.icon size={24} color={stat.color} />
                </div>
                <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                <p style={{ color: '#6B7280', fontSize: '0.9rem', marginTop: '0.5rem', fontWeight: 500 }}>{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURED ITEMS ────────────────────────────────────────────────── */}
      <section style={{ padding: '5rem 0' }}>
        <div className="container-main">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <span className="section-label"><Star size={14} /> Featured</span>
              <h2 className="section-title">Trending Now</h2>
              <p className="section-subtitle">Hand-picked items loved by the community</p>
            </div>
            <Link to="/browse" className="btn-secondary">
              View All <ArrowRight size={16} />
            </Link>
          </div>
          {featuredItems.length > 0 ? (
            <div className="items-grid">
              {featuredItems.slice(0, 8).map((item, i) => (
                <ItemCard key={item._id} item={item} index={i} />
              ))}
            </div>
          ) : (
            <div className="items-grid">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="item-card">
                  <div className="skeleton" style={{ aspectRatio: '4/5' }} />
                  <div style={{ padding: '1rem' }}>
                    <div className="skeleton" style={{ height: '18px', marginBottom: '0.5rem' }} />
                    <div className="skeleton" style={{ height: '14px', width: '60%' }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ─── CATEGORIES ────────────────────────────────────────────────────── */}
      <section style={{ padding: '4rem 0', background: 'white' }}>
        <div className="container-main">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <span className="section-label"><RefreshCw size={14} /> Categories</span>
            <h2 className="section-title">Shop by Style</h2>
            <p className="section-subtitle">Find exactly what you're looking for</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1.25rem' }}>
            {categories.map((cat, i) => (
              <motion.div
                key={cat.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ y: -6 }}
              >
                <Link to={`/browse?category=${cat.name}`} style={{ textDecoration: 'none' }}>
                  <div className="category-card" style={{ background: cat.color, padding: '1.75rem 1rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>{cat.icon}</div>
                    <img src={cat.img} alt={cat.name} style={{ width: '80px', height: '80px', borderRadius: '12px', objectFit: 'cover', marginBottom: '0.75rem' }} />
                    <p style={{ fontFamily: 'Poppins', fontWeight: 700, color: '#1a1a2e', fontSize: '0.95rem' }}>{cat.name}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─────────────────────────────────────────────────── */}
      <section id="how-it-works" style={{ padding: '5rem 0' }}>
        <div className="container-main">
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <span className="section-label"><Zap size={14} /> How It Works</span>
            <h2 className="section-title">Swap in 3 Easy Steps</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '2rem' }}>
            {[
              { step: '01', title: 'List Your Clothes', desc: 'Upload photos and details of items you no longer wear. It takes just 2 minutes.', icon: '📸', color: '#E8F5E9' },
              { step: '02', title: 'Browse & Connect', desc: 'Find items you love. Request a swap or redeem with your points balance.', icon: '🔍', color: '#E0F2F1' },
              { step: '03', title: 'Swap & Earn', desc: 'Complete swaps to earn badges and points. Track your sustainability impact!', icon: '🎉', color: '#F3E5F5' },
            ].map((step, i) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15 }}
                viewport={{ once: true }}
              >
                <div className="card" style={{ padding: '2.5rem', position: 'relative', overflow: 'hidden', background: step.color }}>
                  <div style={{ position: 'absolute', top: '-10px', right: '-10px', fontSize: '5rem', opacity: 0.15, fontFamily: 'Poppins', fontWeight: 900 }}>{step.step}</div>
                  <div style={{ fontSize: '3rem', marginBottom: '1.25rem' }}>{step.icon}</div>
                  <h3 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '1.2rem', color: '#1a1a2e', marginBottom: '0.75rem' }}>{step.title}</h3>
                  <p style={{ color: '#6B7280', lineHeight: 1.7, fontSize: '0.95rem' }}>{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA BANNER ───────────────────────────────────────────────────── */}
      <section style={{ padding: '5rem 0' }}>
        <div className="container-main">
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            style={{
              background: 'linear-gradient(135deg, #0A3D0E 0%, #1B5E20 50%, #00695C 100%)',
              borderRadius: '24px', padding: 'clamp(3rem, 6vw, 5rem)',
              textAlign: 'center', color: 'white', position: 'relative', overflow: 'hidden'
            }}
          >
            <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '300px', height: '300px', borderRadius: '50%', background: 'rgba(77,182,172,0.15)', filter: 'blur(60px)' }} />
            <div style={{ position: 'relative' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🌿</div>
              <h2 style={{ fontFamily: 'Poppins', fontWeight: 900, fontSize: 'clamp(1.75rem, 4vw, 3rem)', marginBottom: '1rem' }}>
                Ready to Make a Difference?
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '1.1rem', marginBottom: '2rem', maxWidth: '500px', margin: '0 auto 2rem' }}>
                Join the ReWear community today. Start swapping, earn badges, and help build a more sustainable world — one outfit at a time.
              </p>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link to="/register" className="btn-accent" style={{ fontSize: '1.05rem', padding: '1rem 2.5rem' }}>
                  Join Free Today <ArrowRight size={18} />
                </Link>
                <Link to="/browse" style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                  color: 'rgba(255,255,255,0.85)', textDecoration: 'none',
                  border: '2px solid rgba(255,255,255,0.3)', padding: '1rem 2rem',
                  borderRadius: '12px', fontWeight: 600
                }}>
                  Browse First
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
