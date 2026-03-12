const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const appleSignin = require('apple-signin-auth');

// @desc    Apple Sign-In
// @route   POST /api/auth/apple-signin
// @access  Public
const appleSignIn = async (req, res, next) => {
  try {
    const { identityToken, authorizationCode, user, email, fullName } = req.body;

    if (!identityToken) {
      res.status(400);
      const error = new Error('Identity token is required');
      return next(error);
    }

    // Dev mode: bypass Apple token verification when SKIP_APPLE_VERIFICATION is set
    if (process.env.NODE_ENV === 'development' && process.env.SKIP_APPLE_VERIFICATION === 'true') {
      const appleUserId = user || `dev_user_${Date.now()}`;
      const appleEmail = email || `dev_user_${Date.now()}@apple.private`;
      
      // Check if user already exists with this Apple ID
      let existingUser = await User.findOne({ appleId: appleUserId });

      if (existingUser) {
        return res.json({
          _id: existingUser._id,
          email: existingUser.email,
          firstName: existingUser.firstName,
          lastName: existingUser.lastName,
          authProvider: existingUser.authProvider,
          token: generateToken(existingUser._id),
        });
      }

      const newUser = await User.create({
        appleId: appleUserId,
        email: appleEmail,
        firstName: fullName?.givenName || 'Dev',
        lastName: fullName?.familyName || 'User',
        authProvider: 'apple',
        isVerified: true,
      });

      return res.status(201).json({
        _id: newUser._id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        authProvider: newUser.authProvider,
        token: generateToken(newUser._id),
      });
    }

    // Production: Verify the identity token with Apple
    const bundleId = process.env.APPLE_BUNDLE_ID || 'com.snapocr.app';
    console.log(`Verifying Apple token with bundle ID: ${bundleId}`);
    
    const appleResponse = await appleSignin.verifyIdToken(identityToken, {
      audience: bundleId,
      ignoreExpiration: false,
    });

    const appleUserId = appleResponse.sub;
    const appleEmail = appleResponse.email || email;

    // Check if user already exists with this Apple ID
    let existingUser = await User.findOne({ appleId: appleUserId });

    if (existingUser) {
      // User exists, log them in
      return res.json({
        _id: existingUser._id,
        email: existingUser.email,
        firstName: existingUser.firstName,
        lastName: existingUser.lastName,
        authProvider: existingUser.authProvider,
        token: generateToken(existingUser._id),
      });
    }

    // Check if email is already used by another account
    if (appleEmail) {
      const emailUser = await User.findOne({ email: appleEmail });
      if (emailUser && emailUser.authProvider !== 'apple') {
        res.status(400);
        const error = new Error('An account with this email already exists. Please use email login instead.');
        return next(error);
      }
    }

    // Create new user
    const newUser = await User.create({
      appleId: appleUserId,
      email: appleEmail || `user_${appleUserId}@apple.private`, // Fallback for private emails
      firstName: fullName?.givenName || 'User',
      lastName: fullName?.familyName || '',
      authProvider: 'apple',
      isVerified: true, // Apple users are automatically verified
    });

    if (newUser) {
      res.status(201).json({
        _id: newUser._id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        authProvider: newUser.authProvider,
        token: generateToken(newUser._id),
      });
    } else {
      res.status(400);
      const error = new Error('Failed to create user account');
      next(error);
    }
  } catch (error) {
    console.error('Apple Sign-In error:', error);
    
    // Provide more specific error messages
    let errorMessage = 'Apple Sign-In verification failed';
    if (error.message.includes('jwt audience invalid')) {
      errorMessage = 'App configuration error. Please contact support.';
    } else if (error.message.includes('invalid token')) {
      errorMessage = 'Invalid Apple Sign-In token. Please try again.';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    res.status(400);
    const appError = new Error(errorMessage);
    next(appError);
  }
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res, next) => {
  const { email, password, firstName, lastName } = req.body;

  // Check if user already exists
  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    const error = new Error('User already exists');
    return next(error);
  }

  // Create new user
  const user = await User.create({
    email,
    password,
    firstName,
    lastName,
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    const error = new Error('Invalid user data');
    next(error);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
  const { email, password } = req.body;

  // Find user by email
  const user = await User.findOne({ email });

  // Check if user exists and password matches
  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      token: generateToken(user._id),
    });
  } else {
    res.status(401);
    const error = new Error('Invalid email or password');
    next(error);
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res, next) => {
  const user = await User.findById(req.user._id);

  if (user) {
    res.json({
      _id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      profilePicture: user.profilePicture,
      preferences: user.preferences,
    });
  } else {
    res.status(404);
    const error = new Error('User not found');
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateUserProfile = async (req, res, next) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.firstName = req.body.firstName || user.firstName;
    user.lastName = req.body.lastName || user.lastName;
    user.email = req.body.email || user.email;
    user.profilePicture = req.body.profilePicture || user.profilePicture;
    
    if (req.body.preferences) {
      user.preferences = {
        ...user.preferences,
        ...req.body.preferences,
      };
    }
    
    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      email: updatedUser.email,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      profilePicture: updatedUser.profilePicture,
      preferences: updatedUser.preferences,
      token: generateToken(updatedUser._id),
    });
  } else {
    res.status(404);
    const error = new Error('User not found');
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  appleSignIn,
}; 