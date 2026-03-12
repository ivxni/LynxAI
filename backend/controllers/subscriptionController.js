const subscriptionService = require('../services/subscriptionService');
const asyncHandler = require('express-async-handler');

/**
 * Get subscription details for the authenticated user
 * @route GET /api/subscription
 * @access Private
 */
const getSubscriptionDetails = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  
  const subscriptionDetails = await subscriptionService.getSubscriptionDetails(userId);
  
  res.status(200).json(subscriptionDetails);
});

/**
 * Start a free trial
 * @route POST /api/subscription/trial
 * @access Private
 */
const startFreeTrial = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  
  const result = await subscriptionService.startFreeTrial(userId);
  
  res.status(200).json(result);
});

/**
 * Subscribe to premium plan
 * @route POST /api/subscription/premium
 * @access Private
 */
const subscribeToPremium = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { billingCycle } = req.body;
  
  if (!billingCycle || (billingCycle !== 'monthly' && billingCycle !== 'yearly')) {
    res.status(400);
    throw new Error('Please provide a valid billing cycle (monthly or yearly)');
  }
  
  const result = await subscriptionService.subscribeToPremium(userId, billingCycle);
  
  res.status(200).json(result);
});

/**
 * Subscribe to any plan (premium, family, business)
 * @route POST /api/subscription/subscribe
 * @access Private
 */
const subscribeToPlan = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { planType, billingCycle } = req.body;
  
  if (!planType || !['premium', 'family', 'business'].includes(planType)) {
    res.status(400);
    throw new Error('Please provide a valid plan type (premium, family, or business)');
  }
  
  if (planType === 'business' && billingCycle !== 'monthly') {
    res.status(400);
    throw new Error('Business plan only supports monthly billing');
  }
  
  if (planType !== 'business' && (!billingCycle || !['monthly', 'yearly'].includes(billingCycle))) {
    res.status(400);
    throw new Error('Please provide a valid billing cycle (monthly or yearly)');
  }
  
  const result = await subscriptionService.subscribeToPlan(userId, planType, billingCycle);
  
  res.status(200).json(result);
});

/**
 * Cancel subscription
 * @route POST /api/subscription/cancel
 * @access Private
 */
const cancelSubscription = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  
  const result = await subscriptionService.cancelSubscription(userId);
  
  res.status(200).json(result);
});

/**
 * Reactivate a cancelled subscription
 * @route POST /api/subscription/reactivate
 * @access Private
 */
const reactivateSubscription = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  
  const result = await subscriptionService.reactivateSubscription(userId);
  
  res.status(200).json(result);
});

/**
 * Check if user can process a document
 * @route GET /api/subscription/can-process
 * @access Private
 */
const canProcessDocument = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  
  const result = await subscriptionService.canProcessDocument(userId);
  
  res.status(200).json(result);
});

/**
 * Increment document count
 * @route POST /api/subscription/increment
 * @access Private
 */
const incrementDocumentCount = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  
  try {
    const result = await subscriptionService.incrementDocumentCount(userId);
    res.status(200).json(result);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

/**
 * Verify purchase receipt from Apple/Google
 * @route POST /api/subscription/verify-purchase
 * @access Private
 */
const verifyPurchase = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { platform, productIdentifier, billingCycle, transactionId } = req.body;
  
  if (!platform || !productIdentifier || !billingCycle) {
    res.status(400);
    throw new Error('Please provide all required purchase information');
  }
  
  try {
    const result = await subscriptionService.verifyPurchase(
      userId, 
      platform, 
      productIdentifier, 
      billingCycle,
      transactionId
    );
    res.status(200).json(result);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

/**
 * Restore purchases from Apple/Google
 * @route POST /api/subscription/restore-purchases
 * @access Private
 */
const restorePurchases = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { platform, purchases } = req.body;
  
  if (!platform || !purchases) {
    res.status(400);
    throw new Error('Please provide all required purchase information');
  }
  
  try {
    const result = await subscriptionService.restorePurchases(userId, platform, purchases);
    res.status(200).json(result);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

module.exports = {
  getSubscriptionDetails,
  startFreeTrial,
  subscribeToPremium,
  subscribeToPlan,
  cancelSubscription,
  reactivateSubscription,
  canProcessDocument,
  incrementDocumentCount,
  verifyPurchase,
  restorePurchases
}; 