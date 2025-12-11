import { useState, useRef, useEffect } from 'react';
import { X, Upload, Check } from 'lucide-react';
import type { Product, ProductFormData } from '../types';
import toast from 'react-hot-toast';

interface ProductFormProps {
  initialData?: Product | null;
  onClose: () => void;
  onSubmit: (data: ProductFormData, imageFile: File | null) => Promise<void>;
  isLoading: boolean;
}

export default function ProductForm({ initialData, onClose, onSubmit, isLoading }: ProductFormProps) {
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    price: 0,
    category: 'Makan',
    stock_quantity: 0,
    daily_capacity: 50,
    image_url: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        price: initialData.price,
        category: initialData.category,
        stock_quantity: initialData.stock_quantity,
        daily_capacity: initialData.daily_capacity,
        image_url: initialData.image_url
      });
      setPreviewUrl(initialData.image_url);
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'stock_quantity' || name === 'daily_capacity'
        ? Number(value)
        : value
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 2 * 1024 * 1024) {
        toast.error('File size must be less than 2MB');
        return;
      }
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!initialData && !imageFile) {
      toast.error('Please upload an image');
      return;
    }
    await onSubmit(formData, imageFile);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'var(--bg-white)',
        borderRadius: 'var(--border-radius)',
        padding: '2rem',
        width: '100%',
        maxWidth: '500px',
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '700' }}>
            {initialData ? 'Edit Product' : 'Add New Product'}
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none' }}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

          {/* Image Upload */}
          <div
            onClick={() => fileInputRef.current?.click()}
            style={{
              height: '150px',
              border: '2px dashed #E2E8F0',
              borderRadius: 'var(--border-radius)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              backgroundImage: previewUrl ? `url(${previewUrl})` : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              position: 'relative'
            }}
          >
            {!previewUrl && (
              <>
                <Upload size={32} color="var(--text-secondary)" />
                <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Click to upload image</p>
              </>
            )}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              hidden
              accept="image/*"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>Name</label>
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}
              >
                <option value="Makan">Makanan</option>
                <option value="Minum">Minuman</option>
                <option value="Snack">Snack</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>Price (Rp)</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                min="0"
                required
                style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>Stock</label>
              <input
                type="number"
                name="stock_quantity"
                value={formData.stock_quantity}
                onChange={handleChange}
                min="0"
                required
                style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}
              />
            </div>
          </div>

          <div>
             <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>Daily Capacity</label>
             <input
                type="number"
                name="daily_capacity"
                value={formData.daily_capacity}
                onChange={handleChange}
                min="0"
                required
                style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}
              />
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Used for low stock logic (Alert if &le; 20%)</p>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{
              backgroundColor: 'var(--primary)',
              color: 'white',
              padding: '0.75rem',
              borderRadius: '8px',
              border: 'none',
              fontWeight: '600',
              marginTop: '1rem',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            {isLoading ? 'Saving...' : <><Check size={18} /> Save Product</>}
          </button>

        </form>
      </div>
    </div>
  );
}
