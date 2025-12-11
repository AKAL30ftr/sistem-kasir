import { useEffect, useState } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { productService } from '../services/productService';
import type { Product, ProductFormData } from '../types';
import ProductForm from '../components/ProductForm';
import toast from 'react-hot-toast';

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchProducts = async () => {
    try {
      const data = await productService.getProducts();
      setProducts(data);
    } catch (error) {
      toast.error('Failed to load products');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleCreate = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await productService.deleteProduct(id);
      toast.success('Product deleted');
      fetchProducts();
    } catch (error) {
      toast.error('Failed to delete product');
    }
  };

  const handleSubmit = async (data: ProductFormData, imageFile: File | null) => {
    try {
      setIsSubmitting(true);
      if (editingProduct && editingProduct.id) {
        await productService.updateProduct(editingProduct.id, data, imageFile);
        toast.success('Product updated');
      } else {
        await productService.addProduct(data, imageFile!); // imageFile is required for new
        toast.success('Product added');
      }
      setIsModalOpen(false);
      fetchProducts();
    } catch (error) {
      toast.error('Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700' }}>Product Management</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Manage your menu items and stock.</p>
        </div>
        <button
          onClick={handleCreate}
          style={{
            backgroundColor: 'var(--primary)',
            color: 'white',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--border-radius)',
            border: 'none',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <Plus size={20} />
          Add Product
        </button>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
        gap: '1.5rem'
      }}>
        {products.map((product) => {
          const isLowStock = product.stock_quantity <= (product.daily_capacity * 0.2);

          return (
            <div key={product.id} style={{
              backgroundColor: 'white',
              borderRadius: 'var(--border-radius)',
              boxShadow: 'var(--shadow-sm)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <div style={{ height: '160px', overflow: 'hidden', position: 'relative' }}>
                <img
                  src={product.image_url}
                  alt={product.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                {isLowStock && (
                  <div style={{
                    position: 'absolute',
                    top: '0.5rem',
                    right: '0.5rem',
                    backgroundColor: '#E53E3E',
                    color: 'white',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    fontWeight: '700'
                  }}>
                    LOW STOCK
                  </div>
                )}
              </div>

              <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                  <h3 style={{ fontWeight: '600', fontSize: '1rem' }}>{product.name}</h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', backgroundColor: '#EDF2F7', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>
                    {product.category}
                  </span>
                </div>

                <p style={{ fontWeight: '700', color: 'var(--primary)', marginBottom: '0.5rem' }}>
                  Rp {product.price.toLocaleString()}
                </p>

                <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.875rem', color: isLowStock ? '#E53E3E' : 'var(--text-secondary)' }}>
                    Stock: <strong>{product.stock_quantity}</strong>
                  </span>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => handleEdit(product)}
                      style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #E2E8F0', background: 'white' }}
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => product.id && handleDelete(product.id)}
                      style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #FED7D7', background: '#FFF5F5', color: '#E53E3E' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {isModalOpen && (
        <ProductForm
          initialData={editingProduct}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleSubmit}
          isLoading={isSubmitting}
        />
      )}
    </div>
  );
}
