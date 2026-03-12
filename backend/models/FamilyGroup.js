const mongoose = require('mongoose');

const familyGroupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      default: 'Family Group',
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    members: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      joinedAt: {
        type: Date,
        default: Date.now,
      },
      invitedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      status: {
        type: String,
        enum: ['pending', 'active', 'removed'],
        default: 'active',
      },
    }],
    pendingInvitations: [{
      email: {
        type: String,
        required: true,
        lowercase: true,
      },
      invitedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      invitedAt: {
        type: Date,
        default: Date.now,
      },
      invitationToken: {
        type: String,
        required: true,
      },
      expiresAt: {
        type: Date,
        required: true,
        default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    }],
    subscription: {
      plan: {
        type: String,
        enum: ['family'],
        default: 'family',
      },
      billingCycle: {
        type: String,
        enum: ['monthly', 'yearly'],
        required: true,
      },
      isActive: {
        type: Boolean,
        default: true,
      },
      nextBillingDate: Date,
      documentLimitTotal: {
        type: Number,
        default: 150, // 150 documents per month for family plan
      },
      documentLimitUsed: {
        type: Number,
        default: 0,
      },
      documentLimitResetDate: Date,
    },
    settings: {
      maxMembers: {
        type: Number,
        default: 4, // Owner + 3 additional members
      },
      allowMemberInvitations: {
        type: Boolean,
        default: true, // Allow all members to invite others
      },
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
familyGroupSchema.index({ owner: 1 });
familyGroupSchema.index({ 'members.user': 1 });
familyGroupSchema.index({ 'pendingInvitations.email': 1 });

// Method to check if user is a member
familyGroupSchema.methods.isMember = function(userId) {
  return this.members.some(member => 
    member.user.toString() === userId.toString() && 
    member.status === 'active'
  );
};

// Method to check if email has pending invitation
familyGroupSchema.methods.hasPendingInvitation = function(email) {
  return this.pendingInvitations.some(invitation => 
    invitation.email === email.toLowerCase() &&
    invitation.expiresAt > new Date()
  );
};

// Method to get active member count
familyGroupSchema.methods.getActiveMemberCount = function() {
  return this.members.filter(member => member.status === 'active').length + 1; // +1 for owner
};

// Method to check if can add more members
familyGroupSchema.methods.canAddMembers = function() {
  return this.getActiveMemberCount() < this.settings.maxMembers;
};

// Method to check if user can process documents (shared limit)
familyGroupSchema.methods.canProcessDocument = function() {
  return this.subscription.documentLimitUsed < this.subscription.documentLimitTotal;
};

// Method to increment document count
familyGroupSchema.methods.incrementDocumentCount = function() {
  this.subscription.documentLimitUsed += 1;
  return this;
};

// Method to reset document limit (monthly)
familyGroupSchema.methods.resetDocumentLimit = function() {
  const now = new Date();
  
  if (!this.subscription.documentLimitResetDate || this.subscription.documentLimitResetDate < now) {
    this.subscription.documentLimitUsed = 0;
    const nextMonth = new Date(now);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    nextMonth.setDate(1);
    nextMonth.setHours(0, 0, 0, 0);
    this.subscription.documentLimitResetDate = this.subscription.nextBillingDate || nextMonth;
  }
  
  return this;
};

const FamilyGroup = mongoose.model('FamilyGroup', familyGroupSchema);

module.exports = FamilyGroup; 