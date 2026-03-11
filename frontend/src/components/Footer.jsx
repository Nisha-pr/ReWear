import { Link } from 'react-router-dom';
import { Leaf, Instagram, Twitter, Github, Mail, Heart } from 'lucide-react';

const Footer = () => {
  const year = new Date().getFullYear();

  const links = {
    Platform: [
      { label: 'Browse Items', href: '/browse' },
      { label: 'How it Works', href: '/#how-it-works' },
      { label: 'List an Item', href: '/add-item' },
      { label: 'Impact Tracker', href: '/#impact' },
    ],
    Company: [
      { label: 'About Us', href: '#' },
      { label: 'Blog', href: '#' },
      { label: 'Careers', href: '#' },
      { label: 'Contact', href: '#' },
    ],
    Support: [
      { label: 'Help Center', href: '#' },
      { label: 'Safety Tips', href: '#' },
      { label: 'Privacy Policy', href: '#' },
      { label: 'Terms of Service', href: '#' },
    ],
  };

  return (
    <footer style={{ background: '#0A3D0E', color: 'white', marginTop: 'auto' }}>
      <div className="container-main" style={{ padding: '4rem 1.5rem 2rem' }}>
        {/* Top section */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '3rem', marginBottom: '3rem' }}>
          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <div style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg, #1B5E20, #4DB6AC)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Leaf size={22} color="white" />
              </div>
              <span style={{ fontFamily: 'Poppins', fontWeight: 800, fontSize: '1.4rem' }}>
                Re<span style={{ color: '#4DB6AC' }}>Wear</span>
              </span>
            </div>
            <p style={{ color: '#A5D6A7', fontSize: '0.9rem', lineHeight: 1.7, maxWidth: '250px' }}>
              Building a sustainable future through community clothing exchange. Every swap counts.
            </p>
            {/* Social Links */}
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
              {[Instagram, Twitter, Github, Mail].map((Icon, i) => (
                <a key={i} href="#" style={{
                  width: '38px', height: '38px', background: 'rgba(165,214,167,0.15)',
                  border: '1px solid rgba(165,214,167,0.3)', borderRadius: '10px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#A5D6A7', transition: 'all 0.2s', textDecoration: 'none'
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(77,182,172,0.3)'; e.currentTarget.style.color = '#4DB6AC'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(165,214,167,0.15)'; e.currentTarget.style.color = '#A5D6A7'; }}
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(links).map(([category, items]) => (
            <div key={category}>
              <h4 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '0.9rem', color: 'white', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                {category}
              </h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {items.map(item => (
                  <li key={item.label}>
                    <Link to={item.href} style={{
                      color: '#A5D6A7', textDecoration: 'none', fontSize: '0.9rem',
                      transition: 'color 0.2s'
                    }}
                      onMouseEnter={e => e.currentTarget.style.color = '#4DB6AC'}
                      onMouseLeave={e => e.currentTarget.style.color = '#A5D6A7'}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Stats bar */}
        <div style={{ borderTop: '1px solid rgba(165,214,167,0.2)', borderBottom: '1px solid rgba(165,214,167,0.2)', padding: '1.5rem 0', marginBottom: '2rem', display: 'flex', flexWrap: 'wrap', gap: '2rem', justifyContent: 'center' }}>
          {[
            { value: '2,400+', label: 'Items Reused' },
            { value: '6.5M L', label: 'Water Saved' },
            { value: '6,000 kg', label: 'CO₂ Reduced' },
            { value: '1,200+', label: 'Happy Users' },
          ].map(stat => (
            <div key={stat.label} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'Poppins', fontWeight: 800, fontSize: '1.4rem', color: '#4DB6AC' }}>{stat.value}</div>
              <div style={{ fontSize: '0.8rem', color: '#A5D6A7' }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ color: '#6B7280', fontSize: '0.875rem' }}>
            © {year} ReWear. All rights reserved.
          </p>
          <p style={{ color: '#6B7280', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            Made with <Heart size={14} color="#4DB6AC" fill="#4DB6AC" /> for the planet
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
