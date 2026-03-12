/**
 * Middleware to validate request data
 * @param {Function} validator - Validation function that returns an object with error property if validation fails
 * @returns {Function} - Express middleware function
 */
const validate = (validator) => {
  return (req, res, next) => {
    const { error } = validator(req.body);
    if (error) {
      res.status(400);
      throw new Error(error.details[0].message);
    }
    next();
  };
};

module.exports = { validate }; 