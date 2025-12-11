
import { supabase } from '../supabase';
import type { Product, ProductFormData } from '../types';

const TABLE_NAME = 'products';
const BUCKET_NAME = 'products';

export const productService = {
  // Get all products
  getProducts: async (): Promise<Product[]> => {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('deleted', false)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching products:", error);
      return [];
    }
    return data as Product[];
  },

  // Add new product with Image Upload
  addProduct: async (data: ProductFormData, imageFile: File): Promise<string> => {
    try {
      let publicUrl = '';

      // 1. Upload Image to Supabase Storage
      if (imageFile) {
         const fileExt = imageFile.name.split('.').pop();
         const fileName = `${Date.now()}_${Math.random()}.${fileExt}`;
         const filePath = `${fileName}`;

         const { error: uploadError } = await supabase.storage
           .from(BUCKET_NAME)
           .upload(filePath, imageFile);

         if (uploadError) throw uploadError;

         // Get Public URL
         const { data: urlData } = supabase.storage
           .from(BUCKET_NAME)
           .getPublicUrl(filePath);

         publicUrl = urlData.publicUrl;
      }

      // 2. Insert to Table
      const { data: newProduct, error } = await supabase
        .from(TABLE_NAME)
        .insert([{
          ...data,
          image_url: publicUrl,
          deleted: false
        }])
        .select()
        .single();

      if (error) throw error;
      return newProduct.id;

    } catch (error) {
      console.error("Error adding product:", error);
      throw error;
    }
  },

  // Update product
  updateProduct: async (id: string, data: ProductFormData, imageFile?: File | null, _oldImageUrl?: string): Promise<void> => {
    try {
      let imageUrl = data.image_url; // Default to existing URL form data

      if (imageFile) {
         const fileExt = imageFile.name.split('.').pop();
         const fileName = `${Date.now()}_${Math.random()}.${fileExt}`;
         const filePath = `${fileName}`;

         const { error: uploadError } = await supabase.storage
           .from(BUCKET_NAME)
           .upload(filePath, imageFile);

         if (uploadError) throw uploadError;

         const { data: urlData } = supabase.storage
           .from(BUCKET_NAME)
           .getPublicUrl(filePath);

         imageUrl = urlData.publicUrl;
      }

      // Update row
      const { error } = await supabase
        .from(TABLE_NAME)
        .update({
          ...data,
          image_url: imageUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error("Error updating product:", error);
      throw error;
    }
  },

  // Soft delete product
  deleteProduct: async (id: string): Promise<void> => {
    const { error } = await supabase
        .from(TABLE_NAME)
        .update({ deleted: true })
        .eq('id', id);

    if (error) throw error;
  }
};
