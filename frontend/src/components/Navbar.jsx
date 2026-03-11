import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import {
  Leaf, Menu, X, Plus, User, LayoutDashboard,
  LogOut, ShieldCheck, Bell, Search, ChevronDown
} from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
    setDropdownOpen(false);
  };

  const navLinks = [
    { label: 'Browse', href: '/browse' },
    { label: 'How it Works', href: '/#how-it-works' },
    { label: 'Impact', href: '/#impact' },
  ];

  return (
    <nav className="navbar">
      <div className="container-main">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 0', gap: '1rem' }}>
          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
            <div style={{
              width: '40px', height: '40px', background: 'linear-gradient(135deg, #1B5E20, #4DB6AC)',
              borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Leaf size={22} color="white" />
            </div>
            <span style={{ fontFamily: 'Poppins', fontWeight: 800, fontSize: '1.4rem', color: '#1B5E20' }}>
              Re<span style={{ color: '#4DB6AC' }}>Wear</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }} className="hidden-mobile">
            {navLinks.map(link => (
              <a key={link.href} href={link.href}
                style={{
                  padding: '0.5rem 1rem', borderRadius: '10px', textDecoration: 'none',
                  color: location.pathname === link.href ? '#1B5E20' : '#6B7280',
                  fontWeight: 500, fontSize: '0.9rem', transition: 'all 0.2s',
                  background: location.pathname === link.href ? 'rgba(27,94,32,0.08)' : 'transparent'
                }}
                onMouseEnter={e => { e.currentTarget.style.color = '#1B5E20'; e.currentTarget.style.background = 'rgba(27,94,32,0.08)'; }}
                onMouseLeave={e => {
                  if (location.pathname !== link.href) {
                    e.currentTarget.style.color = '#6B7280';
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Right Side */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {/* Search */}
            <button onClick={() => navigate('/browse')} className="btn-ghost" style={{ padding: '0.5rem' }}>
              <Search size={20} />
            </button>

            {isAuthenticated ? (
              <>
                {/* List Item Button */}
                <Link to="/add-item" className="btn-primary" style={{ padding: '0.6rem 1.25rem', fontSize: '0.875rem' }}>
                  <Plus size={16} />
                  <span className="hidden-mobile">List Item</span>
                </Link>

                {/* User Dropdown */}
                <div style={{ position: 'relative' }}>
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0.75rem',
                      background: 'rgba(27,94,32,0.06)', border: '2px solid rgba(27,94,32,0.15)',
                      borderRadius: '100px', cursor: 'pointer', transition: 'all 0.2s'
                    }}
                  >
                    <img
                      src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name}&background=1B5E20&color=fff`}
                      alt={user?.name}
                      style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }}
                    />
                    <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1B5E20', maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} className="hidden-mobile">
                      {user?.name?.split(' ')[0]}
                    </span>
                    <ChevronDown size={14} color="#1B5E20" />
                  </button>

                  <AnimatePresence>
                    {dropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.96 }}
                        transition={{ duration: 0.15 }}
                        style={{
                          position: 'absolute', right: 0, top: 'calc(100% + 8px)',
                          background: 'white', border: '1px solid rgba(165,214,167,0.3)',
                          borderRadius: '16px', padding: '0.5rem',
                          boxShadow: '0 8px 32px rgba(27,94,32,0.15)', minWidth: '200px', zIndex: 200
                        }}
                      >
                        {/* User info */}
                        <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #f3f4f6', marginBottom: '0.25rem' }}>
                          <p style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1a1a2e' }}>{user?.name}</p>
                          <p style={{ fontSize: '0.8rem', color: '#6B7280' }}>{user?.email}</p>
                          <p style={{ fontSize: '0.8rem', color: '#4DB6AC', fontWeight: 600, marginTop: '0.25rem' }}>
                            🌿 {user?.points} points
                          </p>
                        </div>

                        {[
                          { icon: LayoutDashboard, label: 'Dashboard', to: '/dashboard' },
                          ...(isAdmin ? [{ icon: ShieldCheck, label: 'Admin Panel', to: '/admin' }] : []),
                          { icon: User, label: 'My Profile', to: '/dashboard' },
                        ].map(item => (
                          <Link key={item.to + item.label} to={item.to}
                            onClick={() => setDropdownOpen(false)}
                            style={{
                              display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.65rem 1rem',
                              borderRadius: '10px', textDecoration: 'none', color: '#374151',
                              fontSize: '0.9rem', fontWeight: 500, transition: 'all 0.15s'
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(27,94,32,0.06)'; e.currentTarget.style.color = '#1B5E20'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#374151'; }}
                          >
                            <item.icon size={16} />
                            {item.label}
                          </Link>
                        ))}

                        <hr style={{ margin: '0.25rem 0', borderColor: '#f3f4f6' }} />
                        <button onClick={handleLogout}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.65rem 1rem',
                            borderRadius: '10px', color: '#dc2626', fontSize: '0.9rem', fontWeight: 500,
                            background: 'transparent', border: 'none', cursor: 'pointer', width: '100%',
                            transition: 'all 0.15s'
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                          <LogOut size={16} />
                          Sign Out
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Link to="/login" className="btn-ghost">Sign In</Link>
                <Link to="/register" className="btn-primary" style={{ padding: '0.6rem 1.25rem', fontSize: '0.875rem' }}>
                  Join Free
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button onClick={() => setMenuOpen(!menuOpen)} className="btn-ghost show-mobile" style={{ padding: '0.5rem' }}>
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              style={{ overflow: 'hidden', borderTop: '1px solid rgba(165,214,167,0.3)', paddingBottom: '1rem' }}
            >
              {navLinks.map(link => (
                <a key={link.href} href={link.href} onClick={() => setMenuOpen(false)}
                  style={{ display: 'block', padding: '0.75rem 0.5rem', textDecoration: 'none', color: '#374151', fontWeight: 500 }}
                >
                  {link.label}
                </a>
              ))}
              {!isAuthenticated && (
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.75rem' }}>
                  <Link to="/login" onClick={() => setMenuOpen(false)} className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>Sign In</Link>
                  <Link to="/register" onClick={() => setMenuOpen(false)} className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>Join Free</Link>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .hidden-mobile { display: none !important; }
        }
        @media (min-width: 769px) {
          .show-mobile { display: none !important; }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
