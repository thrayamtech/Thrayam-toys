import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaImage, FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import AdminLayout from '../../components/AdminLayout';
import API from '../../utils/api';
import { getProductImage, handleImageError } from '../../utils/imageHelper';

const quillModules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ color: [] }, { background: [] }],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['link'],
    ['clean'],
  ],
};

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    discountPrice: '',
    category: '',
    stock: '',
    ageGroup: 'All Ages',
    material: 'Other',
    skills: [],
    brand: '',
    weight: '',
    dimensions: '',
    numPieces: '',
    batteryRequired: false,
    batteryType: '',
    safetyWarning: '',
    colors: [],
    isFeatured: false,
    images: [],
    seoTitle: '',
    seoDescription: '',
    seoKeywords: '',
  });
  const [imageFiles, setImageFiles] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [mainImageIndex, setMainImageIndex] = useState(0);
  const [colorName, setColorName] = useState('');
  const [colorHex, setColorHex] = useState('#000000');

  // Age group options
  const ageGroupOptions = [
    '0-6 months', '6-12 months', '1-2 years', '2-3 years',
    '3-5 years', '5-8 years', '8-12 years', '12+ years', 'All Ages'
  ];

  // Material options
  const materialOptions = [
    'Wood', 'Plastic', 'Fabric', 'Metal', 'Rubber', 'Foam',
    'Electronic', 'Paper/Cardboard', 'Mixed', 'Other'
  ];

  // Skill development options
  const skillOptions = [
    'Motor Skills', 'Cognitive Development', 'Creative Play',
    'Social Skills', 'Language Development', 'STEM',
    'Emotional Development', 'Sensory Play', 'Physical Activity'
  ];

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data } = await API.get('/products?limit=1000');
      setProducts(data.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data } = await API.get('/categories');
      setCategories(data.categories || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const currentTotal = (existingImages?.length || 0) + previewImages.length;
    const remainingSlots = 10 - currentTotal;

    // Check if adding new files would exceed limit
    if (files.length > remainingSlots) {
      toast.error(`You can only upload ${remainingSlots} more image(s). Maximum 10 images per product.`);

      // Take only the files that fit
      const allowedFiles = files.slice(0, remainingSlots);
      if (allowedFiles.length === 0) return;

      const newFiles = [...imageFiles, ...allowedFiles];
      setImageFiles(newFiles);

      const newPreviews = allowedFiles.map(file => ({
        url: URL.createObjectURL(file),
        isNew: true
      }));
      setPreviewImages([...previewImages, ...newPreviews]);

      toast.info(`Added ${allowedFiles.length} image(s). Limit reached (10/10).`);
      return;
    }

    // Check file sizes (5MB limit)
    const oversizedFiles = files.filter(file => file.size > 5 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      toast.error(`${oversizedFiles.length} file(s) exceed 5MB limit and were skipped.`);
      const validFiles = files.filter(file => file.size <= 5 * 1024 * 1024);
      if (validFiles.length === 0) return;

      const newFiles = [...imageFiles, ...validFiles];
      setImageFiles(newFiles);

      const newPreviews = validFiles.map(file => ({
        url: URL.createObjectURL(file),
        isNew: true
      }));
      setPreviewImages([...previewImages, ...newPreviews]);
      return;
    }

    // All validations passed
    const newFiles = [...imageFiles, ...files];
    setImageFiles(newFiles);

    // Create preview URLs
    const newPreviews = files.map(file => ({
      url: URL.createObjectURL(file),
      isNew: true
    }));
    setPreviewImages([...previewImages, ...newPreviews]);
  };

  const removeImage = (index) => {
    const newPreviews = previewImages.filter((_, i) => i !== index);
    const newFiles = imageFiles.filter((_, i) => i !== index);
    setPreviewImages(newPreviews);
    setImageFiles(newFiles);

    // Adjust main image index if needed
    if (mainImageIndex >= newPreviews.length) {
      setMainImageIndex(Math.max(0, newPreviews.length - 1));
    }
  };

  const removeExistingImage = (imageId) => {
    setExistingImages(existingImages.filter(img => img._id !== imageId));
  };

  const moveExistingImage = (fromIndex, toIndex) => {
    const newExisting = [...existingImages];
    const [movedItem] = newExisting.splice(fromIndex, 1);
    newExisting.splice(toIndex, 0, movedItem);
    setExistingImages(newExisting);

    // Adjust main image index if needed
    if (mainImageIndex === fromIndex) {
      setMainImageIndex(toIndex);
    } else if (fromIndex < mainImageIndex && toIndex >= mainImageIndex) {
      setMainImageIndex(mainImageIndex - 1);
    } else if (fromIndex > mainImageIndex && toIndex <= mainImageIndex) {
      setMainImageIndex(mainImageIndex + 1);
    }
  };

  const moveImage = (fromIndex, toIndex) => {
    const newPreviews = [...previewImages];
    const [movedItem] = newPreviews.splice(fromIndex, 1);
    newPreviews.splice(toIndex, 0, movedItem);
    setPreviewImages(newPreviews);

    const newFiles = [...imageFiles];
    const [movedFile] = newFiles.splice(fromIndex, 1);
    newFiles.splice(toIndex, 0, movedFile);
    setImageFiles(newFiles);

    // Adjust main image index
    if (mainImageIndex === fromIndex) {
      setMainImageIndex(toIndex);
    } else if (fromIndex < mainImageIndex && toIndex >= mainImageIndex) {
      setMainImageIndex(mainImageIndex - 1);
    } else if (fromIndex > mainImageIndex && toIndex <= mainImageIndex) {
      setMainImageIndex(mainImageIndex + 1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const submitData = new FormData();

      // Append all form fields
      Object.keys(formData).forEach(key => {
        if (key !== 'images') {
          if (key === 'colors' || key === 'skills') {
            submitData.append(key, JSON.stringify(formData[key]));
          } else {
            submitData.append(key, formData[key]);
          }
        }
      });

      // Append image files with their order
      imageFiles.forEach((file, index) => {
        submitData.append('images', file);
      });

      // Append main image index
      submitData.append('mainImageIndex', mainImageIndex);

      // If editing, send existing images that should be kept (full objects with url, key, alt)
      if (editingProduct) {
        submitData.append('existingImages', JSON.stringify(existingImages));
      }

      if (editingProduct) {
        await API.put(`/products/${editingProduct._id}`, submitData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Product updated successfully');
      } else {
        await API.post('/products', submitData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Product created successfully');
      }

      setShowModal(false);
      resetForm();
      fetchProducts();
    } catch (error) {
      // Parse and display validation errors
      if (error.response?.data?.errors) {
        const errorMessages = Object.values(error.response.data.errors)
          .map(err => err.message)
          .join(', ');
        toast.error(`Validation Error: ${errorMessages}`);
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to save product');
      }
      console.error('Product save error:', error.response?.data);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await API.delete(`/products/${id}`);
        toast.success('Product deleted successfully');
        fetchProducts();
      } catch (error) {
        toast.error('Failed to delete product');
      }
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || '',
      description: product.description || '',
      price: product.price || '',
      discountPrice: product.discountPrice || '',
      category: product.category?._id || '',
      stock: product.stock || '',
      ageGroup: product.ageGroup || 'All Ages',
      material: product.material || 'Other',
      skills: Array.isArray(product.skills) ? product.skills : [],
      brand: product.brand || '',
      weight: product.specifications?.weight || '',
      dimensions: product.specifications?.dimensions || '',
      numPieces: product.specifications?.numPieces || '',
      batteryRequired: product.specifications?.batteryRequired || false,
      batteryType: product.specifications?.batteryType || '',
      safetyWarning: product.specifications?.safetyWarning || '',
      colors: Array.isArray(product.colors) ? product.colors : [],
      isFeatured: product.isFeatured || false,
      images: product.images || [],
      seoTitle: product.seoTitle || '',
      seoDescription: product.seoDescription || '',
      seoKeywords: product.seoKeywords || '',
    });
    setExistingImages(product.images || []);
    setPreviewImages([]);
    setImageFiles([]);
    setMainImageIndex(product.mainImageIndex || 0);
    setShowModal(true);
  };

  // Add color to list
  const addColor = () => {
    if (colorName.trim() && colorHex) {
      setFormData({
        ...formData,
        colors: [...formData.colors, { name: colorName.trim(), hexCode: colorHex }]
      });
      setColorName('');
      setColorHex('#000000');
    } else {
      toast.error('Please enter both color name and hex code');
    }
  };

  // Remove color from list
  const removeColor = (index) => {
    setFormData({
      ...formData,
      colors: formData.colors.filter((_, i) => i !== index)
    });
  };

  // Toggle skill selection
  const toggleSkill = (skill) => {
    if (formData.skills.includes(skill)) {
      setFormData({ ...formData, skills: formData.skills.filter(s => s !== skill) });
    } else {
      setFormData({ ...formData, skills: [...formData.skills, skill] });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      discountPrice: '',
      category: '',
      stock: '',
      ageGroup: 'All Ages',
      material: 'Other',
      skills: [],
      brand: '',
      weight: '',
      dimensions: '',
      numPieces: '',
      batteryRequired: false,
      batteryType: '',
      safetyWarning: '',
      colors: [],
      isFeatured: false,
      images: [],
      seoTitle: '',
      seoDescription: '',
      seoKeywords: '',
    });
    setEditingProduct(null);
    setImageFiles([]);
    setPreviewImages([]);
    setExistingImages([]);
    setMainImageIndex(0);
    setColorName('');
    setColorHex('#000000');
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || product.category?._id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Products Management</h2>
            <p className="text-gray-600 mt-1">Manage your product inventory</p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition"
          >
            <FaPlus /> Add Product
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-500"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-500"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Products Table */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-600"></div>
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Age Group</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredProducts.map((product) => (
                    <tr key={product._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={getProductImage(product, 0)}
                            alt={product.name}
                            className="w-12 h-12 object-cover rounded"
                            onError={(e) => handleImageError(e, 'product')}
                          />
                          <div>
                            <p className="font-medium text-gray-800">{product.name}</p>
                            {product.isFeatured && (
                              <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                                Featured
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {product.category?.name || 'N/A'}
                      </td>
                      <td className="px-6 py-4">
                        {product.ageGroup && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                            {product.ageGroup}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-gray-800">₹{product.price?.toLocaleString()}</p>
                          {product.discountPrice && (
                            <p className="text-xs text-green-600">₹{product.discountPrice?.toLocaleString()} (Sale)</p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          product.stock === 0 ? 'bg-red-100 text-red-800' :
                          product.stock < 10 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {product.stock} units
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          product.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(product)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="Edit"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDelete(product._id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Delete"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <FaImage className="text-6xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">No Products Found</h3>
            <p className="text-gray-600 mb-6">Start by adding your first product</p>
            <button
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              className="px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition"
            >
              Add Your First Product
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
              <h3 className="text-xl font-bold text-gray-800">
                {editingProduct ? 'Edit Product' : 'Create New Product'}
              </h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <div className="border border-gray-300 rounded-lg overflow-hidden">
                    <ReactQuill
                      theme="snow"
                      value={formData.description}
                      onChange={(value) => setFormData({ ...formData, description: value })}
                      modules={quillModules}
                      style={{ minHeight: '150px' }}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-500"
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Age Group *
                  </label>
                  <select
                    value={formData.ageGroup}
                    onChange={(e) => setFormData({ ...formData, ageGroup: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-500"
                    required
                  >
                    {ageGroupOptions.map(age => (
                      <option key={age} value={age}>{age}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Material *
                  </label>
                  <select
                    value={formData.material}
                    onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-500"
                    required
                  >
                    {materialOptions.map(mat => (
                      <option key={mat} value={mat}>{mat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Brand
                  </label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-500"
                    placeholder="e.g., Thrayam Toys"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price *
                  </label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-500"
                    required
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Discount Price
                  </label>
                  <input
                    type="number"
                    value={formData.discountPrice}
                    onChange={(e) => setFormData({ ...formData, discountPrice: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-500"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stock *
                  </label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-500"
                    required
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Weight (grams)
                  </label>
                  <input
                    type="number"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-500"
                    placeholder="e.g., 500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dimensions (L×W×H cm)
                  </label>
                  <input
                    type="text"
                    value={formData.dimensions}
                    onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-500"
                    placeholder="e.g., 30×20×15 cm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Pieces
                  </label>
                  <input
                    type="number"
                    value={formData.numPieces}
                    onChange={(e) => setFormData({ ...formData, numPieces: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-500"
                    min="1"
                    placeholder="e.g., 24"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Safety Warning
                  </label>
                  <input
                    type="text"
                    value={formData.safetyWarning}
                    onChange={(e) => setFormData({ ...formData, safetyWarning: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-500"
                    placeholder="e.g., Not suitable for children under 3 years"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="batteryRequired"
                    checked={formData.batteryRequired}
                    onChange={(e) => setFormData({ ...formData, batteryRequired: e.target.checked })}
                    className="w-4 h-4 text-amber-500"
                  />
                  <label htmlFor="batteryRequired" className="text-sm font-medium text-gray-700">
                    Battery Required
                  </label>
                  {formData.batteryRequired && (
                    <input
                      type="text"
                      value={formData.batteryType}
                      onChange={(e) => setFormData({ ...formData, batteryType: e.target.value })}
                      className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-amber-500"
                      placeholder="Battery type (e.g., AA × 2)"
                    />
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Skills Developed
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {skillOptions.map(skill => (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => toggleSkill(skill)}
                        className={`px-3 py-1.5 rounded-full border-2 text-sm font-medium transition ${
                          formData.skills.includes(skill)
                            ? 'border-amber-500 bg-amber-50 text-amber-700'
                            : 'border-gray-300 bg-white text-gray-600 hover:border-amber-300'
                        }`}
                      >
                        {skill}
                      </button>
                    ))}
                  </div>
                  {formData.skills.length > 0 && (
                    <p className="text-xs text-gray-500 mt-2">
                      Selected: {formData.skills.join(', ')}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Colors
                  </label>
                  <div className="space-y-3">
                    {/* Add new color */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={colorName}
                        onChange={(e) => setColorName(e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-500"
                        placeholder="Color name (e.g., Red)"
                      />
                      <input
                        type="color"
                        value={colorHex}
                        onChange={(e) => setColorHex(e.target.value)}
                        className="w-16 h-10 border border-gray-300 rounded-lg cursor-pointer"
                      />
                      <button
                        type="button"
                        onClick={addColor}
                        className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition"
                      >
                        Add
                      </button>
                    </div>

                    {/* Display added colors */}
                    {formData.colors.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {formData.colors.map((color, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full"
                          >
                            <div
                              className="w-4 h-4 rounded-full border border-gray-300"
                              style={{ backgroundColor: color.hexCode }}
                            ></div>
                            <span className="text-sm">{color.name}</span>
                            <button
                              type="button"
                              onClick={() => removeColor(index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Images
                  </label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-500"
                  />
                  <div className="mt-1 space-y-1">
                    <p className="text-xs text-gray-500">
                      Click on an image to set it as main (shown on hover will be second image)
                    </p>
                    <p className="text-xs text-amber-600 font-medium">
                      📸 Max 10 images per product • Max 5MB per image
                    </p>
                    <p className="text-xs text-gray-500">
                      Current: {(existingImages?.length || 0) + (previewImages?.length || 0)} / 10 images
                    </p>
                  </div>

                  {/* Existing Images */}
                  {existingImages.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Existing Images:</p>
                      <div className="grid grid-cols-4 gap-3">
                        {existingImages.map((img, index) => (
                          <div key={img._id || index} className="relative group">
                            <img
                              src={img.url.startsWith('http') ? img.url : `http://localhost:5000${img.url}`}
                              alt={`Existing ${index + 1}`}
                              onError={(e) => handleImageError(e, 'product')}
                              className={`w-full h-24 object-cover rounded border-2 cursor-pointer ${
                                index === mainImageIndex && previewImages.length === 0
                                  ? 'border-amber-500'
                                  : 'border-gray-300'
                              }`}
                              onClick={() => setMainImageIndex(index)}
                            />
                            {index === mainImageIndex && previewImages.length === 0 && (
                              <div className="absolute top-1 left-1 bg-amber-500 text-white text-xs px-2 py-0.5 rounded">
                                Main
                              </div>
                            )}
                            {index === 1 && previewImages.length === 0 && (
                              <div className="absolute top-1 right-1 bg-blue-500 text-white text-xs px-2 py-0.5 rounded">
                                Hover
                              </div>
                            )}
                            <button
                              type="button"
                              onClick={() => removeExistingImage(img._id)}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                            >
                              ×
                            </button>
                            {/* Reorder arrows */}
                            {index > 0 && (
                              <button
                                type="button"
                                onClick={() => moveExistingImage(index, index - 1)}
                                className="absolute left-1 top-1/2 -translate-y-1/2 bg-gray-700 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                              >
                                ←
                              </button>
                            )}
                            {index < existingImages.length - 1 && (
                              <button
                                type="button"
                                onClick={() => moveExistingImage(index, index + 1)}
                                className="absolute right-1 top-1/2 -translate-y-1/2 bg-gray-700 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                              >
                                →
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* New Preview Images */}
                  {previewImages.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">New Images:</p>
                      <div className="grid grid-cols-4 gap-3">
                        {previewImages.map((preview, index) => {
                          const actualIndex = existingImages.length + index;
                          return (
                            <div key={index} className="relative group">
                              <img
                                src={preview.url}
                                alt={`Preview ${index + 1}`}
                                className={`w-full h-24 object-cover rounded border-2 cursor-pointer ${
                                  actualIndex === mainImageIndex
                                    ? 'border-amber-500'
                                    : 'border-gray-300'
                                }`}
                                onClick={() => setMainImageIndex(actualIndex)}
                              />
                              {actualIndex === mainImageIndex && (
                                <div className="absolute top-1 left-1 bg-amber-500 text-white text-xs px-2 py-0.5 rounded">
                                  Main
                                </div>
                              )}
                              {actualIndex === 1 && (
                                <div className="absolute top-1 right-1 bg-blue-500 text-white text-xs px-2 py-0.5 rounded">
                                  Hover
                                </div>
                              )}
                              <button
                                type="button"
                                onClick={() => removeImage(index)}
                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                              >
                                ×
                              </button>
                              {index > 0 && (
                                <button
                                  type="button"
                                  onClick={() => moveImage(index, index - 1)}
                                  className="absolute left-1 top-1/2 -translate-y-1/2 bg-gray-700 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                                >
                                  ←
                                </button>
                              )}
                              {index < previewImages.length - 1 && (
                                <button
                                  type="button"
                                  onClick={() => moveImage(index, index + 1)}
                                  className="absolute right-1 top-1/2 -translate-y-1/2 bg-gray-700 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                                >
                                  →
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                <div className="md:col-span-2 flex items-center">
                  <input
                    type="checkbox"
                    id="isFeatured"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="w-4 h-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
                  />
                  <label htmlFor="isFeatured" className="ml-2 text-sm text-gray-700">
                    Mark as Featured Product
                  </label>
                </div>
              </div>

              {/* SEO Section */}
              <div className="border border-amber-200 rounded-lg p-4 bg-amber-50 space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-base font-semibold text-amber-800">SEO Settings</span>
                  <span className="text-xs text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">Optional</span>
                </div>
                <p className="text-xs text-amber-700">
                  Leave blank to auto-generate from product name, description, and category. Custom values override the defaults.
                </p>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-sm font-medium text-gray-700">SEO Title</label>
                    <span className={`text-xs ${formData.seoTitle.length > 60 ? 'text-red-500 font-medium' : 'text-gray-400'}`}>
                      {formData.seoTitle.length}/60
                    </span>
                  </div>
                  <input
                    type="text"
                    value={formData.seoTitle}
                    onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-500 text-sm"
                    placeholder={formData.name ? `${formData.name} – Buy Online India | Thrayam Toys` : 'e.g., Wooden Stacking Rings – Buy Online India | Thrayam Toys'}
                    maxLength={80}
                  />
                  <p className="text-xs text-gray-400 mt-1">Keep under 60 characters for best display in Google</p>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-sm font-medium text-gray-700">SEO Description</label>
                    <span className={`text-xs ${formData.seoDescription.length > 160 ? 'text-red-500 font-medium' : 'text-gray-400'}`}>
                      {formData.seoDescription.length}/160
                    </span>
                  </div>
                  <textarea
                    value={formData.seoDescription}
                    onChange={(e) => setFormData({ ...formData, seoDescription: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-500 text-sm resize-none"
                    placeholder="e.g., Buy handcrafted wooden stacking rings for babies. Non-toxic, Montessori-inspired, safe for 6+ months. Free shipping above ₹499."
                    rows={3}
                    maxLength={200}
                  />
                  <p className="text-xs text-gray-400 mt-1">Keep under 160 characters for best display in Google</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">SEO Keywords</label>
                  <input
                    type="text"
                    value={formData.seoKeywords}
                    onChange={(e) => setFormData({ ...formData, seoKeywords: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-500 text-sm"
                    placeholder="e.g., wooden stacking rings, baby toys India, Montessori toys"
                  />
                  <p className="text-xs text-gray-400 mt-1">Comma-separated keywords related to this product</p>
                </div>

                {/* Google Preview */}
                {(formData.seoTitle || formData.name) && (
                  <div className="border border-gray-200 rounded-lg p-3 bg-white">
                    <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">Google Preview</p>
                    <p className="text-[#1a0dab] text-base font-medium leading-tight truncate">
                      {formData.seoTitle || (formData.name ? `${formData.name} – Buy Online India | Thrayam Toys` : '')}
                    </p>
                    <p className="text-[#006621] text-xs mt-0.5">thrayamtoys.com › products › ...</p>
                    <p className="text-[#545454] text-sm mt-1 line-clamp-2">
                      {formData.seoDescription || 'Buy this product at Thrayam Toys. Handcrafted wooden toys for babies and toddlers. Safe, non-toxic, Montessori-inspired. Free shipping above ₹499 across India.'}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition font-medium"
                >
                  {editingProduct ? 'Update Product' : 'Create Product'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition font-medium"
                >
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

export default AdminProducts;
