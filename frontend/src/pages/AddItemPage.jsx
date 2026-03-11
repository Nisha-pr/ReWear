import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Upload, X, Plus, MapPin, Tag, Package, CheckCircle, AlertCircle, Image } from 'lucide-react';
import { itemService } from '../services/api';
import toast from 'react-hot-toast';

const CATEGORIES = ['Tops', 'Bottoms', 'Dresses', 'Outerwear', 'Shoes', 'Accessories', 'Activewear', 'Formal', 'Kids', 'Other'];
const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size', 'Custom'];
const CONDITIONS = ['Brand New', 'Like New', 'Good', 'Fair', 'Worn'];
const TYPES = ['Swap', 'Points', 'Both'];

// Defined outside AddItemPage so it's not recreated on every re-render,
// which would cause inputs to lose focus after each keystroke.
const F = ({ label, children, required: req }) => (
  <div>
    <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', color: '#374151', marginBottom: '0.4rem' }}>
      {label} {req && <span style={{ color: '#ef4444' }}>*</span>}
    </label>
    {children}
  </div>
);

const AddItemPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '', description: '', category: 'Tops', type: 'Both',
    size: 'M', condition: 'Good', pointsValue: 50,
    tags: '', city: '', state: '', country: '',
  });
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleImageChange = (files) => {
    const arr = Array.from(files).slice(0, 5 - images.length);
    const newImages = [...images, ...arr].slice(0, 5);
    setImages(newImages);
    const urls = newImages.map(f => URL.createObjectURL(f));
    setPreviews(urls);
  };

  const removeImage = (i) => {
    const updated = images.filter((_, idx) => idx !== i);
    setImages(updated);
    setPreviews(updated.map(f => URL.createObjectURL(f)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (images.length === 0) { toast.error('Please upload at least one image'); return; }

    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => formData.append(k, v));
      images.forEach(img => formData.append('images', img));

      await itemService.createItem(formData);
      toast.success('Item submitted for review! 🎉 Admin will approve it shortly.');
      navigate('/dashboard');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to create item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F5F5F5', padding: '2rem 0' }}>
      <div className="container-main" style={{ maxWidth: '800px' }}>
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 style={{ fontFamily: 'Poppins', fontWeight: 900, fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', color: '#1a1a2e', marginBottom: '0.5rem' }}>
            List an Item 📦
          </h1>
          <p style={{ color: '#6B7280', marginBottom: '2rem' }}>
            Share your pre-loved clothes with the ReWear community
          </p>
        </motion.div>

        {/* Pending approval notice */}
        <div style={{ background: 'rgba(77,182,172,0.1)', border: '1px solid rgba(77,182,172,0.3)', borderRadius: '14px', padding: '1rem 1.25rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <AlertCircle size={20} color="#4DB6AC" />
          <div>
            <p style={{ fontWeight: 700, fontSize: '0.9rem', color: '#00897B' }}>Pending Admin Review</p>
            <p style={{ fontSize: '0.8rem', color: '#6B7280' }}>Your item will be reviewed and approved within 24 hours before going live.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Image Upload */}
            <div className="card" style={{ padding: '1.75rem' }}>
              <h2 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '1.1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Image size={20} color="#1B5E20" /> Photos
              </h2>

              {/* Drop Zone */}
              <div
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={e => { e.preventDefault(); setDragOver(false); handleImageChange(e.dataTransfer.files); }}
                onClick={() => document.getElementById('image-upload').click()}
                style={{
                  border: `2px dashed ${dragOver ? '#1B5E20' : '#D1D5DB'}`,
                  borderRadius: '16px',
                  padding: '2rem',
                  textAlign: 'center',
                  cursor: 'pointer',
                  background: dragOver ? 'rgba(27,94,32,0.04)' : '#FAFAFA',
                  transition: 'all 0.2s',
                  marginBottom: '1rem',
                }}>
                <Upload size={32} color={dragOver ? '#1B5E20' : '#9CA3AF'} style={{ margin: '0 auto 0.75rem' }} />
                <p style={{ fontWeight: 600, color: dragOver ? '#1B5E20' : '#6B7280' }}>
                  {dragOver ? 'Drop images here!' : 'Drag & drop images or click to browse'}
                </p>
                <p style={{ fontSize: '0.8rem', color: '#9CA3AF', marginTop: '0.25rem' }}>Up to 5 images, max 5MB each</p>
                <input id="image-upload" type="file" multiple accept="image/*" style={{ display: 'none' }}
                  onChange={e => handleImageChange(e.target.files)} />
              </div>

              {/* Preview grid */}
              {previews.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.75rem' }}>
                  {previews.map((url, i) => (
                    <div key={i} style={{ position: 'relative', aspectRatio: '1', borderRadius: '12px', overflow: 'hidden' }}>
                      <img src={url} alt={`Preview ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <button type="button" onClick={() => removeImage(i)}
                        style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(0,0,0,0.7)', color: 'white', border: 'none', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                        <X size={12} />
                      </button>
                      {i === 0 && <span style={{ position: 'absolute', bottom: '4px', left: '4px', background: 'rgba(27,94,32,0.9)', color: 'white', fontSize: '0.65rem', fontWeight: 700, padding: '0.15rem 0.4rem', borderRadius: '4px' }}>Main</span>}
                    </div>
                  ))}
                  {previews.length < 5 && (
                    <button type="button" onClick={() => document.getElementById('image-upload').click()}
                      style={{ aspectRatio: '1', border: '2px dashed #D1D5DB', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: '#FAFAFA', gap: '0.25rem' }}>
                      <Plus size={20} color="#9CA3AF" />
                      <span style={{ fontSize: '0.65rem', color: '#9CA3AF' }}>Add</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Basic Info */}
            <div className="card" style={{ padding: '1.75rem' }}>
              <h2 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '1.1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Package size={20} color="#1B5E20" /> Item Details
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                <F label="Title" required>
                  <input type="text" className="input-field" placeholder="e.g. Flowy Summer Maxi Dress" required
                    value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} maxLength={100} />
                </F>

                <F label="Description" required>
                  <textarea className="input-field" rows={4} placeholder="Describe the item — material, style, why you're listing it..." required
                    value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} maxLength={1000}
                    style={{ resize: 'vertical' }} />
                  <p style={{ fontSize: '0.75rem', color: '#9CA3AF', textAlign: 'right', marginTop: '0.25rem' }}>{form.description.length}/1000</p>
                </F>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem' }}>
                  <F label="Category" required>
                    <select className="input-field" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                      {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </F>
                  <F label="Size" required>
                    <select className="input-field" value={form.size} onChange={e => setForm({ ...form, size: e.target.value })}>
                      {SIZES.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </F>
                  <F label="Condition" required>
                    <select className="input-field" value={form.condition} onChange={e => setForm({ ...form, condition: e.target.value })}>
                      {CONDITIONS.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </F>
                  <F label="Listing Type" required>
                    <select className="input-field" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                      {TYPES.map(t => <option key={t}>{t}</option>)}
                    </select>
                  </F>
                </div>

                <F label="Points Value">
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#4DB6AC', fontWeight: 700 }}>🌿</span>
                    <input type="number" className="input-field" min={10} max={500} style={{ paddingLeft: '2.5rem' }}
                      value={form.pointsValue} onChange={e => setForm({ ...form, pointsValue: e.target.value })} />
                  </div>
                </F>
              </div>
            </div>

            {/* Tags & Location */}
            <div className="card" style={{ padding: '1.75rem' }}>
              <h2 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '1.1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Tag size={20} color="#1B5E20" /> Tags & Location
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <F label="Tags (comma-separated)">
                  <input type="text" className="input-field" placeholder="summer, casual, boho, vintage"
                    value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} />
                </F>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem' }}>
                  <F label="City">
                    <input type="text" className="input-field" placeholder="Mumbai"
                      value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} />
                  </F>
                  <F label="State">
                    <input type="text" className="input-field" placeholder="Maharashtra"
                      value={form.state} onChange={e => setForm({ ...form, state: e.target.value })} />
                  </F>
                  <F label="Country">
                    <input type="text" className="input-field" placeholder="India"
                      value={form.country} onChange={e => setForm({ ...form, country: e.target.value })} />
                  </F>
                </div>
              </div>
            </div>

            {/* Submit */}
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => navigate(-1)} className="btn-secondary">Cancel</button>
              <button type="submit" className="btn-primary" disabled={loading}
                style={{ padding: '0.9rem 2.5rem', fontSize: '1rem', opacity: loading ? 0.7 : 1 }}>
                {loading ? (
                  <><div className="spinner" style={{ width: '18px', height: '18px', borderWidth: '2px' }} /> Submitting...</>
                ) : (
                  <><CheckCircle size={18} /> Submit for Review</>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddItemPage;
