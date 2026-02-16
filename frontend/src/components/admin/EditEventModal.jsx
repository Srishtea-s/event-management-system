import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { createEvent } from '../../services/events'; // Make sure this exists and works

const EditEventModal = ({ isOpen, onClose, event, onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '14:30', // ✅ Default time
    venue: '',     // ✅ Correct field name
    capacity: 50,
    category: 'Academic' // ✅ Match your categories
  });
  
  const [errors, setErrors] = useState({});
  
  // Initialize form with event data if editing
  useEffect(() => {
    if (event) {
      const eventDate = new Date(event.date);
      setFormData({
        title: event.title || '',
        description: event.description || '',
        date: eventDate.toISOString().split('T')[0] || '',
        time: event.time || '14:30',
        venue: event.venue || '', // ✅ Correct field
        capacity: event.capacity || 50,
        category: event.category || 'Academic'
      });
    } else {
      // Reset for new event
      setFormData({
        title: '',
        description: '',
        date: '',
        time: '14:30',
        venue: '', // ✅ Correct field
        capacity: 50,
        category: 'Academic'
      });
    }
    setErrors({});
  }, [event, isOpen]);
  
  if (!isOpen) return null;
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.date) newErrors.date = 'Date is required';
    if (!formData.venue.trim()) newErrors.venue = 'Venue is required'; // ✅ Correct field
    if (formData.capacity < 1) newErrors.capacity = 'Capacity must be at least 1';
    
    // Check if date is in future
    const selectedDate = new Date(formData.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) newErrors.date = 'Event date must be in the future';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) || 0 : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    try {
      // ✅ FIXED: Create proper date-time for backend
      const eventDateTime = new Date(formData.date);
      const [hours, minutes] = formData.time.split(':');
      eventDateTime.setHours(hours || 14, minutes || 30);
      
      const eventData = {
        title: formData.title,
        description: formData.description,
        date: eventDateTime.toISOString(), // Full ISO date
        time: formData.time,
        venue: formData.venue, // ✅ Correct field
        capacity: formData.capacity,
        category: formData.category
      };
      
      console.log('Sending event data:', eventData);
      
      let response;
      if (event && event._id) {
        // Update existing event
        response = await adminService.updateEvent(event._id, eventData);
      } else {
        // Create new event
        response = await createEvent(eventData);
      }
      
      console.log('Save response:', response);
      
      alert(event ? '✅ Event updated successfully!' : '✅ Event created successfully!');
      
      // Call onSuccess with the saved event
      const savedEvent = response.data || response;
      onSuccess(savedEvent);
      onClose();
    } catch (error) {
      console.error('❌ Save failed:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
      alert(`❌ Failed to save event: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-gray-800">
              {event ? 'Edit Event' : 'Create New Event'}
            </h3>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
              disabled={isLoading}
            >
              &times;
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Event Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.title ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter event title"
                  disabled={isLoading}
                />
                {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title}</p>}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Describe your event"
                  disabled={isLoading}
                />
              </div>

              {/* Date and Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.date ? 'border-red-500' : 'border-gray-300'
                    }`}
                    disabled={isLoading}
                  />
                  {errors.date && <p className="mt-1 text-sm text-red-500">{errors.date}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Time
                  </label>
                  <input
                    type="time"
                    name="time"
                    value={formData.time}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Venue and Capacity */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Venue *
                  </label>
                  <input
                    type="text"
                    name="venue" // ✅ Correct field name
                    value={formData.venue}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.venue ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Where is the event?"
                    disabled={isLoading}
                  />
                  {errors.venue && <p className="mt-1 text-sm text-red-500">{errors.venue}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Capacity
                  </label>
                  <input
                    type="number"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleChange}
                    min="1"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.capacity ? 'border-red-500' : 'border-gray-300'
                    }`}
                    disabled={isLoading}
                  />
                  {errors.capacity && <p className="mt-1 text-sm text-red-500">{errors.capacity}</p>}
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={isLoading}
                >
                  <option value="Academic">Academic</option>
                  <option value="Cultural">Cultural</option>
                  <option value="Sports">Sports</option>
                  <option value="Technical">Technical</option>
                  <option value="Workshop">Workshop</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-8 pt-6 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400"
                disabled={isLoading}
              >
                {isLoading ? 'Saving...' : (event ? 'Update Event' : 'Create Event')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditEventModal;