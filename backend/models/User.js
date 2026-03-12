const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const userSchema = new mongoose.Schema(
  {
    uuid: {
      type: String,
      default: uuidv4,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: function() {
        // Password is only required if not an Apple user
        return !this.appleId;
      },
    },
    // Apple Sign-In fields
    appleId: {
      type: String,
      unique: true,
      sparse: true, // Allows multiple null values
    },
    authProvider: {
      type: String,
      enum: ['email', 'apple'],
      default: 'email',
    },
    firstName: {
      type: String,
      trim: true,
    },
    lastName: {
      type: String,
      trim: true,
    },
    profilePicture: {
      type: String,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: String,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    subscription: {
      plan: {
        type: String,
        enum: ['free', 'premium', 'family', 'business'],
        default: 'free',
      },
      billingCycle: {
        type: String,
        enum: ['none', 'monthly', 'yearly'],
        default: 'none',
      },
      deviceCount: {
        type: Number,
        default: 1, // Number of devices allowed
      },
      // Family subscription fields
      familyGroup: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FamilyGroup',
        default: null,
      },
      isMainFamilyAccount: {
        type: Boolean,
        default: false, // True for the person who pays for family plan
      },
      trialStartDate: Date,
      trialEndDate: Date,
      isInTrial: {
        type: Boolean, 
        default: false
      },
      lastBillingDate: Date,
      nextBillingDate: Date,
      documentLimitTotal: {
        type: Number,
        default: 3, // Default 3 documents per day for free users
      },
      documentLimitUsed: {
        type: Number,
        default: 0,
      },
      documentLimitResetDate: Date, // Weekly reset for free users
    },
    preferences: {
      notifications: {
        type: Boolean,
        default: true,
      },
      theme: {
        type: String,
        default: 'light',
      },
      language: {
        type: String,
        default: 'en',
      },
    },
  },
  {
    timestamps: true,
  }
);

// Method to compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Middleware to hash password before saving
userSchema.pre('save', async function (next) {
  // Skip password hashing for Apple users or if password is not modified
  if (!this.isModified('password') || this.authProvider === 'apple') {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Set the document limit based on subscription plan
userSchema.methods.updateDocumentLimit = function() {
  const now = new Date();
  
  // For free users, 3 documents per day
  if (this.subscription.plan === 'free') {
    this.subscription.documentLimitTotal = 3; // 3 documents per day
    this.subscription.deviceCount = 1;
    
    // Daily reset for free users
    if (!this.subscription.documentLimitResetDate || this.subscription.documentLimitResetDate < now) {
      // Reset counter and set next reset date to tomorrow
      this.subscription.documentLimitUsed = 0;
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0); // Reset at midnight
      this.subscription.documentLimitResetDate = tomorrow;
    }
  } 
  // For premium users, 100 documents per month
  else if (this.subscription.plan === 'premium') {
    this.subscription.documentLimitTotal = 100;
    this.subscription.deviceCount = 1;
    
    // Monthly reset for premium users
    if (!this.subscription.documentLimitResetDate || this.subscription.documentLimitResetDate < now) {
      // Reset counter and set next reset date to next billing date or next month
      this.subscription.documentLimitUsed = 0;
      const nextMonth = new Date(now);
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      nextMonth.setDate(1);
      nextMonth.setHours(0, 0, 0, 0);
      this.subscription.documentLimitResetDate = this.subscription.nextBillingDate || nextMonth;
    }
  }
  // For family users, 150 documents per month, 4 devices
  else if (this.subscription.plan === 'family') {
    this.subscription.documentLimitTotal = 150;
    this.subscription.deviceCount = 4;
    
    // Monthly reset for family users
    if (!this.subscription.documentLimitResetDate || this.subscription.documentLimitResetDate < now) {
      this.subscription.documentLimitUsed = 0;
      const nextMonth = new Date(now);
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      nextMonth.setDate(1);
      nextMonth.setHours(0, 0, 0, 0);
      this.subscription.documentLimitResetDate = this.subscription.nextBillingDate || nextMonth;
    }
  }
  // For business users, unlimited documents and devices
  else if (this.subscription.plan === 'business') {
    this.subscription.documentLimitTotal = 999999; // Effectively unlimited
    this.subscription.deviceCount = 999999; // Effectively unlimited
    
    // Monthly reset (just for consistency)
    if (!this.subscription.documentLimitResetDate || this.subscription.documentLimitResetDate < now) {
      this.subscription.documentLimitUsed = 0;
      const nextMonth = new Date(now);
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      nextMonth.setDate(1);
      nextMonth.setHours(0, 0, 0, 0);
      this.subscription.documentLimitResetDate = this.subscription.nextBillingDate || nextMonth;
    }
  }
  
  return this;
};

// Check if user can process more documents
userSchema.methods.canProcessDocument = function() {
  return this.subscription.documentLimitUsed < this.subscription.documentLimitTotal;
};

// Increment the document counter
userSchema.methods.incrementDocumentCount = function() {
  this.subscription.documentLimitUsed += 1;
  return this;
};

const User = mongoose.model('User', userSchema);

module.exports = User; 