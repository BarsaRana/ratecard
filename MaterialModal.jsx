import React, { useState, useEffect } from 'react';
import './MaterialModal.css';

const MaterialModal = ({ isOpen, onClose, onSubmit, material, mode = 'add' }) => {
  const [formData, setFormData] = useState({
    id: '',
    salesPartNo: '',
    image: null,
    description: '',
    site: '',
    price: ''
  });

  // Populate form data when editing
  useEffect(() => {
    if (material && mode === 'edit') {
      setFormData({
        id: material.id || '',
        salesPartNo: material.salesPartNo || '',
        image: material.image || null,
        description: material.description || '',
        site: material.site || '',
        price: material.price || ''
      });
    } else {
      // Reset form for add mode
      setFormData({
        id: '',
        salesPartNo: '',
        image: null,
        description: '',
        site: '',
        price: ''
      });
    }
  }, [material, mode, isOpen]);

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: files ? files[0] : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    if (mode === 'add') {
      setFormData({
        id: '',
        salesPartNo: '',
        image: null,
        description: '',
        site: '',
        price: ''
      });
    }
  };

  if (!isOpen) return null;

  const isEditMode = mode === 'edit';
  const modalTitle = isEditMode ? 'Edit Material' : 'Add New Material';
  const submitButtonText = isEditMode ? 'Update Material' : 'Save Material';
  const submitButtonIcon = isEditMode ? (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
      <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
    </svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
      <polyline points="17,21 17,13 7,13 7,21"></polyline>
      <polyline points="7,3 7,8 15,8"></polyline>
    </svg>
  );

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{modalTitle}</h2>
          <button className="modal-close" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="material-form">
          <div className="form-grid">
            {/* Left Column */}
            <div className="form-column">
              <div className="form-group">
                <label htmlFor="id" className="form-label">
                  <span className="label-icon">🆔</span>
                  Material ID
                </label>
                <input
                  type="text"
                  id="id"
                  name="id"
                  value={formData.id}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Enter material ID"
                  required
                  readOnly={isEditMode}
                />
              </div>

              <div className="form-group">
                <label htmlFor="salesPartNo" className="form-label">
                  <span className="label-icon">📋</span>
                  Sales Part Number
                </label>
                <input
                  type="text"
                  id="salesPartNo"
                  name="salesPartNo"
                  value={formData.salesPartNo}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Enter sales part number"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="site" className="form-label">
                  <span className="label-icon">🏢</span>
                  Site
                </label>
                <input
                  type="text"
                  id="site"
                  name="site"
                  value={formData.site}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Enter site location"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="price" className="form-label">
                  <span className="label-icon">💰</span>
                  Price
                </label>
                <div className="price-input-wrapper">
                  <span className="currency-symbol">$</span>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    className="form-input price-input"
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="form-column">
              <div className="form-group full-width">
                <label htmlFor="image" className="form-label">
                  <span className="label-icon">🖼️</span>
                  Product Image
                </label>
                <div className="image-upload-area">
                  <input
                    type="file"
                    id="image"
                    name="image"
                    onChange={handleInputChange}
                    className="image-input"
                    accept="image/*"
                  />
                  <div className="upload-placeholder">
                    {formData.image ? (
                      <div>
                        <img 
                          src={typeof formData.image === 'string' ? formData.image : URL.createObjectURL(formData.image)} 
                          alt="Preview" 
                          style={{ maxWidth: '100px', maxHeight: '100px', objectFit: 'cover' }}
                        />
                        <p>Click to change image</p>
                      </div>
                    ) : (
                      <>
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                          <path d="M21 19V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2z"></path>
                          <circle cx="8.5" cy="8.5" r="1.5"></circle>
                          <polyline points="21,15 16,10 5,21"></polyline>
                        </svg>
                        <p>Click to upload image</p>
                        <span>PNG, JPG up to 10MB</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="form-group full-width">
                <label htmlFor="description" className="form-label">
                  <span className="label-icon">📝</span>
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="form-textarea"
                  placeholder="Enter detailed description of the material..."
                  rows="6"
                  required
                ></textarea>
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {submitButtonIcon}
              {submitButtonText}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MaterialModal;
