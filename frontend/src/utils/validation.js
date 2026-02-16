// FORM VALIDATION UTILITIES (B1 Role)
export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePassword = (password) => {
  const errors = [];
  if (password.length < 6) errors.push('At least 6 characters');
  if (!/[A-Z]/.test(password)) errors.push('One uppercase letter');
  if (!/[0-9]/.test(password)) errors.push('One number');
  return errors;
};

export const validateEventForm = (data) => {
  const errors = {};
  if (!data.title?.trim()) errors.title = 'Event title is required';
  if (!data.description?.trim()) errors.description = 'Description is required';
  if (!data.date || new Date(data.date) < new Date()) {
    errors.date = 'Date must be in the future';
  }
  if (!data.venue?.trim()) errors.venue = 'Venue is required';
  if (!data.capacity || data.capacity < 1) errors.capacity = 'Capacity must be at least 1';
  return errors;
};

export const validateProfileForm = (data) => {
  const errors = {};
  if (!data.name?.trim()) errors.name = 'Name is required';
  if (!validateEmail(data.email)) errors.email = 'Valid email required';
  if (data.phone && !/^\d{10}$/.test(data.phone.replace(/\D/g, ''))) {
    errors.phone = '10-digit phone number required';
  }
  return errors;
};

export const hasErrors = (errors) => {
  return Object.keys(errors).some(key => errors[key]);
};
