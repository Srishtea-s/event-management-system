// FORM HELPER FUNCTIONS (B1 Role)
export const formatFormData = (formData) => {
  const formatted = {};
  Object.keys(formData).forEach(key => {
    const value = formData[key];
    if (value !== null && value !== undefined) {
      formatted[key] = typeof value === 'string' ? value.trim() : value;
    }
  });
  return formatted;
};

export const initializeForm = (initialValues) => {
  return {
    values: initialValues,
    errors: {},
    touched: {},
    isSubmitting: false
  };
};

export const handleInputChange = (setValues, name, value) => {
  setValues(prev => ({
    ...prev,
    [name]: value
  }));
};

export const validateOnBlur = (values, validateFn, name, setErrors) => {
  if (validateFn) {
    const fieldErrors = validateFn({ [name]: values[name] });
    if (fieldErrors[name]) {
      setErrors(prev => ({ ...prev, [name]: fieldErrors[name] }));
    }
  }
};
