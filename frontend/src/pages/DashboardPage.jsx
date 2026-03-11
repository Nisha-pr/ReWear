import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Leaf, Star, Package, RefreshCw, ShoppingBag, Award, Droplets, Wind,
  Settings, Camera, Plus, ChevronRight, CheckCircle, Clock, XCircle, MessageSquare
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { itemService, swapService } from '../services/api';
import ItemCard from '../components/ItemCard';
import toast from 'react-hot-toast';

const badgeIcons = {
  'First Swap': '🌱',
  '5 Swaps': '⭐',
  '10 Swaps': '🏆',
  'Eco Warrior': '🌍',
  'Top Contributor': '👑',
};

const statusBadge = (status) => {
  const map = {
    pending: { label: 'Pending', color: '#f59e0b', bg: '#FFF9C4' },
    accepted: { label: 'Accepted', color: '#22c55e', bg: '#DCFCE7' },
    rejected: { label: 'Rejected', color: '#ef4444', bg: '#FEE2E2' },
    completed: { label: 'Completed', color: '#3b82f6', bg: '#EFF6FF' },
    cancelled: { label: 'Cancelled', color: '#6b7280', bg: '#F3F4F6' },
  };
  const s = map[status] || { label: status, color: '#6b7280', bg: '#F3F4F6' };
  return <span style={{ padding: '0.25rem 0.75rem', borderRadius: '100px', fontSize: '0.75rem', fontWeight: 700, color: s.color, background: s.bg }}>{s.label}</span>;
};

const TABS = ['Profile', 'My Listings', 'My Swaps', 'Impact'];

const DashboardPage = () => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('Profile');
  const [listings, setListings] = useState([]);
  const [swaps, setSwaps] = useState([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [loadingSwaps, setLoadingSwaps] = useState(false);

  useEffect(() => {
    if (activeTab === 'My Listings' && listings.length === 0) {
      setLoadingItems(true);
      itemService.getMyItems()
        .then(r => setListings(r.data.items || []))
        .catch(console.error)
        .finally(() => setLoadingItems(false));
    }
    if (activeTab === 'My Swaps' && swaps.length === 0) {
      setLoadingSwaps(true);
      swapService.getMySwaps()
        .then(r => setSwaps(r.data.swaps || []))
        .catch(console.error)
        .finally(() => setLoadingSwaps(false));
    }
  }, [activeTab]);

  const onSwapAction = async (swapId, status) => {
    try {
      await swapService.updateStatus(swapId, status);
      setSwaps(prev => prev.map(s => s._id === swapId ? { ...s, status } : s));
      toast.success(`Swap ${status}!`);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Action failed');
    }
  };

  const impactStats = [
    { icon: Leaf, label: 'Items Reused', value: user?.totalItemsReused || 0, color: '#1B5E20', unit: '' },
    { icon: Droplets, label: 'Water Saved', value: (user?.totalWaterSaved || 0).toLocaleString(), color: '#0288D1', unit: ' L' },
    { icon: Wind, label: 'CO₂ Reduced', value: user?.totalCarbonSaved || 0, color: '#4DB6AC', unit: ' kg' },
    { icon: RefreshCw, label: 'Total Swaps', value: user?.totalSwaps || 0, color: '#7B1FA2', unit: '' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#F5F5F5' }}>
      {/* Hero Banner */}
      <div style={{ background: 'linear-gradient(135deg, #0A3D0E, #1B5E20, #2E7D32)', color: 'white', padding: '3rem 0 5rem' }}>
        <div className="container-main">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative' }}>
              <img
                src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name}&background=4DB6AC&color=fff&size=80`}
                alt={user?.name}
                style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '4px solid rgba(255,255,255,0.4)' }}
              />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.35rem' }}>
                <h1 style={{ fontFamily: 'Poppins', fontWeight: 800, fontSize: 'clamp(1.5rem, 4vw, 2rem)' }}>
                  {user?.name}
                </h1>
                {user?.role === 'admin' && (
                  <span style={{ background: 'rgba(255,193,7,0.25)', border: '1px solid rgba(255,193,7,0.5)', color: '#FBC02D', padding: '0.2rem 0.75rem', borderRadius: '100px', fontSize: '0.75rem', fontWeight: 700 }}>
                    👑 Admin
                  </span>
                )}
              </div>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', marginBottom: '0.75rem' }}>
                {user?.location?.city ? `📍 ${user.location.city}` : '🌍 Global SwapMate'}
              </p>
              <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
                {[
                  { label: 'Points', value: `🌿 ${user?.points}` },
                  { label: 'Total Swaps', value: user?.totalSwaps || 0 },
                  { label: 'Items Listed', value: user?.itemsListed || 0 },
                ].map(s => (
                  <div key={s.label} style={{ textAlign: 'center' }}>
                    <div style={{ fontFamily: 'Poppins', fontWeight: 800, fontSize: '1.25rem' }}>{s.value}</div>
                    <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)' }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ background: 'white', borderBottom: '1px solid #E5E7EB', position: 'sticky', top: '65px', zIndex: 50, marginTop: '-1px' }}>
        <div className="container-main">
          <div style={{ display: 'flex', gap: '0', overflowX: 'auto' }}>
            {TABS.map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                style={{
                  padding: '1rem 1.5rem', background: 'none', border: 'none', cursor: 'pointer',
                  fontWeight: 700, fontSize: '0.9rem', whiteSpace: 'nowrap',
                  color: activeTab === tab ? '#1B5E20' : '#6B7280',
                  borderBottom: `3px solid ${activeTab === tab ? '#1B5E20' : 'transparent'}`,
                  transition: 'all 0.2s'
                }}>
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container-main" style={{ padding: '2rem 1.5rem' }}>
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>

            {/* ─── PROFILE TAB ──────────────────────────────────────────── */}
            {activeTab === 'Profile' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                {/* Profile info card */}
                <div className="card" style={{ padding: '1.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                    <h2 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '1.1rem', color: '#1a1a2e' }}>Profile Info</h2>
                    <Link to="/profile/edit" className="btn-ghost" style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}>
                      <Settings size={14} /> Edit
                    </Link>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {[
                      { label: 'Name', value: user?.name },
                      { label: 'Email', value: user?.email },
                      { label: 'Provider', value: user?.provider?.charAt(0).toUpperCase() + user?.provider?.slice(1) },
                      { label: 'Location', value: user?.location?.city || 'Not set' },
                      { label: 'Member since', value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—' },
                    ].map(({ label, value }) => (
                      <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0', borderBottom: '1px solid #f3f4f6' }}>
                        <span style={{ fontSize: '0.875rem', color: '#9CA3AF', fontWeight: 500 }}>{label}</span>
                        <span style={{ fontSize: '0.875rem', color: '#1a1a2e', fontWeight: 600 }}>{value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Points card */}
                <div className="card" style={{ padding: '1.75rem', background: 'linear-gradient(135deg, rgba(27,94,32,0.04), rgba(77,182,172,0.08))' }}>
                  <h2 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '1.1rem', color: '#1a1a2e', marginBottom: '1.25rem' }}>Points Balance</h2>
                  <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                    <div style={{ fontSize: '3.5rem', fontFamily: 'Poppins', fontWeight: 900, color: '#1B5E20' }}>🌿 {user?.points}</div>
                    <p style={{ color: '#6B7280', fontSize: '0.9rem', marginTop: '0.5rem' }}>Earn points by listing & completing swaps</p>
                  </div>
                  <Link to="/browse" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                    <ShoppingBag size={16} /> Use My Points
                  </Link>
                </div>

                {/* Badges card */}
                <div className="card" style={{ padding: '1.75rem', gridColumn: 'span 1' }}>
                  <h2 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '1.1rem', color: '#1a1a2e', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Award size={18} color="#F59E0B" /> Badges Earned
                  </h2>
                  {user?.badges?.length > 0 ? (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                      {user.badges.map(badge => (
                        <motion.div key={badge} whileHover={{ scale: 1.05 }}
                          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.35rem', padding: '1rem 1.25rem', background: 'linear-gradient(135deg, #FFF9C4, #FFFDE7)', border: '2px solid #FBC02D', borderRadius: '14px', minWidth: '90px' }}>
                          <span style={{ fontSize: '1.75rem' }}>{badgeIcons[badge] || '🏅'}</span>
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#b7860b', textAlign: 'center' }}>{badge}</span>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '1.5rem', color: '#9CA3AF' }}>
                      <p style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🏅</p>
                      <p>No badges yet. Start swapping to earn your first badge!</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ─── MY LISTINGS TAB ──────────────────────────────────────── */}
            {activeTab === 'My Listings' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h2 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '1.2rem' }}>
                    My Listings ({listings.length})
                  </h2>
                  <Link to="/add-item" className="btn-primary" style={{ padding: '0.6rem 1.25rem', fontSize: '0.875rem' }}>
                    <Plus size={16} /> Add New
                  </Link>
                </div>
                {loadingItems ? (
                  <div className="items-grid">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="item-card">
                        <div className="skeleton" style={{ aspectRatio: '4/5' }} />
                        <div style={{ padding: '1rem' }}><div className="skeleton" style={{ height: '18px' }} /></div>
                      </div>
                    ))}
                  </div>
                ) : listings.length > 0 ? (
                  <div className="items-grid">
                    {listings.map((item, i) => (
                      <div key={item._id} style={{ position: 'relative' }}>
                        <ItemCard item={item} index={i} />
                        <div style={{ position: 'absolute', top: '12px', right: '12px', zIndex: 5 }}>
                          {statusBadge(item.status)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📦</div>
                    <h3 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>No listings yet</h3>
                    <p style={{ color: '#6B7280', marginBottom: '1.5rem' }}>Start by listing a clothing item you no longer need.</p>
                    <Link to="/add-item" className="btn-primary">List Your First Item</Link>
                  </div>
                )}
              </div>
            )}

            {/* ─── MY SWAPS TAB ─────────────────────────────────────────── */}
            {activeTab === 'My Swaps' && (
              <div>
                <h2 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '1.2rem', marginBottom: '1.5rem' }}>
                  My Swaps ({swaps.length})
                </h2>
                {loadingSwaps ? (
                  <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><div className="spinner" /></div>
                ) : swaps.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {swaps.map(swap => {
                      const iAmRequester = swap.requester?._id === user?._id;
                      const other = iAmRequester ? swap.owner : swap.requester;
                      return (
                        <motion.div key={swap._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                          className="card" style={{ padding: '1.25rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                            <img src={swap.item?.images?.[0]?.url} alt="" style={{ width: '60px', height: '60px', borderRadius: '12px', objectFit: 'cover', flexShrink: 0 }} />
                            <div style={{ flex: 1, minWidth: '200px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                <p style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1a1a2e' }}>{swap.item?.title}</p>
                                {statusBadge(swap.status)}
                              </div>
                              <p style={{ fontSize: '0.8rem', color: '#6B7280' }}>
                                {iAmRequester ? `You → ${other?.name}` : `${other?.name} → You`} ·
                                {swap.type === 'points' ? ` 🌿 ${swap.pointsOffered} pts` : ' 🔄 Item swap'}
                              </p>
                              <p style={{ fontSize: '0.75rem', color: '#9CA3AF', marginTop: '0.2rem' }}>
                                {new Date(swap.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                              {/* Owner actions on pending swap */}
                              {!iAmRequester && swap.status === 'pending' && (
                                <>
                                  <button onClick={() => onSwapAction(swap._id, 'accepted')}
                                    style={{ padding: '0.5rem 1rem', background: '#1B5E20', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                    <CheckCircle size={14} /> Accept
                                  </button>
                                  <button onClick={() => onSwapAction(swap._id, 'rejected')}
                                    style={{ padding: '0.5rem 1rem', background: 'rgba(239,68,68,0.1)', color: '#dc2626', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                    <XCircle size={14} /> Reject
                                  </button>
                                </>
                              )}
                              {/* Mark complete on accepted */}
                              {swap.status === 'accepted' && (
                                <button onClick={() => onSwapAction(swap._id, 'completed')}
                                  style={{ padding: '0.5rem 1rem', background: '#4DB6AC', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700 }}>
                                  Mark Complete
                                </button>
                              )}
                              {/* Chat */}
                              {['pending', 'accepted'].includes(swap.status) && (
                                <Link to={`/chat/${swap._id}`}
                                  style={{ padding: '0.5rem 0.75rem', background: 'rgba(27,94,32,0.08)', color: '#1B5E20', border: '1px solid rgba(27,94,32,0.25)', borderRadius: '8px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem', fontWeight: 700 }}>
                                  <MessageSquare size={14} /> Chat
                                </Link>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '4rem' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔄</div>
                    <h3 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>No swaps yet</h3>
                    <p style={{ color: '#6B7280', marginBottom: '1.5rem' }}>Browse items and request your first swap!</p>
                    <Link to="/browse" className="btn-primary">Browse Items</Link>
                  </div>
                )}
              </div>
            )}

            {/* ─── IMPACT TAB ───────────────────────────────────────────── */}
            {activeTab === 'Impact' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
                {impactStats.map(({ icon: Icon, label, value, color, unit }) => (
                  <motion.div key={label} whileHover={{ y: -4 }}
                    className="card" style={{ padding: '2rem', textAlign: 'center' }}>
                    <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                      <Icon size={26} color={color} />
                    </div>
                    <div style={{ fontFamily: 'Poppins', fontWeight: 900, fontSize: '2.5rem', color, marginBottom: '0.25rem' }}>
                      {value}{unit}
                    </div>
                    <p style={{ color: '#6B7280', fontWeight: 600, fontSize: '0.9rem' }}>{label}</p>
                  </motion.div>
                ))}

                <div className="card" style={{ padding: '2rem', gridColumn: '1 / -1', background: 'linear-gradient(135deg, rgba(27,94,32,0.04), rgba(77,182,172,0.06))' }}>
                  <h3 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '1.1rem', marginBottom: '1rem' }}>🌍 Your Environmental Impact</h3>
                  <p style={{ color: '#6B7280', lineHeight: 1.8 }}>
                    By participating in ReWear, you've helped reduce fashion waste and its environmental impact.
                    Each clothing swap saves approximately <strong>2,700 liters of water</strong> and <strong>2.5 kg of CO₂</strong>
                    compared to buying new clothes. Keep swapping to earn the <strong>"Eco Warrior"</strong> badge!
                  </p>
                </div>
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default DashboardPage;
