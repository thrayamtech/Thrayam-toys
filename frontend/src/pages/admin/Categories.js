import React, { useState, useEffect, useRef } from 'react';
import { FaPlus, FaEdit, FaTrash, FaTags, FaImage, FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';
import AdminLayout from '../../components/AdminLayout';
import API from '../../utils/api';
import { getCategoryImage, handleImageError } from '../../utils/imageHelper';

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => { fetchCategories(); }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const { data } = await API.get('/categories');
      setCategories(data.categories || []);
    } catch (error) {
      toast.error('Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Please select an image file'); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5MB'); return; }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = new FormData();
      payload.append('name', formData.name);
      payload.append('description', formData.description);
      if (imageFile) payload.append('image', imageFile);

      if (editingCategory) {
        await API.put(`/admin/categories/${editingCategory._id}`, payload, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Category updated');
      } else {
        await API.post('/admin/categories', payload, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Category created');
      }
      setShowModal(false);
      resetForm();
      fetchCategories();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save category');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this category? Products in it will be affected.')) return;
    try {
      await API.delete(`/admin/categories/${id}`);
      toast.success('Category deleted');
      fetchCategories();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete category');
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({ name: category.name || '', description: category.description || '' });
    setImageFile(null);
    setImagePreview(null);
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({ name: '', description: '' });
    setImageFile(null);
    setImagePreview(null);
    setEditingCategory(null);
  };

  const hasImage = (cat) => cat.image && cat.image !== 'default-category.jpg';

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Categories</h2>
            <p className="text-gray-500 text-sm mt-0.5">Manage product categories and their images</p>
          </div>
          <button
            onClick={() => { resetForm(); setShowModal(true); }}
            className="flex items-center gap-2 px-4 py-2.5 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition text-sm font-medium"
          >
            <FaPlus /> Add Category
          </button>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-amber-600" />
          </div>
        ) : categories.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {categories.map((cat) => (
              <div key={cat._id}
                className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-shadow border border-gray-100 group">
                {/* Image */}
                <div className="aspect-square bg-gray-50 relative overflow-hidden">
                  {hasImage(cat) ? (
                    <img
                      src={getCategoryImage(cat)}
                      alt={cat.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => handleImageError(e, 'category')}
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-1 text-gray-300">
                      <FaImage className="text-3xl" />
                      <span className="text-xs">No image</span>
                    </div>
                  )}
                  {/* Action overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button onClick={() => handleEdit(cat)}
                      className="w-8 h-8 bg-blue-500 text-white rounded-lg flex items-center justify-center hover:bg-blue-600 transition text-xs">
                      <FaEdit />
                    </button>
                    <button onClick={() => handleDelete(cat._id)}
                      className="w-8 h-8 bg-red-500 text-white rounded-lg flex items-center justify-center hover:bg-red-600 transition text-xs">
                      <FaTrash />
                    </button>
                  </div>
                </div>
                {/* Name */}
                <div className="px-3 py-2.5">
                  <p className="font-semibold text-sm text-gray-800 truncate">{cat.name}</p>
                  {cat.description && (
                    <p className="text-xs text-gray-400 truncate mt-0.5">{cat.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm p-16 text-center border border-gray-100">
            <FaTags className="text-5xl text-gray-200 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-700 mb-2">No Categories Yet</h3>
            <p className="text-gray-400 text-sm mb-5">Create your first category to start organising products.</p>
            <button onClick={() => { resetForm(); setShowModal(true); }}
              className="px-5 py-2.5 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition text-sm font-medium">
              Create First Category
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-800">
                {editingCategory ? 'Edit Category' : 'New Category'}
              </h3>
              <button onClick={() => { setShowModal(false); resetForm(); }}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 transition">
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Image upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category Image <span className="text-gray-400 font-normal">(PNG, JPG — max 5MB)</span>
                </label>

                {/* Preview / drop zone */}
                <div
                  className="relative w-full aspect-video rounded-xl overflow-hidden border-2 border-dashed border-gray-200 hover:border-amber-400 transition cursor-pointer bg-gray-50 flex items-center justify-center"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {imagePreview ? (
                    <>
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition">
                        <p className="text-white text-sm font-medium">Click to change</p>
                      </div>
                    </>
                  ) : editingCategory && hasImage(editingCategory) ? (
                    <>
                      <img
                        src={getCategoryImage(editingCategory)}
                        alt="Current"
                        className="w-full h-full object-cover"
                        onError={e => handleImageError(e, 'category')}
                      />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition">
                        <p className="text-white text-sm font-medium">Click to replace</p>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-gray-400 py-6">
                      <FaImage className="text-3xl" />
                      <p className="text-sm">Click to upload image</p>
                      <p className="text-xs">Recommended: 800×800px square PNG</p>
                    </div>
                  )}
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />

                {imageFile && (
                  <div className="flex items-center justify-between mt-2 px-3 py-1.5 bg-amber-50 rounded-lg border border-amber-200">
                    <span className="text-xs text-amber-700 font-medium truncate">{imageFile.name}</span>
                    <button type="button" onClick={() => { setImageFile(null); setImagePreview(null); }}
                      className="text-amber-500 hover:text-amber-700 ml-2 flex-shrink-0">
                      <FaTimes className="text-xs" />
                    </button>
                  </div>
                )}
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Category Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition"
                  placeholder="e.g., Wooden Puzzles"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition resize-none"
                  placeholder="Brief description of this category"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-1">
                <button type="submit" disabled={submitting}
                  className="flex-1 py-2.5 bg-amber-600 text-white rounded-xl font-medium text-sm hover:bg-amber-700 transition disabled:opacity-60">
                  {submitting ? 'Saving…' : editingCategory ? 'Update Category' : 'Create Category'}
                </button>
                <button type="button"
                  onClick={() => { setShowModal(false); resetForm(); }}
                  className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium text-sm hover:bg-gray-200 transition">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminCategories;
