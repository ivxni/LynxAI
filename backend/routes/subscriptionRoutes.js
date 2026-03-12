const express = require('express');
const { protect } = require('../middleware/auth');
const subscriptionController = require('../controllers/subscriptionController');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

// Get subscription details
router.get('/', subscriptionController.getSubscriptionDetails);

// Start free trial
router.post('/trial', subscriptionController.startFreeTrial);

// Subscribe to premium
router.post('/premium', subscriptionController.subscribeToPremium);

// Subscribe to any plan (premium, family, business)
router.post('/subscribe', subscriptionController.subscribeToPlan);

// Cancel subscription
router.post('/cancel', subscriptionController.cancelSubscription);

// Reactivate subscription
router.post('/reactivate', subscriptionController.reactivateSubscription);

// Check if user can process a document
router.get('/can-process', subscriptionController.canProcessDocument);

// Increment document count
router.post('/increment', subscriptionController.incrementDocumentCount);

// Verify purchase from Apple/Google
router.post('/verify-purchase', subscriptionController.verifyPurchase);

// Restore purchases from Apple/Google
router.post('/restore-purchases', subscriptionController.restorePurchases);

module.exports = router; 