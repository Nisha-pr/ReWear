import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, SlidersHorizontal, X, ChevronDown, MapPin } from 'lucide-react';
import ItemCard from '../components/ItemCard';
import { itemService } from '../services/api';
import { useDebouncedCallback } from 'use-debounce';

const CATEGORIES = ['All', 'Tops', 'Bottoms', 'Dresses', 'Outerwear', 'Shoes', 'Accessories', 'Activewear', 'Formal', 'Kids'];
const SIZES = ['All', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size'];
const CONDITIONS = ['All', 'Brand New', 'Like New', 'Good', 'Fair', 'Worn'];
const TYPES = ['All', 'Swap', 'Points', 'Both'];
const SORTS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'points-asc', label: 'Points: Low to High' },
  { value: 'points-desc', label: 'Points: High to Low' },
];

const BrowsePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || 'All',
    size: 'All',
    condition: 'All',
    type: 'All',
    sort: 'newest',
    city: '',
    minPoints: '',
    maxPoints: '',
    page: 1,
  });

  const fetchItems = useCallback(async (overrides = {}) => {
    setLoading(true);
    const params = { ...filters, ...overrides };
    const query = {};
    if (params.category !== 'All') query.category = params.category;
    if (params.size !== 'All') query.size = params.size;
    if (params.condition !== 'All') query.condition = params.condition;
    if (params.type !== 'All') query.type = params.type;
    if (params.search) query.search = params.search;
    if (params.city) query.city = params.city;
    if (params.minPoints) query.minPoints = params.minPoints;
    if (params.maxPoints) query.maxPoints = params.maxPoints;
    query.sort = params.sort;
    query.page = params.page;
    query.limit = 12;

    try {
      const { data } = await itemService.getItems(query);
      setItems(data.items || []);
      setPagination(data.pagination || {});
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const debouncedFetch = useDebouncedCallback(() => fetchItems(), 400);

  useEffect(() => { fetchItems(); }, []);

  const updateFilter = (key, value) => {
    const updated = { ...filters, [key]: value, page: 1 };
    setFilters(updated);
    fetchItems(updated);
  };

  const clearFilters = () => {
    const reset = { search: '', category: 'All', size: 'All', condition: 'All', type: 'All', sort: 'newest', city: '', minPoints: '', maxPoints: '', page: 1 };
    setFilters(reset);
    fetchItems(reset);
  };

  const activeFilterCount = [
    filters.category !== 'All', filters.size !== 'All', filters.condition !== 'All',
    filters.type !== 'All', filters.city, filters.minPoints, filters.maxPoints,
  ].filter(Boolean).length;

  return (
    <div style={{ minHeight: '100vh', background: '#F5F5F5' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #1B5E20, #2E7D32)', padding: '3rem 0 2rem', color: 'white' }}>
        <div className="container-main">
          <h1 style={{ fontFamily: 'Poppins', fontWeight: 800, fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', marginBottom: '0.5rem' }}>
            Browse Items 🌿
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.75)', marginBottom: '1.5rem' }}>
            {pagination.total || 0} sustainable fashion finds available
          </p>

          {/* Search bar */}
          <div style={{ position: 'relative', maxWidth: '600px' }}>
            <Search size={20} style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
            <input
              type="text"
              className="input-field"
              placeholder="Search clothes, brands, styles..."
              style={{ paddingLeft: '3.25rem', paddingRight: '1.25rem', background: 'rgba(255,255,255,0.95)', border: '2px solid rgba(255,255,255,0.3)' }}
              value={filters.search}
              onChange={e => {
                setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }));
                debouncedFetch();
              }}
            />
          </div>
        </div>
      </div>

      {/* Category pills */}
      <div style={{ background: 'white', borderBottom: '1px solid #E5E7EB', overflowX: 'auto' }}>
        <div className="container-main">
          <div style={{ display: 'flex', gap: '0.5rem', padding: '1rem 0', flexWrap: 'nowrap' }}>
            {CATEGORIES.map(cat => (
              <button key={cat} className={`filter-pill ${filters.category === cat ? 'active' : ''}`}
                onClick={() => updateFilter('category', cat)}>
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container-main" style={{ padding: '1.5rem' }}>
        {/* Sort + Filter bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button onClick={() => setShowFilters(!showFilters)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.25rem', background: showFilters ? '#1B5E20' : 'white', color: showFilters ? 'white' : '#374151', border: '2px solid #E5E7EB', borderRadius: '12px', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem', transition: 'all 0.2s' }}>
              <SlidersHorizontal size={16} />
              Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
            </button>
            {activeFilterCount > 0 && (
              <button onClick={clearFilters}
                style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.5rem 0.9rem', background: 'rgba(239,68,68,0.1)', color: '#dc2626', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>
                <X size={14} /> Clear
              </button>
            )}
          </div>

          <select
            value={filters.sort}
            onChange={e => updateFilter('sort', e.target.value)}
            style={{ padding: '0.6rem 1rem', border: '2px solid #E5E7EB', borderRadius: '12px', fontSize: '0.9rem', fontWeight: 500, background: 'white', cursor: 'pointer', outline: 'none' }}>
            {SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>

        {/* Filter Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              style={{ overflow: 'hidden', marginBottom: '1.5rem' }}
            >
              <div className="card" style={{ padding: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.25rem' }}>
                {/* Size */}
                <div>
                  <label style={{ fontWeight: 700, fontSize: '0.8rem', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '0.6rem' }}>Size</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                    {SIZES.map(s => (
                      <button key={s} onClick={() => updateFilter('size', s)}
                        style={{ padding: '0.35rem 0.75rem', borderRadius: '8px', border: `2px solid ${filters.size === s ? '#1B5E20' : '#E5E7EB'}`, background: filters.size === s ? '#1B5E20' : 'white', color: filters.size === s ? 'white' : '#374151', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, transition: 'all 0.15s' }}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Condition */}
                <div>
                  <label style={{ fontWeight: 700, fontSize: '0.8rem', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '0.6rem' }}>Condition</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                    {CONDITIONS.map(c => (
                      <button key={c} onClick={() => updateFilter('condition', c)}
                        style={{ padding: '0.35rem 0.75rem', borderRadius: '8px', border: `2px solid ${filters.condition === c ? '#1B5E20' : '#E5E7EB'}`, background: filters.condition === c ? '#1B5E20' : 'white', color: filters.condition === c ? 'white' : '#374151', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600, transition: 'all 0.15s' }}>
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Type */}
                <div>
                  <label style={{ fontWeight: 700, fontSize: '0.8rem', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '0.6rem' }}>Type</label>
                  <div style={{ display: 'flex', gap: '0.35rem' }}>
                    {TYPES.map(t => (
                      <button key={t} onClick={() => updateFilter('type', t)}
                        style={{ padding: '0.35rem 0.75rem', borderRadius: '8px', border: `2px solid ${filters.type === t ? '#1B5E20' : '#E5E7EB'}`, background: filters.type === t ? '#1B5E20' : 'white', color: filters.type === t ? 'white' : '#374151', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, transition: 'all 0.15s' }}>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Location */}
                <div>
                  <label style={{ fontWeight: 700, fontSize: '0.8rem', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '0.6rem' }}>City</label>
                  <div style={{ position: 'relative' }}>
                    <MapPin size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
                    <input type="text" className="input-field" placeholder="e.g. Mumbai" style={{ paddingLeft: '2.25rem', padding: '0.6rem 1rem 0.6rem 2.25rem', fontSize: '0.875rem' }}
                      value={filters.city} onChange={e => updateFilter('city', e.target.value)} />
                  </div>
                </div>

                {/* Points range */}
                <div>
                  <label style={{ fontWeight: 700, fontSize: '0.8rem', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '0.6rem' }}>Points Range</label>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <input type="number" className="input-field" placeholder="Min" style={{ padding: '0.6rem 0.75rem', fontSize: '0.875rem' }}
                      value={filters.minPoints} onChange={e => updateFilter('minPoints', e.target.value)} />
                    <span style={{ color: '#9CA3AF' }}>–</span>
                    <input type="number" className="input-field" placeholder="Max" style={{ padding: '0.6rem 0.75rem', fontSize: '0.875rem' }}
                      value={filters.maxPoints} onChange={e => updateFilter('maxPoints', e.target.value)} />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Items Grid */}
        {loading ? (
          <div className="items-grid">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="item-card">
                <div className="skeleton" style={{ aspectRatio: '4/5', width: '100%' }} />
                <div style={{ padding: '1rem' }}>
                  <div className="skeleton" style={{ height: '18px', marginBottom: '0.5rem' }} />
                  <div className="skeleton" style={{ height: '14px', width: '60%' }} />
                </div>
              </div>
            ))}
          </div>
        ) : items.length > 0 ? (
          <>
            <div className="items-grid">
              {items.map((item, i) => <ItemCard key={item._id} item={item} index={i} />)}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '3rem' }}>
                {[...Array(pagination.pages)].map((_, i) => {
                  const page = i + 1;
                  return (
                    <button key={page} onClick={() => updateFilter('page', page)}
                      style={{ width: '40px', height: '40px', borderRadius: '10px', border: `2px solid ${filters.page === page ? '#1B5E20' : '#E5E7EB'}`, background: filters.page === page ? '#1B5E20' : 'white', color: filters.page === page ? 'white' : '#374151', cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem', transition: 'all 0.2s' }}>
                      {page}
                    </button>
                  );
                })}
              </div>
            )}
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '5rem 2rem' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🌿</div>
            <h3 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '1.4rem', color: '#1a1a2e', marginBottom: '0.5rem' }}>No items found</h3>
            <p style={{ color: '#6B7280', marginBottom: '1.5rem' }}>Try adjusting your filters or search term</p>
            <button onClick={clearFilters} className="btn-primary">Clear All Filters</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BrowsePage;
