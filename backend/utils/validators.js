/**
 * Validate user registration data
 * @param {Object} data - User registration data
 * @returns {Object} - Validation result
 */
const validateRegister = (data) => {
  const errors = {};

  // Validate email
  if (!data.email) {
    errors.email = 'Email is required';
  } else if (!/\S+@\S+\.\S+/.test(data.email)) {
    errors.email = 'Email is invalid';
  }

  // Validate password
  if (!data.password) {
    errors.password = 'Password is required';
  } else if (data.password.length < 6) {
    errors.password = 'Password must be at least 6 characters';
  }

  // Validate first name
  if (!data.firstName) {
    errors.firstName = 'First name is required';
  }

  // Validate last name
  if (!data.lastName) {
    errors.lastName = 'Last name is required';
  }

  return {
    error: Object.keys(errors).length > 0 ? { details: [{ message: JSON.stringify(errors) }] } : null,
  };
};

/**
 * Validate user login data
 * @param {Object} data - User login data
 * @returns {Object} - Validation result
 */
const validateLogin = (data) => {
  const errors = {};

  // Validate email
  if (!data.email) {
    errors.email = 'Email is required';
  }

  // Validate password
  if (!data.password) {
    errors.password = 'Password is required';
  }

  return {
    error: Object.keys(errors).length > 0 ? { details: [{ message: JSON.stringify(errors) }] } : null,
  };
};

/**
 * Validate document status update data
 * @param {Object} data - Document status update data
 * @returns {Object} - Validation result
 */
const validateDocumentStatus = (data) => {
  const errors = {};

  // Validate status
  if (!data.status) {
    errors.status = 'Status is required';
  } else if (!['processing', 'completed', 'failed'].includes(data.status)) {
    errors.status = 'Status must be one of: processing, completed, failed';
  }

  return {
    error: Object.keys(errors).length > 0 ? { details: [{ message: JSON.stringify(errors) }] } : null,
  };
};

/**
 * Validate user profile update data
 * @param {Object} data - User profile update data
 * @returns {Object} - Validation result
 */
const validateProfileUpdate = (data) => {
  const errors = {};

  // Validate email if provided
  if (data.email && !/\S+@\S+\.\S+/.test(data.email)) {
    errors.email = 'Email is invalid';
  }

  // Validate password if provided
  if (data.password && data.password.length < 6) {
    errors.password = 'Password must be at least 6 characters';
  }

  return {
    error: Object.keys(errors).length > 0 ? { details: [{ message: JSON.stringify(errors) }] } : null,
  };
};

module.exports = {
  validateRegister,
  validateLogin,
  validateDocumentStatus,
  validateProfileUpdate,
}; 