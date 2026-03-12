import { Language } from '../contexts/LanguageContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useMemo } from 'react';

// Define translation keys
export type TranslationKey = 
  // Common
  | 'common.ok'
  | 'common.cancel'
  | 'common.save'
  | 'common.delete'
  | 'common.edit'
  | 'common.loading'
  | 'common.retry'
  | 'common.error'
  | 'common.success'
  | 'common.version'
  | 'common.logout'
  | 'common.and'
  | 'common.annually'
  
  // Dashboard
  | 'dashboard.title'
  | 'dashboard.welcome'
  | 'dashboard.upload'
  | 'dashboard.history'
  | 'dashboard.profile'
  | 'dashboard.recentDocuments'
  | 'dashboard.viewAll'
  | 'dashboard.noDocuments'
  | 'dashboard.uploadFirst'
  | 'dashboard.documentsRemaining'
  | 'dashboard.upgrade'
  | 'dashboard.reactivate'
  
  // Upload
  | 'upload.title'
  | 'upload.selectImage'
  | 'upload.takePhoto'
  | 'upload.processing'
  | 'upload.success'
  | 'upload.error'
  | 'upload.permissionRequired'
  | 'upload.cameraPermission'
  | 'upload.successMessage'
  | 'upload.errorMessage'
  | 'upload.confirm'
  | 'upload.selectImageDescription'
  | 'upload.takePhotoDescription'
  | 'upload.selectProcessingType'
  | 'upload.freeOptions'
  | 'upload.freeOptionsDescription'
  | 'upload.premiumOptions'
  | 'upload.premiumOptionsDescription'
  | 'upload.upgradeForPremiumFeatures'
  | 'upload.selectProcessingForGallery'
  | 'upload.selectProcessingForCamera'
  
  // History
  | 'history.title'
  | 'history.noDocuments'
  | 'history.uploadFirst'
  | 'history.loadingDocuments'
  | 'history.errorLoading'
  | 'history.status.completed'
  | 'history.status.processing'
  | 'history.status.failed'
  
  // Document View
  | 'docView.title'
  | 'docView.loading'
  | 'docView.error'
  | 'docView.noPdf'
  | 'docView.invalidDocument'
  | 'docView.failedToLoad'
  | 'docView.pdfRenderError'
  | 'docView.sharingFailed'
  
  // Profile
  | 'profile.title'
  | 'profile.editProfile'
  | 'profile.notifications'
  | 'profile.security'
  | 'profile.helpSupport'
  | 'profile.appearance'
  | 'profile.language'
  | 'profile.logout'
  | 'profile.account'
  | 'profile.preferences'
  | 'profile.loadingProfile'
  | 'profile.errorProfile'
  | 'profile.settings'
  | 'profile.darkMode'
  | 'profile.changePassword'
  | 'profile.privacyPolicy'
  | 'profile.termsOfService'
  | 'profile.logoutTitle'
  | 'profile.logoutConfirm'
  | 'profile.selectTheme'
  | 'profile.systemDefault'
  | 'profile.lightMode'
  | 'profile.themeChangeNote'
  | 'profile.firstName'
  | 'profile.lastName'
  | 'profile.email'
  | 'profile.allFieldsRequired'
  | 'profile.profileUpdated'
  | 'profile.updateFailed'
  | 'profile.currentPassword'
  | 'profile.newPassword'
  | 'profile.confirmPassword'
  | 'profile.passwordsDoNotMatch'
  | 'profile.passwordTooShort'
  | 'profile.passwordChanged'
  | 'profile.passwordChangeFailed'
  | 'profile.passwordRequirements'
  | 'profile.minLength'
  | 'profile.hasLetter'
  | 'profile.hasNumber'
  | 'profile.passwordsMatch'
  | 'profile.nameFieldsRequired'
  | 'profile.enterFirstName'
  | 'profile.enterLastName'
  | 'profile.emailCannotBeChanged'
  
  // Subscription
  | 'subscription.title'
  | 'subscription.plan'
  | 'subscription.billing'
  | 'subscription.trialEnds'
  | 'subscription.nextBilling'
  | 'subscription.documents'
  | 'subscription.resetsOn'
  | 'subscription.startFreeTrial'
  | 'subscription.subscribeMontly'
  | 'subscription.subscribeYearly'
  | 'subscription.cancelTrial'
  | 'subscription.cancelSubscription'
  | 'subscription.cancel'
  | 'subscription.changePlan'
  | 'subscription.current'
  | 'subscription.switchToMonthly'
  | 'subscription.switchToYearly'
  | 'subscription.reactivate'
  | 'subscription.restore'
  | 'subscription.subscriptionEnding'
  | 'subscription.limitReached'
  | 'subscription.free'
  | 'subscription.premium'
  | 'subscription.trial'
  | 'subscription.monthly'
  | 'subscription.yearly'
  | 'subscription.documentsRemaining'
  | 'subscription.trialDescription'
  | 'subscription.monthlyDescription'
  | 'subscription.yearlyDescription'
  | 'subscription.freeDescription'
  | 'subscription.feature.documents'
  | 'subscription.feature.documentsWeekly'
  | 'subscription.feature.priority'
  | 'subscription.feature.standard'
  | 'subscription.feature.cancel'
  | 'subscription.feature.savings'
  | 'subscription.feature.premium'
  | 'subscription.chooseYourPlan'
  | 'subscription.recommended'
  | 'subscription.managePlan'
  | 'subscription.accessUntil'
  | 'subscription.days7'
  | 'subscription.continueFree'
  | 'subscription.freeTrial'
  | 'subscription.freeUser'
  | 'subscription.premiumUser'
  | 'subscription.premiumFamily'
  | 'subscription.businessUser'
  | 'subscription.trialPeriod'
  | 'subscription.freeForever'
  | 'subscription.casualUse'
  | 'subscription.regularUse'
  | 'subscription.idealForFamilies'
  | 'subscription.unlimitedUsage'
  | 'subscription.testPremiumFeatures'
  | 'subscription.stayFree'
  | 'subscription.currentPlan'
  | 'subscription.oneDevice'
  | 'subscription.fourDevices'
  | 'subscription.unlimitedDevices'
  | 'subscription.documentsPerDay'
  | 'subscription.documentsPerMonth'
  | 'subscription.unlimitedDocuments'
  | 'subscription.startFreeTrial7Days'
  | 'subscription.monthsInclusive'
  | 'subscription.save'
  | 'subscription.premiumPlan'
  | 'subscription.familyPlan'
  | 'subscription.businessPlan'
  | 'subscription.premiumMonthly'
  | 'subscription.premiumYearly'
  | 'subscription.familyMonthly'
  | 'subscription.familyYearly'
  | 'subscription.businessMonthly'
  | 'subscription.cancelAndStayFree'
  | 'subscription.perMonth'
  | 'subscription.perYear'
  | 'subscription.unlimited'
  | 'subscription.subscriptionSuccessful'
  | 'subscription.familyPlanSuccessful'
  | 'subscription.businessPlanSuccessful'
  | 'subscription.subscriptionFailed'
  | 'subscription.subscriptionCancelledMessage'
  | 'subscription.confirmSubscription'
  | 'subscription.confirmSubscriptionMessage'
  | 'subscription.subscribeButton'
  | 'subscription.familyDashboard'
  | 'subscription.teamManagement'
  | 'subscription.apiAccess'
  | 'subscription.prioritySupport'
  | 'subscription.savePercent'
  | 'subscription.onlyEuroPerMonth'
  | 'subscription.freeTrialStarted'
  | 'subscription.freeTrialStartedMessage'
  | 'subscription.subscriptionReactivated'
  | 'subscription.subscriptionReactivatedMessage'
  | 'subscription.cancelSubscriptionConfirm'
  | 'subscription.reactivateSubscriptionConfirm'
  | 'subscription.upgradeLabel'
  | 'subscription.failedToLoadDetails'
  | 'subscription.tryAgain'
  | 'subscription.subscriptionCancelled'
  | 'subscription.subscriptionCancelledShort'
  | 'subscription.active'
  | 'subscription.unknown'
  | 'subscription.none'
  | 'subscription.premiumRequired'
  | 'subscription.upgradeForFeature'
  
  // Language
  | 'language.title'
  | 'language.description'
  | 'language.info'
  | 'language.selectLanguage'
  | 'language.changeNote';

type TranslationDictionary = {
  [key in TranslationKey]?: string;
};

// English translations - complete base
const en: TranslationDictionary = {
  // Common
  'common.ok': 'OK',
  'common.cancel': 'Cancel',
  'common.save': 'Save',
  'common.delete': 'Delete',
  'common.edit': 'Edit',
  'common.loading': 'Loading...',
  'common.retry': 'Retry',
  'common.error': 'Error',
  'common.success': 'Success',
  'common.version': 'Version',
  'common.logout': 'Logout',
  'common.and': 'and',
  'common.annually': 'Annually',
  
  // Dashboard
  'dashboard.title': 'Dashboard',
  'dashboard.welcome': 'Welcome',
  'dashboard.upload': 'Upload',
  'dashboard.history': 'History',
  'dashboard.profile': 'Profile',
  'dashboard.recentDocuments': 'Recent Documents',
  'dashboard.viewAll': 'View All Documents',
  'dashboard.noDocuments': 'No documents yet',
  'dashboard.uploadFirst': 'Upload your first document to get started',
  'dashboard.documentsRemaining': 'documents remaining',
  'dashboard.upgrade': 'Upgrade',
  'dashboard.reactivate': 'Reactivate',
  
  // Upload
  'upload.title': 'Upload Document',
  'upload.selectImage': 'Select Image',
  'upload.takePhoto': 'Take Photo',
  'upload.processing': 'Processing...',
  'upload.success': 'Document uploaded successfully',
  'upload.error': 'Error uploading document',
  'upload.permissionRequired': 'Permission Required',
  'upload.cameraPermission': 'Camera permission is required to take photos',
  'upload.successMessage': 'Your document has been uploaded and is being processed',
  'upload.errorMessage': 'An error occurred while uploading your document. Please try again.',
  'upload.confirm': 'Confirm',
  'upload.selectImageDescription': 'Choose an image from your gallery',
  'upload.takePhotoDescription': 'Take a new photo with your camera',
  'upload.selectProcessingType': 'Select Processing Type',
  'upload.freeOptions': 'Free Options',
  'upload.freeOptionsDescription': 'Available with your free account',
  'upload.premiumOptions': 'Premium Options',
  'upload.premiumOptionsDescription': 'Advanced features for premium users',
  'upload.upgradeForPremiumFeatures': 'Upgrade to access premium processing features',
  'upload.selectProcessingForGallery': 'Select Processing for Gallery',
  'upload.selectProcessingForCamera': 'Select Processing for Camera',
  
  // History
  'history.title': 'Document History',
  'history.noDocuments': 'No documents yet',
  'history.uploadFirst': 'Upload your first document to get started',
  'history.loadingDocuments': 'Loading documents...',
  'history.errorLoading': 'Error loading documents',
  'history.status.completed': 'Completed',
  'history.status.processing': 'Processing',
  'history.status.failed': 'Failed',
  
  // Document View
  'docView.title': 'Document Viewer',
  'docView.loading': 'Loading document...',
  'docView.error': 'Error loading document',
  'docView.noPdf': 'No PDF document available',
  'docView.invalidDocument': 'Invalid document ID',
  'docView.failedToLoad': 'Failed to load document',
  'docView.pdfRenderError': 'Failed to render PDF document',
  'docView.sharingFailed': 'Failed to share',
  
  // Profile
  'profile.title': 'Profile',
  'profile.editProfile': 'Edit Profile',
  'profile.notifications': 'Notifications',
  'profile.security': 'Security',
  'profile.helpSupport': 'Help & Support',
  'profile.appearance': 'Appearance',
  'profile.language': 'Language',
  'profile.logout': 'Logout',
  'profile.account': 'Account',
  'profile.preferences': 'Preferences',
  'profile.loadingProfile': 'Loading profile...',
  'profile.errorProfile': 'Error loading profile',
  'profile.settings': 'Settings',
  'profile.darkMode': 'Dark Mode',
  'profile.changePassword': 'Change Password',
  'profile.privacyPolicy': 'Privacy Policy',
  'profile.termsOfService': 'Terms of Service',
  'profile.logoutTitle': 'Logout',
  'profile.logoutConfirm': 'Are you sure you want to logout?',
  'profile.selectTheme': 'Select Theme',
  'profile.systemDefault': 'System Default',
  'profile.lightMode': 'Light Mode',
  'profile.themeChangeNote': 'Changes will be applied immediately to the app interface.',
  'profile.firstName': 'First Name',
  'profile.lastName': 'Last Name',
  'profile.email': 'Email',
  'profile.allFieldsRequired': 'Please fill in all fields',
  'profile.profileUpdated': 'Profile updated successfully',
  'profile.updateFailed': 'Failed to update profile',
  'profile.currentPassword': 'Current Password',
  'profile.newPassword': 'New Password',
  'profile.confirmPassword': 'Confirm Password',
  'profile.passwordsDoNotMatch': 'Passwords do not match',
  'profile.passwordTooShort': 'Password must be at least 6 characters',
  'profile.passwordChanged': 'Password changed successfully',
  'profile.passwordChangeFailed': 'Failed to change password',
  'profile.passwordRequirements': 'Password does not meet requirements',
  'profile.minLength': 'At least 6 characters',
  'profile.hasLetter': 'Contains at least one letter',
  'profile.hasNumber': 'Contains at least one number',
  'profile.passwordsMatch': 'Passwords match',
  'profile.nameFieldsRequired': 'Please fill in first name and last name',
  'profile.enterFirstName': 'Enter your first name',
  'profile.enterLastName': 'Enter your last name',
  'profile.emailCannotBeChanged': 'Email address cannot be changed',
  
  // Subscription
  'subscription.title': 'Subscription',
  'subscription.plan': 'Plan',
  'subscription.billing': 'Billing',
  'subscription.trialEnds': 'Trial ends',
  'subscription.nextBilling': 'Next billing',
  'subscription.documents': 'Documents',
  'subscription.resetsOn': 'Resets on',
  'subscription.startFreeTrial': 'Start Free Trial',
  'subscription.subscribeMontly': 'Subscribe Monthly',
  'subscription.subscribeYearly': 'Subscribe Yearly',
  'subscription.cancelTrial': 'Cancel Trial',
  'subscription.cancelSubscription': 'Cancel Subscription',
  'subscription.cancel': 'Cancel',
  'subscription.changePlan': 'Change Plan',
  'subscription.current': 'Current',
  'subscription.switchToMonthly': 'Switch to Monthly',
  'subscription.switchToYearly': 'Switch to Yearly',
  'subscription.reactivate': 'Reactivate',
  'subscription.restore': 'Restore Purchases',
  'subscription.subscriptionEnding': 'Your premium subscription will end soon',
  'subscription.limitReached': 'You have reached your document limit',
  'subscription.free': 'Free',
  'subscription.premium': 'Premium',
  'subscription.trial': 'Trial',
  'subscription.monthly': 'Monthly',
  'subscription.yearly': 'Yearly',
  'subscription.documentsRemaining': 'documents remaining',
  'subscription.trialDescription': 'Try all premium features for 7 days',
  'subscription.monthlyDescription': 'For regular use with all features',
  'subscription.yearlyDescription': 'Best value with 2 free months',
  'subscription.freeDescription': 'For occasional use',
  'subscription.feature.documents': '1 document per day',
  'subscription.feature.documentsWeekly': '7 documents per week',
  'subscription.feature.priority': 'Priority processing',
  'subscription.feature.standard': 'Standard processing',
  'subscription.feature.cancel': 'Cancel anytime',
  'subscription.feature.savings': '17% savings',
  'subscription.feature.premium': 'All premium features',
  'subscription.chooseYourPlan': 'Choose Your Plan',
  'subscription.recommended': 'Recommended',
  'subscription.managePlan': 'Manage Plan',
  'subscription.accessUntil': 'Access until',
  'subscription.days7': '7 days',
  'subscription.continueFree': 'Continue Free',
  'subscription.freeTrial': 'Free Trial',
  'subscription.freeUser': 'Free User',
  'subscription.premiumUser': 'Premium User',
  'subscription.premiumFamily': 'Premium Family',
  'subscription.businessUser': 'Business User',
  'subscription.trialPeriod': 'Trial Period',
  'subscription.freeForever': 'Free Forever',
  'subscription.casualUse': 'Casual Use',
  'subscription.regularUse': 'Regular Use',
  'subscription.idealForFamilies': 'Ideal for Families',
  'subscription.unlimitedUsage': 'Unlimited Usage',
  'subscription.testPremiumFeatures': 'Test Premium Features',
  'subscription.stayFree': 'Stay Free',
  'subscription.currentPlan': 'Current Plan',
  'subscription.oneDevice': '1 device',
  'subscription.fourDevices': '4 devices',
  'subscription.unlimitedDevices': 'Unlimited devices',
  'subscription.documentsPerDay': 'documents per day',
  'subscription.documentsPerMonth': 'documents per month',
  'subscription.unlimitedDocuments': 'Unlimited documents',
  'subscription.startFreeTrial7Days': 'Start 7-day free trial',
  'subscription.monthsInclusive': 'months inclusive',
  'subscription.save': 'Save',
  'subscription.premiumPlan': 'Premium Plan',
  'subscription.familyPlan': 'Family Plan',
  'subscription.businessPlan': 'Business Plan',
  'subscription.premiumMonthly': 'Premium Monthly',
  'subscription.premiumYearly': 'Premium Yearly',
  'subscription.familyMonthly': 'Family Monthly',
  'subscription.familyYearly': 'Family Yearly',
  'subscription.businessMonthly': 'Business Monthly',
  'subscription.cancelAndStayFree': 'Cancel and Stay Free',
  'subscription.perMonth': 'per month',
  'subscription.perYear': 'per year',
  'subscription.unlimited': 'Unlimited',
  'subscription.subscriptionSuccessful': 'Successfully subscribed!',
  'subscription.familyPlanSuccessful': 'Family Plan successfully subscribed!',
  'subscription.businessPlanSuccessful': 'Business Plan successfully subscribed!',
  'subscription.subscriptionFailed': 'Subscription failed',
  'subscription.subscriptionCancelledMessage': 'Your subscription has been cancelled. You can continue using premium features until the end of your current billing period.',
  'subscription.confirmSubscription': 'Confirm Subscription',
  'subscription.confirmSubscriptionMessage': 'Are you sure you want to subscribe to the {plan} premium plan?',
  'subscription.subscribeButton': 'Subscribe',
  'subscription.familyDashboard': 'Family Dashboard',
  'subscription.teamManagement': 'Team Management',
  'subscription.apiAccess': 'API Access',
  'subscription.prioritySupport': 'Priority Support',
  'subscription.savePercent': 'Save {percent}%',
  'subscription.onlyEuroPerMonth': 'Only €{price}/month',
  'subscription.freeTrialStarted': 'Free Trial Started',
  'subscription.freeTrialStartedMessage': 'You have successfully started your 7-day free trial of premium features!',
  'subscription.subscriptionReactivated': 'Subscription Reactivated',
  'subscription.subscriptionReactivatedMessage': 'Your subscription has been successfully reactivated.',
  'subscription.cancelSubscriptionConfirm': 'Are you sure you want to cancel your premium subscription?',
  'subscription.reactivateSubscriptionConfirm': 'Would you like to reactivate your subscription? Your billing will restart at the end of your current period.',
  'subscription.upgradeLabel': 'UPGRADE',
  'subscription.failedToLoadDetails': 'Failed to load subscription details. Please try again.',
  'subscription.tryAgain': 'Please try again',
  'subscription.subscriptionCancelled': 'Subscription Cancelled',
  'subscription.subscriptionCancelledShort': 'Your premium subscription has been cancelled.',
  'subscription.active': 'Active',
  'subscription.unknown': 'Unknown',
  'subscription.none': 'None',
  'subscription.premiumRequired': 'Premium Required',
  'subscription.upgradeForFeature': 'This feature requires a premium subscription. Would you like to upgrade?',
  
  // Language
  'language.title': 'Language',
  'language.description': 'Select your preferred language for the app interface. The app will restart to apply changes.',
  'language.info': 'Some content may still appear in English regardless of your language selection.',
  'language.selectLanguage': 'Select your preferred language',
  'language.changeNote': 'Changes will be applied immediately to the app interface.',
};

// German translations
const de: TranslationDictionary = {
  // Common
  'common.ok': 'OK',
  'common.cancel': 'Abbrechen',
  'common.save': 'Speichern',
  'common.delete': 'Löschen',
  'common.edit': 'Bearbeiten',
  'common.loading': 'Wird geladen...',
  'common.retry': 'Wiederholen',
  'common.error': 'Fehler',
  'common.success': 'Erfolgreich',
  'common.version': 'Version',
  'common.logout': 'Abmelden',
  'common.and': 'und',
  'common.annually': 'Jährlich',
  
  // Dashboard
  'dashboard.title': 'Dashboard',
  'dashboard.welcome': 'Willkommen',
  'dashboard.upload': 'Hochladen',
  'dashboard.history': 'Verlauf',
  'dashboard.profile': 'Profil',
  'dashboard.recentDocuments': 'Letzte Dokumente',
  'dashboard.viewAll': 'Alle Dokumente anzeigen',
  'dashboard.noDocuments': 'Noch keine Dokumente',
  'dashboard.uploadFirst': 'Laden Sie Ihr erstes Dokument hoch, um zu beginnen',
  'dashboard.documentsRemaining': 'Dokumente verbleibend',
  'dashboard.upgrade': 'Upgrade',
  'dashboard.reactivate': 'Reaktivieren',
  
  // Upload
  'upload.title': 'Dokument hochladen',
  'upload.selectImage': 'Bild auswählen',
  'upload.takePhoto': 'Foto aufnehmen',
  'upload.processing': 'Wird verarbeitet...',
  'upload.success': 'Dokument erfolgreich hochgeladen',
  'upload.error': 'Fehler beim Hochladen des Dokuments',
  'upload.permissionRequired': 'Berechtigung erforderlich',
  'upload.cameraPermission': 'Kamera-Berechtigung ist erforderlich, um Fotos aufzunehmen',
  'upload.successMessage': 'Ihr Dokument wurde hochgeladen und wird verarbeitet',
  'upload.errorMessage': 'Beim Hochladen Ihres Dokuments ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.',
  'upload.confirm': 'Bestätigen',
  'upload.selectImageDescription': 'Wählen Sie ein Bild aus Ihrer Galerie',
  'upload.takePhotoDescription': 'Nehmen Sie ein neues Foto mit Ihrer Kamera auf',
  'upload.selectProcessingType': 'Verarbeitungstyp auswählen',
  'upload.freeOptions': 'Kostenlose Optionen',
  'upload.freeOptionsDescription': 'Verfügbar mit Ihrem kostenlosen Konto',
  'upload.premiumOptions': 'Premium-Optionen',
  'upload.premiumOptionsDescription': 'Erweiterte Funktionen für Premium-Nutzer',
  'upload.upgradeForPremiumFeatures': 'Upgraden Sie für Zugang zu Premium-Verarbeitungsfunktionen',
  'upload.selectProcessingForGallery': 'Verarbeitung für Galerie auswählen',
  'upload.selectProcessingForCamera': 'Verarbeitung für Kamera auswählen',
  
  // History
  'history.title': 'Dokumentenverlauf',
  'history.noDocuments': 'Noch keine Dokumente',
  'history.uploadFirst': 'Laden Sie Ihr erstes Dokument hoch, um zu beginnen',
  'history.loadingDocuments': 'Dokumente werden geladen...',
  'history.errorLoading': 'Fehler beim Laden der Dokumente',
  'history.status.completed': 'Abgeschlossen',
  'history.status.processing': 'Wird verarbeitet',
  'history.status.failed': 'Fehlgeschlagen',
  
  // Document View
  'docView.title': 'Dokumentenbetrachter',
  'docView.loading': 'Dokument wird geladen...',
  'docView.error': 'Fehler beim Laden des Dokuments',
  'docView.noPdf': 'Kein PDF-Dokument verfügbar',
  'docView.invalidDocument': 'Ungültige Dokument-ID',
  'docView.failedToLoad': 'Dokument konnte nicht geladen werden',
  'docView.pdfRenderError': 'PDF-Dokument konnte nicht dargestellt werden',
  'docView.sharingFailed': 'Teilen fehlgeschlagen',
  
  // Profile
  'profile.title': 'Profil',
  'profile.editProfile': 'Profil bearbeiten',
  'profile.notifications': 'Benachrichtigungen',
  'profile.security': 'Sicherheit',
  'profile.helpSupport': 'Hilfe & Support',
  'profile.appearance': 'Erscheinungsbild',
  'profile.language': 'Sprache',
  'profile.logout': 'Abmelden',
  'profile.account': 'Konto',
  'profile.preferences': 'Einstellungen',
  'profile.loadingProfile': 'Profil wird geladen...',
  'profile.errorProfile': 'Fehler beim Laden des Profils',
  'profile.settings': 'Einstellungen',
  'profile.darkMode': 'Dunkler Modus',
  'profile.changePassword': 'Passwort ändern',
  'profile.privacyPolicy': 'Datenschutzrichtlinie',
  'profile.termsOfService': 'Nutzungsbedingungen',
  'profile.logoutTitle': 'Abmelden',
  'profile.logoutConfirm': 'Sind Sie sicher, dass Sie sich abmelden möchten?',
  'profile.selectTheme': 'Design auswählen',
  'profile.systemDefault': 'Systemstandard',
  'profile.lightMode': 'Heller Modus',
  'profile.themeChangeNote': 'Änderungen werden sofort auf die App-Oberfläche angewendet.',
  'profile.firstName': 'Vorname',
  'profile.lastName': 'Nachname',
  'profile.email': 'E-Mail',
  'profile.allFieldsRequired': 'Bitte füllen Sie alle Felder aus',
  'profile.profileUpdated': 'Profil erfolgreich aktualisiert',
  'profile.updateFailed': 'Profil konnte nicht aktualisiert werden',
  'profile.currentPassword': 'Aktuelles Passwort',
  'profile.newPassword': 'Neues Passwort',
  'profile.confirmPassword': 'Passwort bestätigen',
  'profile.passwordsDoNotMatch': 'Passwörter stimmen nicht überein',
  'profile.passwordTooShort': 'Passwort muss mindestens 6 Zeichen lang sein',
  'profile.passwordChanged': 'Passwort erfolgreich geändert',
  'profile.passwordChangeFailed': 'Passwort konnte nicht geändert werden',
  'profile.passwordRequirements': 'Passwort erfüllt nicht die Anforderungen',
  'profile.minLength': 'Mindestens 6 Zeichen',
  'profile.hasLetter': 'Enthält mindestens einen Buchstaben',
  'profile.hasNumber': 'Enthält mindestens eine Zahl',
  'profile.passwordsMatch': 'Passwörter stimmen überein',
  'profile.nameFieldsRequired': 'Bitte Vor- und Nachname ausfüllen',
  'profile.enterFirstName': 'Vorname eingeben',
  'profile.enterLastName': 'Nachname eingeben',
  'profile.emailCannotBeChanged': 'E-Mail-Adresse kann nicht geändert werden',
  'subscription.title': 'Abonnement',
  'subscription.plan': 'Plan',
  'subscription.billing': 'Abrechnung',
  'subscription.trialEnds': 'Testversion endet',
  'subscription.nextBilling': 'Nächste Abrechnung',
  'subscription.documents': 'Dokumente',
  'subscription.resetsOn': 'Wird zurückgesetzt am',
  'subscription.startFreeTrial': 'Kostenlose Testversion starten',
  'subscription.subscribeMontly': 'Monatlich abonnieren',
  'subscription.subscribeYearly': 'Jährlich abonnieren',
  'subscription.cancelTrial': 'Testversion kündigen',
  'subscription.cancelSubscription': 'Abonnement kündigen',
  'subscription.cancel': 'Kündigen',
  'subscription.changePlan': 'Plan ändern',
  'subscription.current': 'Aktuell',
  'subscription.switchToMonthly': 'Zu monatlich wechseln',
  'subscription.switchToYearly': 'Zu jährlich wechseln',
  'subscription.reactivate': 'Reaktivieren',
  'subscription.restore': 'Wiederherstellen',
  'subscription.subscriptionEnding': 'Abonnement läuft ab',
  'subscription.limitReached': 'Limit erreicht',
  'subscription.free': 'Kostenlos',
  'subscription.premium': 'Premium',
  'subscription.trial': 'Testversion',
  'subscription.monthly': 'Monatlich',
  'subscription.yearly': 'Jährlich',
  'subscription.documentsRemaining': 'verbleibende Dokumente',
  'subscription.trialDescription': '7 Tage kostenlose Premium-Funktionen testen',
  'subscription.monthlyDescription': 'Monatliche Premium-Funktionen',
  'subscription.yearlyDescription': 'Jährliche Premium-Funktionen mit Ersparnis',
  'subscription.freeDescription': 'Grundlegende Funktionen, für immer kostenlos',
  'subscription.feature.documents': 'Dokumente pro Tag',
  'subscription.feature.documentsWeekly': 'Dokumente pro Woche',
  'subscription.feature.priority': 'Prioritätssupport',
  'subscription.feature.standard': 'Standard-Support',
  'subscription.feature.cancel': 'Jederzeit kündbar',
  'subscription.feature.savings': 'Ersparnis gegenüber monatlich',
  'subscription.feature.premium': 'Alle Premium-Funktionen',
  'subscription.chooseYourPlan': 'Wählen Sie Ihren Plan',
  'subscription.recommended': 'Empfohlen',
  'subscription.managePlan': 'Plan verwalten',
  'subscription.accessUntil': 'Zugang bis',
  'subscription.days7': '7 Tage',
  'subscription.continueFree': 'Kostenlos fortfahren',
  'subscription.freeTrial': 'Kostenlose Testversion',
  'subscription.freeUser': 'Kostenloser Nutzer',
  'subscription.premiumUser': 'Premium-Nutzer',
  'subscription.premiumFamily': 'Premium Familie',
  'subscription.businessUser': 'Business-Nutzer',
  'subscription.trialPeriod': 'Testphase',
  'subscription.freeForever': 'Für immer kostenlos',
  'subscription.casualUse': 'Gelegentliche Nutzung',
  'subscription.regularUse': 'Regelmäßige Nutzung',
  'subscription.idealForFamilies': 'Ideal für Familien',
  'subscription.unlimitedUsage': 'Unbegrenzte Nutzung',
  'subscription.testPremiumFeatures': 'Premium-Funktionen testen',
  'subscription.stayFree': 'Kostenlos bleiben',
  'subscription.currentPlan': 'Aktueller Plan',
  'subscription.oneDevice': '1 Gerät',
  'subscription.fourDevices': '4 Geräte',
  'subscription.unlimitedDevices': 'Unbegrenzte Geräte',
  'subscription.documentsPerDay': 'Dokumente pro Tag',
  'subscription.documentsPerMonth': 'Dokumente pro Monat',
  'subscription.unlimitedDocuments': 'Unbegrenzte Dokumente',
  'subscription.startFreeTrial7Days': '7-tägige kostenlose Testversion starten',
  'subscription.monthsInclusive': 'Monate inklusive',
  'subscription.save': 'Sparen',
  'subscription.premiumPlan': 'Premium-Plan',
  'subscription.familyPlan': 'Familien-Plan',
  'subscription.businessPlan': 'Business-Plan',
  'subscription.premiumMonthly': 'Premium Monatlich',
  'subscription.premiumYearly': 'Premium Jährlich',
  'subscription.familyMonthly': 'Familie Monatlich',
  'subscription.familyYearly': 'Familie Jährlich',
  'subscription.businessMonthly': 'Business Monatlich',
  'subscription.cancelAndStayFree': 'Kündigen und kostenlos bleiben',
  'subscription.perMonth': 'pro Monat',
  'subscription.perYear': 'pro Jahr',
  'subscription.unlimited': 'Unbegrenzt',
  'subscription.subscriptionSuccessful': 'Erfolgreich abonniert!',
  'subscription.familyPlanSuccessful': 'Familien-Plan erfolgreich abonniert!',
  'subscription.businessPlanSuccessful': 'Business-Plan erfolgreich abonniert!',
  'subscription.subscriptionFailed': 'Abonnement fehlgeschlagen',
  'subscription.subscriptionCancelledMessage': 'Ihr Abonnement wurde gekündigt. Sie können Premium-Funktionen bis zum Ende Ihres aktuellen Abrechnungszeitraums weiter nutzen.',
  'subscription.confirmSubscription': 'Abonnement bestätigen',
  'subscription.confirmSubscriptionMessage': 'Sind Sie sicher, dass Sie den {plan} Premium-Plan abonnieren möchten?',
  'subscription.subscribeButton': 'Abonnieren',
  'subscription.familyDashboard': 'Familien-Dashboard',
  'subscription.teamManagement': 'Team-Verwaltung',
  'subscription.apiAccess': 'API-Zugang',
  'subscription.prioritySupport': 'Prioritätssupport',
  'subscription.savePercent': '{percent}% sparen',
  'subscription.onlyEuroPerMonth': 'Nur €{price}/Monat',
  'subscription.freeTrialStarted': 'Kostenlose Testversion gestartet',
  'subscription.freeTrialStartedMessage': 'Sie haben erfolgreich Ihre 7-tägige kostenlose Testversion der Premium-Funktionen gestartet!',
  'subscription.subscriptionReactivated': 'Abonnement reaktiviert',
  'subscription.subscriptionReactivatedMessage': 'Ihr Abonnement wurde erfolgreich reaktiviert.',
  'subscription.cancelSubscriptionConfirm': 'Sind Sie sicher, dass Sie Ihr Premium-Abonnement kündigen möchten?',
  'subscription.reactivateSubscriptionConfirm': 'Möchten Sie Ihr Abonnement reaktivieren? Ihre Abrechnung startet am Ende Ihres aktuellen Zeitraums neu.',
  'subscription.upgradeLabel': 'UPGRADE',
  'subscription.failedToLoadDetails': 'Fehler beim Laden der Abonnement-Details. Bitte versuchen Sie es erneut.',
  'subscription.tryAgain': 'Bitte versuchen Sie es erneut',
  'subscription.subscriptionCancelled': 'Abonnement gekündigt',
  'subscription.subscriptionCancelledShort': 'Ihr Premium-Abonnement wurde gekündigt.',
  'subscription.active': 'Aktiv',
  'subscription.unknown': 'Unbekannt',
  'subscription.none': 'Keine',
  'subscription.premiumRequired': 'Premium erforderlich',
  'subscription.upgradeForFeature': 'Diese Funktion erfordert ein Premium-Abonnement. Möchten Sie upgraden?',
  
  // Language
  'language.title': 'Sprache',
  'language.description': 'Wählen Sie Ihre bevorzugte Sprache für die App-Oberfläche. Die App wird neu gestartet, um die Änderungen anzuwenden.',
  'language.info': 'Einige Inhalte können unabhängig von Ihrer Sprachauswahl weiterhin auf Englisch angezeigt werden.',
  'language.selectLanguage': 'Wählen Sie Ihre bevorzugte Sprache',
  'language.changeNote': 'Änderungen werden sofort auf die App-Oberfläche angewendet.',
};

// Spanish translations
const es: TranslationDictionary = {
  // Common
  'common.ok': 'OK',
  'common.cancel': 'Cancelar',
  'common.save': 'Guardar',
  'common.delete': 'Eliminar',
  'common.edit': 'Editar',
  'common.loading': 'Cargando...',
  'common.retry': 'Reintentar',
  'common.error': 'Error',
  'common.success': 'Éxito',
  'common.version': 'Versión',
  'common.logout': 'Cerrar sesión',
  'common.and': 'y',
  'common.annually': 'Anualmente',
  
  // Dashboard
  'dashboard.title': 'Tablero',
  'dashboard.welcome': 'Bienvenido',
  'dashboard.upload': 'Subir',
  'dashboard.history': 'Historial',
  'dashboard.profile': 'Perfil',
  'dashboard.recentDocuments': 'Documentos recientes',
  'dashboard.viewAll': 'Ver todos los documentos',
  'dashboard.noDocuments': 'Aún no hay documentos',
  'dashboard.uploadFirst': 'Sube tu primer documento para comenzar',
  'dashboard.documentsRemaining': 'documentos restantes',
  'dashboard.upgrade': 'Actualizar',
  'dashboard.reactivate': 'Reactivar',
  
  // Upload
  'upload.title': 'Subir documento',
  'upload.selectImage': 'Seleccionar imagen',
  'upload.takePhoto': 'Tomar foto',
  'upload.processing': 'Procesando...',
  'upload.success': 'Documento subido exitosamente',
  'upload.error': 'Error al subir el documento',
  'upload.permissionRequired': 'Permiso requerido',
  'upload.cameraPermission': 'Se requiere permiso de cámara para tomar fotos',
  'upload.successMessage': 'Tu documento ha sido subido y está siendo procesado',
  'upload.errorMessage': 'Ocurrió un error al subir tu documento. Por favor intenta de nuevo.',
  'upload.confirm': 'Confirmar',
  'upload.selectImageDescription': 'Elige una imagen de tu galería',
  'upload.takePhotoDescription': 'Toma una nueva foto con tu cámara',
  'upload.selectProcessingType': 'Seleccionar tipo de procesamiento',
  'upload.freeOptions': 'Opciones gratuitas',
  'upload.freeOptionsDescription': 'Disponible con tu cuenta gratuita',
  'upload.premiumOptions': 'Opciones premium',
  'upload.premiumOptionsDescription': 'Funciones avanzadas para usuarios premium',
  'upload.upgradeForPremiumFeatures': 'Actualiza para acceder a funciones de procesamiento premium',
  'upload.selectProcessingForGallery': 'Seleccionar procesamiento para galería',
  'upload.selectProcessingForCamera': 'Seleccionar procesamiento para cámara',
  
  // History
  'history.title': 'Historial de documentos',
  'history.noDocuments': 'Aún no hay documentos',
  'history.uploadFirst': 'Sube tu primer documento para comenzar',
  'history.loadingDocuments': 'Cargando documentos...',
  'history.errorLoading': 'Error al cargar documentos',
  'history.status.completed': 'Completado',
  'history.status.processing': 'Procesando',
  'history.status.failed': 'Falló',
  
  // Document View
  'docView.title': 'Visor de documentos',
  'docView.loading': 'Cargando documento...',
  'docView.error': 'Error al cargar el documento',
  'docView.noPdf': 'No hay documento PDF disponible',
  'docView.invalidDocument': 'ID de documento inválido',
  'docView.failedToLoad': 'Error al cargar el documento',
  'docView.pdfRenderError': 'Error al renderizar el documento PDF',
  'docView.sharingFailed': 'Error al compartir',
  
  // Profile
  'profile.title': 'Perfil',
  'profile.editProfile': 'Editar perfil',
  'profile.notifications': 'Notificaciones',
  'profile.security': 'Seguridad',
  'profile.helpSupport': 'Ayuda y soporte',
  'profile.appearance': 'Apariencia',
  'profile.language': 'Idioma',
  'profile.logout': 'Cerrar sesión',
  'profile.account': 'Cuenta',
  'profile.preferences': 'Preferencias',
  'profile.loadingProfile': 'Cargando perfil...',
  'profile.errorProfile': 'Error al cargar el perfil',
  'profile.settings': 'Configuración',
  'profile.darkMode': 'Modo oscuro',
  'profile.changePassword': 'Cambiar contraseña',
  'profile.privacyPolicy': 'Política de privacidad',
  'profile.termsOfService': 'Términos de servicio',
  'profile.logoutTitle': 'Cerrar sesión',
  'profile.logoutConfirm': '¿Estás seguro de que quieres cerrar sesión?',
  'profile.selectTheme': 'Seleccionar tema',
  'profile.systemDefault': 'Predeterminado del sistema',
  'profile.lightMode': 'Modo claro',
  'profile.themeChangeNote': 'Los cambios se aplicarán inmediatamente a la interfaz de la aplicación.',
  'profile.firstName': 'Nombre',
  'profile.lastName': 'Apellido',
  'profile.email': 'Correo electrónico',
  'profile.allFieldsRequired': 'Por favor completa todos los campos',
  'profile.profileUpdated': 'Perfil actualizado exitosamente',
  'profile.updateFailed': 'Error al actualizar el perfil',
  'profile.currentPassword': 'Contraseña actual',
  'profile.newPassword': 'Nueva contraseña',
  'profile.confirmPassword': 'Confirmar contraseña',
  'profile.passwordsDoNotMatch': 'Las contraseñas no coinciden',
  'profile.passwordTooShort': 'La contraseña debe tener al menos 6 caracteres',
  'profile.passwordChanged': 'Contraseña cambiada exitosamente',
  'profile.passwordChangeFailed': 'Error al cambiar la contraseña',
  'profile.passwordRequirements': 'La contraseña no cumple los requisitos',
  'profile.minLength': 'Al menos 6 caracteres',
  'profile.hasLetter': 'Contiene al menos una letra',
  'profile.hasNumber': 'Contiene al menos un número',
  'profile.passwordsMatch': 'Las contraseñas coinciden',
  'profile.nameFieldsRequired': 'Por favor completa el nombre y apellido',
  'profile.enterFirstName': 'Ingresa tu nombre',
  'profile.enterLastName': 'Ingresa tu apellido',
  'profile.emailCannotBeChanged': 'La dirección de correo no se puede cambiar',
  'subscription.title': 'Suscripción',
  'subscription.plan': 'Plan',
  'subscription.billing': 'Facturación',
  'subscription.trialEnds': 'Periodo de prueba termina',
  'subscription.nextBilling': 'Próxima facturación',
  'subscription.documents': 'Documentos',
  'subscription.resetsOn': 'Se reinicia el',
  'subscription.startFreeTrial': 'Iniciar periodo de prueba gratuito',
  'subscription.subscribeMontly': 'Suscribirse mensualmente',
  'subscription.subscribeYearly': 'Suscribirse anualmente',
  'subscription.cancelTrial': 'Cancelar periodo de prueba',
  'subscription.cancelSubscription': 'Cancelar suscripción',
  'subscription.cancel': 'Cancelar',
  'subscription.changePlan': 'Cambiar plan',
  'subscription.current': 'Actual',
  'subscription.switchToMonthly': 'Cambiar a mensual',
  'subscription.switchToYearly': 'Cambiar a anual',
  'subscription.reactivate': 'Reactivar',
  'subscription.restore': 'Restaurar',
  'subscription.subscriptionEnding': 'Suscripción terminando',
  'subscription.limitReached': 'Límite alcanzado',
  'subscription.free': 'Gratis',
  'subscription.premium': 'Premium',
  'subscription.trial': 'Periodo de prueba',
  'subscription.monthly': 'Mensual',
  'subscription.yearly': 'Anual',
  'subscription.documentsRemaining': 'documentos restantes',
  'subscription.trialDescription': 'Prueba 7 días de funciones premium gratis',
  'subscription.monthlyDescription': 'Funciones premium mensuales',
  'subscription.yearlyDescription': 'Funciones premium anuales con ahorro',
  'subscription.freeDescription': 'Funciones básicas, gratis para siempre',
  'subscription.feature.documents': 'Documentos por día',
  'subscription.feature.documentsWeekly': 'Documentos por semana',
  'subscription.feature.priority': 'Soporte prioritario',
  'subscription.feature.standard': 'Soporte estándar',
  'subscription.feature.cancel': 'Cancelar en cualquier momento',
  'subscription.feature.savings': 'Ahorro vs mensual',
  'subscription.feature.premium': 'Todas las funciones premium',
  'subscription.chooseYourPlan': 'Elige tu plan',
  'subscription.recommended': 'Recomendado',
  'subscription.managePlan': 'Gestionar plan',
  'subscription.accessUntil': 'Acceso hasta',
  'subscription.days7': '7 días',
  'subscription.continueFree': 'Continuar gratis',
  'subscription.freeTrial': 'Periodo de prueba gratuito',
  'subscription.freeUser': 'Usuario gratuito',
  'subscription.premiumUser': 'Usuario premium',
  'subscription.premiumFamily': 'Familia Premium',
  'subscription.businessUser': 'Usuario business',
  'subscription.trialPeriod': 'Período de prueba',
  'subscription.freeForever': 'Gratis para siempre',
  'subscription.casualUse': 'Uso ocasional',
  'subscription.regularUse': 'Uso regular',
  'subscription.idealForFamilies': 'Ideal para familias',
  'subscription.unlimitedUsage': 'Uso ilimitado',
  'subscription.testPremiumFeatures': 'Probar funciones premium',
  'subscription.stayFree': 'Permanecer gratis',
  'subscription.currentPlan': 'Plan actual',
  'subscription.oneDevice': '1 dispositivo',
  'subscription.fourDevices': '4 dispositivos',
  'subscription.unlimitedDevices': 'Dispositivos ilimitados',
  'subscription.documentsPerDay': 'documentos por día',
  'subscription.documentsPerMonth': 'documentos por mes',
  'subscription.unlimitedDocuments': 'Documentos ilimitados',
  'subscription.startFreeTrial7Days': 'Iniciar periodo de prueba gratuito de 7 días',
  'subscription.monthsInclusive': 'meses incluidos',
  'subscription.save': 'Ahorrar',
  'subscription.premiumPlan': 'Plan Premium',
  'subscription.familyPlan': 'Plan Familiar',
  'subscription.businessPlan': 'Plan Business',
  'subscription.premiumMonthly': 'Premium Mensual',
  'subscription.premiumYearly': 'Premium Anual',
  'subscription.familyMonthly': 'Familiar Mensual',
  'subscription.familyYearly': 'Familiar Anual',
  'subscription.businessMonthly': 'Business Mensual',
  'subscription.cancelAndStayFree': 'Cancelar y permanecer gratis',
  'subscription.perMonth': 'por mes',
  'subscription.perYear': 'por año',
  'subscription.unlimited': 'Ilimitado',
  'subscription.subscriptionSuccessful': '¡Suscripción exitosa!',
  'subscription.familyPlanSuccessful': '¡Plan Familiar suscrito exitosamente!',
  'subscription.businessPlanSuccessful': '¡Plan Business suscrito exitosamente!',
  'subscription.subscriptionFailed': 'Suscripción falló',
  'subscription.subscriptionCancelledMessage': 'Tu suscripción ha sido cancelada. Puedes continuar usando funciones premium hasta el final de tu período de facturación actual.',
  'subscription.confirmSubscription': 'Confirmar suscripción',
  'subscription.confirmSubscriptionMessage': '¿Estás seguro de que quieres suscribirte al plan premium {plan}?',
  'subscription.subscribeButton': 'Suscribirse',
  'subscription.familyDashboard': 'Dashboard familiar',
  'subscription.teamManagement': 'Gestión de equipo',
  'subscription.apiAccess': 'Acceso API',
  'subscription.prioritySupport': 'Soporte prioritario',
  'subscription.savePercent': 'Ahorrar {percent}%',
  'subscription.onlyEuroPerMonth': 'Solo €{price}/mes',
  'subscription.freeTrialStarted': 'Periodo de prueba gratuito iniciado',
  'subscription.freeTrialStartedMessage': '¡Has iniciado exitosamente tu periodo de prueba gratuito de 7 días de funciones premium!',
  'subscription.subscriptionReactivated': 'Suscripción reactivada',
  'subscription.subscriptionReactivatedMessage': 'Tu suscripción ha sido reactivada exitosamente.',
  'subscription.cancelSubscriptionConfirm': '¿Estás seguro de que quieres cancelar tu suscripción premium?',
  'subscription.reactivateSubscriptionConfirm': '¿Te gustaría reactivar tu suscripción? Tu facturación se reiniciará al final de tu período actual.',
  'subscription.upgradeLabel': 'ACTUALIZAR',
  'subscription.failedToLoadDetails': 'Error al cargar los detalles de la suscripción. Por favor, inténtelo de nuevo.',
  'subscription.tryAgain': 'Por favor, inténtelo de nuevo',
  'subscription.subscriptionCancelled': 'Suscripción Cancelada',
  'subscription.subscriptionCancelledShort': 'Tu suscripción premium ha sido cancelada.',
  'subscription.active': 'Activo',
  'subscription.unknown': 'Desconocido',
  'subscription.none': 'Ninguno',
  'subscription.premiumRequired': 'Premium requerido',
  'subscription.upgradeForFeature': 'Esta función requiere una suscripción premium. ¿Te gustaría actualizar?',
  
  // Language
  'language.title': 'Idioma',
  'language.description': 'Selecciona tu idioma preferido para la interfaz de la aplicación. La aplicación se reiniciará para aplicar los cambios.',
  'language.info': 'Algún contenido puede seguir apareciendo en inglés independientemente de tu selección de idioma.',
  'language.selectLanguage': 'Selecciona tu idioma preferido',
  'language.changeNote': 'Los cambios se aplicarán inmediatamente a la interfaz de la aplicación.',
};

// Russian translations
const ru: TranslationDictionary = {
  // Common
  'common.ok': 'ОК',
  'common.cancel': 'Отмена',
  'common.save': 'Сохранить',
  'common.delete': 'Удалить',
  'common.edit': 'Редактировать',
  'common.loading': 'Загрузка...',
  'common.retry': 'Повторить',
  'common.error': 'Ошибка',
  'common.success': 'Успех',
  'common.version': 'Версия',
  'common.logout': 'Выйти',
  'common.and': 'и',
  'common.annually': 'Ежегодно',
  
  // Dashboard
  'dashboard.title': 'Панель управления',
  'dashboard.welcome': 'Добро пожаловать',
  'dashboard.upload': 'Загрузить',
  'dashboard.history': 'История',
  'dashboard.profile': 'Профиль',
  'dashboard.recentDocuments': 'Последние документы',
  'dashboard.viewAll': 'Просмотреть все документы',
  'dashboard.noDocuments': 'Пока нет документов',
  'dashboard.uploadFirst': 'Загрузите первый документ для начала',
  'dashboard.documentsRemaining': 'документов осталось',
  'dashboard.upgrade': 'Обновить',
  'dashboard.reactivate': 'Реактивировать',
  
  // Upload
  'upload.title': 'Загрузить документ',
  'upload.selectImage': 'Выбрать изображение',
  'upload.takePhoto': 'Сделать фото',
  'upload.processing': 'Обработка...',
  'upload.success': 'Документ успешно загружен',
  'upload.error': 'Ошибка загрузки документа',
  'upload.permissionRequired': 'Требуется разрешение',
  'upload.cameraPermission': 'Требуется разрешение камеры для съемки',
  'upload.successMessage': 'Ваш документ загружен и обрабатывается',
  'upload.errorMessage': 'Произошла ошибка при загрузке документа. Попробуйте еще раз.',
  'upload.confirm': 'Подтвердить',
  'upload.selectImageDescription': 'Выберите изображение из галереи',
  'upload.takePhotoDescription': 'Сделайте новое фото камерой',
  
  // History
  'history.title': 'История документов',
  'history.noDocuments': 'Пока нет документов',
  'history.uploadFirst': 'Загрузите первый документ для начала',
  'history.loadingDocuments': 'Загрузка документов...',
  'history.errorLoading': 'Ошибка загрузки документов',
  'history.status.completed': 'Завершено',
  'history.status.processing': 'Обработка',
  'history.status.failed': 'Неудачно',
  
  // Document View
  'docView.title': 'Просмотр документа',
  'docView.loading': 'Загрузка документа...',
  'docView.error': 'Ошибка загрузки документа',
  'docView.noPdf': 'PDF документ недоступен',
  'docView.invalidDocument': 'Недействительный ID документа',
  'docView.failedToLoad': 'Не удалось загрузить документ',
  'docView.pdfRenderError': 'Не удалось отобразить PDF документ',
  'docView.sharingFailed': 'Не удалось поделиться',
  
  // Profile
  'profile.title': 'Профиль',
  'profile.editProfile': 'Редактировать профиль',
  'profile.notifications': 'Уведомления',
  'profile.security': 'Безопасность',
  'profile.helpSupport': 'Помощь и поддержка',
  'profile.appearance': 'Внешний вид',
  'profile.language': 'Язык',
  'profile.logout': 'Выйти',
  'profile.account': 'Аккаунт',
  'profile.preferences': 'Настройки',
  'profile.loadingProfile': 'Загрузка профиля...',
  'profile.errorProfile': 'Ошибка загрузки профиля',
  'profile.settings': 'Настройки',
  'profile.darkMode': 'Темная тема',
  'profile.changePassword': 'Изменить пароль',
  'profile.privacyPolicy': 'Политика конфиденциальности',
  'profile.termsOfService': 'Условия обслуживания',
  'profile.logoutTitle': 'Выйти',
  'profile.logoutConfirm': 'Вы уверены, что хотите выйти?',
  'profile.selectTheme': 'Выбрать тему',
  'profile.systemDefault': 'Системная по умолчанию',
  'profile.lightMode': 'Светлая тема',
  'profile.themeChangeNote': 'Изменения будут применены немедленно к интерфейсу приложения.',
  'profile.firstName': 'Имя',
  'profile.lastName': 'Фамилия',
  'profile.email': 'Email',
  'profile.allFieldsRequired': 'Пожалуйста, заполните все поля',
  'profile.profileUpdated': 'Профиль успешно обновлен',
  'profile.updateFailed': 'Не удалось обновить профиль',
  'profile.currentPassword': 'Текущий пароль',
  'profile.newPassword': 'Новый пароль',
  'profile.confirmPassword': 'Подтвердить пароль',
  'profile.passwordsDoNotMatch': 'Пароли не совпадают',
  'profile.passwordTooShort': 'Пароль должен содержать не менее 6 символов',
  'profile.passwordChanged': 'Пароль успешно изменен',
  'profile.passwordChangeFailed': 'Не удалось изменить пароль',
  'profile.passwordRequirements': 'Пароль не соответствует требованиям',
  'profile.minLength': 'Не менее 6 символов',
  'profile.hasLetter': 'Содержит хотя бы одну букву',
  'profile.hasNumber': 'Содержит хотя бы одну цифру',
  'profile.passwordsMatch': 'Пароли совпадают',
  'subscription.title': 'Подписка',
  'subscription.plan': 'План',
  'subscription.billing': 'Оплата',
  'subscription.trialEnds': 'Пробная версия заканчивается',
  'subscription.nextBilling': 'Следующая оплата',
  'subscription.documents': 'Документы',
  'subscription.resetsOn': 'Сбрасывается',
  'subscription.startFreeTrial': 'Начать бесплатную пробную версию',
  'subscription.subscribeMontly': 'Подписаться ежемесячно',
  'subscription.subscribeYearly': 'Подписаться ежегодно',
  'subscription.cancelTrial': 'Отменить пробную версию',
  'subscription.cancelSubscription': 'Отменить подписку',
  'subscription.cancel': 'Отменить',
  'subscription.changePlan': 'Изменить план',
  'subscription.current': 'Текущий',
  'subscription.switchToMonthly': 'Переключиться на ежемесячную',
  'subscription.switchToYearly': 'Переключиться на ежегодную',
  'subscription.reactivate': 'Реактивировать',
  'subscription.restore': 'Восстановить покупки',
  'subscription.subscriptionEnding': 'Ваша премиум-подписка скоро закончится',
  'subscription.limitReached': 'Вы достигли лимита документов',
  'subscription.free': 'Бесплатно',
  'subscription.premium': 'Премиум',
  'subscription.trial': 'Пробная версия',
  'subscription.monthly': 'Ежемесячно',
  'subscription.yearly': 'Ежегодно',
  'subscription.documentsRemaining': 'документов осталось',
  'subscription.trialDescription': 'Попробуйте все премиум-функции в течение 7 дней',
  'subscription.monthlyDescription': 'Для регулярного использования со всеми функциями',
  'subscription.yearlyDescription': 'Лучшее предложение с 2 бесплатными месяцами',
  'subscription.freeDescription': 'Для периодического использования',
  'subscription.feature.documents': '1 документ в день',
  'subscription.feature.documentsWeekly': '7 документов в неделю',
  'subscription.feature.priority': 'Приоритетная обработка',
  'subscription.feature.standard': 'Стандартная обработка',
  'subscription.feature.cancel': 'Отмена в любое время',
  'subscription.feature.savings': 'Экономия 17%',
  'subscription.feature.premium': 'Все премиум-функции',
  'subscription.chooseYourPlan': 'Выберите ваш план',
  'subscription.recommended': 'Рекомендуется',
  'subscription.managePlan': 'Управление планом',
  'subscription.accessUntil': 'Доступ до',
  'subscription.days7': '7 дней',
  'subscription.continueFree': 'Продолжить бесплатно',
  'subscription.freeTrial': 'Бесплатная пробная версия',
  'subscription.freeUser': 'Бесплатный пользователь',
  'subscription.premiumUser': 'Премиум пользователь',
  'subscription.premiumFamily': 'Премиум Семья',
  'subscription.businessUser': 'Бизнес пользователь',
  'subscription.trialPeriod': 'Пробный период',
  'subscription.freeForever': 'Бесплатно навсегда',
  'subscription.casualUse': 'Эпизодическое использование',
  'subscription.regularUse': 'Регулярное использование',
  'subscription.idealForFamilies': 'Идеально для семей',
  'subscription.unlimitedUsage': 'Неограниченное использование',
  'subscription.testPremiumFeatures': 'Тестирование премиум-функций',
  'subscription.stayFree': 'Остаться бесплатным',
  'subscription.currentPlan': 'Текущий план',
  'subscription.oneDevice': '1 устройство',
  'subscription.fourDevices': '4 устройства',
  'subscription.unlimitedDevices': 'Неограниченные устройства',
  'subscription.documentsPerDay': 'документов в день',
  'subscription.documentsPerMonth': 'документов в месяц',
  'subscription.unlimitedDocuments': 'Неограниченные документы',
  'subscription.startFreeTrial7Days': 'Начать 7-дневную бесплатную пробную версию',
  'subscription.monthsInclusive': 'месяцев включено',
  'subscription.save': 'Сэкономить',
  'subscription.premiumPlan': 'Премиум план',
  'subscription.familyPlan': 'Семейный план',
  'subscription.businessPlan': 'Бизнес план',
  'subscription.premiumMonthly': 'Премиум ежемесячно',
  'subscription.premiumYearly': 'Премиум ежегодно',
  'subscription.familyMonthly': 'Семейный ежемесячно',
  'subscription.familyYearly': 'Семейный ежегодно',
  'subscription.businessMonthly': 'Бизнес ежемесячно',
  'subscription.cancelAndStayFree': 'Отменить и остаться бесплатным',
  'subscription.perMonth': 'в месяц',
  'subscription.perYear': 'в год',
  'subscription.unlimited': 'Неограниченно',
  'subscription.subscriptionSuccessful': 'Успешно подписались!',
  'subscription.familyPlanSuccessful': 'Семейный план успешно оформлен!',
  'subscription.businessPlanSuccessful': 'Бизнес план успешно оформлен!',
  'subscription.subscriptionFailed': 'Ошибка подписки',
  'subscription.subscriptionCancelledMessage': 'Ваша подписка была отменена. Вы можете продолжать использовать премиум-функции до окончания текущего периода оплаты.',
  'subscription.confirmSubscription': 'Подтвердить подписку',
  'subscription.confirmSubscriptionMessage': 'Вы уверены, что хотите подписаться на премиум план {plan}?',
  'subscription.subscribeButton': 'Подписаться',
  'subscription.familyDashboard': 'Семейная панель',
  'subscription.teamManagement': 'Управление командой',
  'subscription.apiAccess': 'Доступ к API',
  'subscription.prioritySupport': 'Приоритетная поддержка',
  'subscription.savePercent': 'Сэкономить {percent}%',
  'subscription.onlyEuroPerMonth': 'Всего €{price}/месяц',
  'subscription.freeTrialStarted': 'Бесплатная пробная версия начата',
  'subscription.freeTrialStartedMessage': 'Вы успешно начали 7-дневную бесплатную пробную версию премиум-функций!',
  'subscription.subscriptionReactivated': 'Подписка реактивирована',
  'subscription.subscriptionReactivatedMessage': 'Ваша подписка была успешно реактивирована.',
  'subscription.cancelSubscriptionConfirm': 'Вы уверены, что хотите отменить премиум-подписку?',
  'subscription.reactivateSubscriptionConfirm': 'Хотите реактивировать подписку? Оплата возобновится в конце текущего периода.',
  'subscription.active': 'Активный',
  'subscription.unknown': 'Неизвестно',
  'subscription.none': 'Нет',
  'subscription.upgradeLabel': 'ОБНОВИТЬ',
  'subscription.failedToLoadDetails': 'Не удалось загрузить данные подписки. Пожалуйста, попробуйте еще раз.',
  'subscription.tryAgain': 'Пожалуйста, попробуйте еще раз',
  'subscription.subscriptionCancelled': 'Подписка отменена',
  'subscription.subscriptionCancelledShort': 'Ваша премиум-подписка была отменена.',
  
  // Language
  'language.title': 'Язык',
  'language.description': 'Выберите предпочитаемый язык для интерфейса приложения. Приложение перезапустится для применения изменений.',
  'language.info': 'Некоторый контент может по-прежнему отображаться на английском языке независимо от выбранного языка.',
  'language.selectLanguage': 'Выберите предпочитаемый язык',
  'language.changeNote': 'Изменения будут применены немедленно к интерфейсу приложения.',
};

// Turkish translations
const tr: TranslationDictionary = {
  // Common
  'common.ok': 'Tamam',
  'common.cancel': 'İptal',
  'common.save': 'Kaydet',
  'common.delete': 'Sil',
  'common.edit': 'Düzenle',
  'common.loading': 'Yükleniyor...',
  'common.retry': 'Tekrar dene',
  'common.error': 'Hata',
  'common.success': 'Başarılı',
  'common.version': 'Sürüm',
  'common.logout': 'Çıkış yap',
  'common.and': 've',
  'common.annually': 'Yıllık',
  
  // Dashboard
  'dashboard.title': 'Ana Panel',
  'dashboard.welcome': 'Hoş geldiniz',
  'dashboard.upload': 'Yükle',
  'dashboard.history': 'Geçmiş',
  'dashboard.profile': 'Profil',
  'dashboard.recentDocuments': 'Son Belgeler',
  'dashboard.viewAll': 'Tüm Belgeleri Görüntüle',
  'dashboard.noDocuments': 'Henüz belge yok',
  'dashboard.uploadFirst': 'Başlamak için ilk belgenizi yükleyin',
  'dashboard.documentsRemaining': 'belge kaldı',
  'dashboard.upgrade': 'Yükselt',
  'dashboard.reactivate': 'Yeniden aktifleştir',
  
  // Upload
  'upload.title': 'Belge Yükle',
  'upload.selectImage': 'Resim Seç',
  'upload.takePhoto': 'Fotoğraf Çek',
  'upload.processing': 'İşleniyor...',
  'upload.success': 'Belge başarıyla yüklendi',
  'upload.error': 'Belge yükleme hatası',
  'upload.permissionRequired': 'İzin Gerekli',
  'upload.cameraPermission': 'Fotoğraf çekmek için kamera izni gerekli',
  'upload.successMessage': 'Belgeniz yüklendi ve işleniyor',
  'upload.errorMessage': 'Belgenizi yüklerken bir hata oluştu. Lütfen tekrar deneyin.',
  'upload.confirm': 'Onayla',
  'upload.selectImageDescription': 'Galerinizden bir resim seçin',
  'upload.takePhotoDescription': 'Kameranızla yeni bir fotoğraf çekin',
  'upload.selectProcessingType': 'İşlem Tipi Seç',
  'upload.freeOptions': 'Ücretsiz Seçenekler',
  'upload.freeOptionsDescription': 'Ücretsiz hesap için mevcut seçenekler',
  'upload.premiumOptions': 'Premium Seçenekler',
  'upload.premiumOptionsDescription': 'Premium kullanıcılar için gelişmiş özellikler',
  'upload.upgradeForPremiumFeatures': 'Premium özellikleri kullanmak için ücretli hizmete yükselt',
  'upload.selectProcessingForGallery': 'Galeri için işlem tipi seç',
  'upload.selectProcessingForCamera': 'Kamera için işlem tipi seç',
  
  // History
  'history.title': 'Belge Geçmişi',
  'history.noDocuments': 'Henüz belge yok',
  'history.uploadFirst': 'Başlamak için ilk belgenizi yükleyin',
  'history.loadingDocuments': 'Belgeler yükleniyor...',
  'history.errorLoading': 'Belge yükleme hatası',
  'history.status.completed': 'Tamamlandı',
  'history.status.processing': 'İşleniyor',
  'history.status.failed': 'Başarısız',
  
  // Document View
  'docView.title': 'Belge Görüntüleyici',
  'docView.loading': 'Belge yükleniyor...',
  'docView.error': 'Belge yükleme hatası',
  'docView.noPdf': 'PDF belgesi mevcut değil',
  'docView.invalidDocument': 'Geçersiz belge ID\'si',
  'docView.failedToLoad': 'Belge yüklenemedi',
  'docView.pdfRenderError': 'PDF belgesi görüntülenemedi',
  'docView.sharingFailed': 'Paylaşım başarısız',
  
  // Profile
  'profile.title': 'Profil',
  'profile.editProfile': 'Profili Düzenle',
  'profile.notifications': 'Bildirimler',
  'profile.security': 'Güvenlik',
  'profile.helpSupport': 'Yardım ve Destek',
  'profile.appearance': 'Görünüm',
  'profile.language': 'Dil',
  'profile.logout': 'Çıkış yap',
  'profile.account': 'Hesap',
  'profile.preferences': 'Tercihler',
  'profile.loadingProfile': 'Profil yükleniyor...',
  'profile.errorProfile': 'Profil yükleme hatası',
  'profile.settings': 'Ayarlar',
  'profile.darkMode': 'Karanlık Mod',
  'profile.changePassword': 'Şifre Değiştir',
  'profile.privacyPolicy': 'Gizlilik Politikası',
  'profile.termsOfService': 'Hizmet Şartları',
  'profile.logoutTitle': 'Çıkış yap',
  'profile.logoutConfirm': 'Çıkış yapmak istediğinizden emin misiniz?',
  'profile.selectTheme': 'Tema Seç',
  'profile.systemDefault': 'Sistem Varsayılanı',
  'profile.lightMode': 'Açık Mod',
  'profile.themeChangeNote': 'Değişiklikler uygulama arayüzüne hemen uygulanacak.',
  'profile.firstName': 'Ad',
  'profile.lastName': 'Soyad',
  'profile.email': 'E-posta',
  'profile.allFieldsRequired': 'Lütfen tüm alanları doldurun',
  'profile.profileUpdated': 'Profil başarıyla güncellendi',
  'profile.updateFailed': 'Profil güncellenemedi',
  'profile.currentPassword': 'Mevcut Şifre',
  'profile.newPassword': 'Yeni Şifre',
  'profile.confirmPassword': 'Şifreyi Onayla',
  'profile.passwordsDoNotMatch': 'Şifreler eşleşmiyor',
  'profile.passwordTooShort': 'Şifre en az 6 karakter olmalı',
  'profile.passwordChanged': 'Şifre başarıyla değiştirildi',
  'profile.passwordChangeFailed': 'Şifre değiştirilemedi',
  'profile.passwordRequirements': 'Şifre gereksinimleri karşılanmıyor',
  'profile.minLength': 'En az 6 karakter',
  'profile.hasLetter': 'En az bir harf içerir',
  'profile.hasNumber': 'En az bir sayı içerir',
  'profile.passwordsMatch': 'Şifreler eşleşiyor',
  'subscription.title': 'Abonelik',
  'subscription.plan': 'Plan',
  'subscription.billing': 'Faturalandırma',
  'subscription.trialEnds': 'Deneme bitiyor',
  'subscription.nextBilling': 'Sonraki faturalandırma',
  'subscription.documents': 'Belgeler',
  'subscription.resetsOn': 'Sıfırlanma tarihi',
  'subscription.startFreeTrial': 'Ücretsiz Deneme Başlat',
  'subscription.subscribeMontly': 'Aylık Abone Ol',
  'subscription.subscribeYearly': 'Yıllık Abone Ol',
  'subscription.cancelTrial': 'Denemeyi İptal Et',
  'subscription.cancelSubscription': 'Aboneliği İptal Et',
  'subscription.cancel': 'İptal et',
  'subscription.changePlan': 'Plan değiştir',
  'subscription.current': 'Mevcut',
  'subscription.switchToMonthly': 'Aylık\'a geç',
  'subscription.switchToYearly': 'Yıllık\'a geç',
  'subscription.reactivate': 'Yeniden aktifleştir',
  'subscription.restore': 'Satın alımları geri yükle',
  'subscription.subscriptionEnding': 'Premium aboneliğiniz yakında sona erecek',
  'subscription.limitReached': 'Belge limitinize ulaştınız',
  'subscription.free': 'Ücretsiz',
  'subscription.premium': 'Premium',
  'subscription.trial': 'Deneme',
  'subscription.monthly': 'Aylık',
  'subscription.yearly': 'Yıllık',
  'subscription.documentsRemaining': 'belge kaldı',
  'subscription.trialDescription': 'Tüm premium özellikleri 7 gün boyunca deneyin',
  'subscription.monthlyDescription': 'Tüm özelliklerle düzenli kullanım için',
  'subscription.yearlyDescription': '2 ücretsiz ay ile en iyi değer',
  'subscription.freeDescription': 'Ara sıra kullanım için',
  'subscription.feature.documents': 'Günde 1 belge',
  'subscription.feature.documentsWeekly': 'Haftada 7 belge',
  'subscription.feature.priority': 'Öncelikli işleme',
  'subscription.feature.standard': 'Standart işleme',
  'subscription.feature.cancel': 'İstediğiniz zaman iptal',
  'subscription.feature.savings': '%17 tasarruf',
  'subscription.feature.premium': 'Tüm premium özellikler',
  'subscription.chooseYourPlan': 'Planınızı Seçin',
  'subscription.recommended': 'Önerilen',
  'subscription.managePlan': 'Plan Yönetimi',
  'subscription.accessUntil': 'Erişim sona erme',
  'subscription.days7': '7 gün',
  'subscription.continueFree': 'Ücretsiz Devam Et',
  'subscription.freeTrial': 'Ücretsiz Deneme',
  'subscription.freeUser': 'Ücretsiz Kullanıcı',
  'subscription.premiumUser': 'Premium Kullanıcı',
  'subscription.premiumFamily': 'Premium Aile',
  'subscription.businessUser': 'İş Kullanıcısı',
  'subscription.trialPeriod': 'Deneme Dönemi',
  'subscription.freeForever': 'Sonsuza Kadar Ücretsiz',
  'subscription.casualUse': 'Ara Sıra Kullanım',
  'subscription.regularUse': 'Düzenli Kullanım',
  'subscription.idealForFamilies': 'Aileler İçin İdeal',
  'subscription.unlimitedUsage': 'Sınırsız Kullanım',
  'subscription.testPremiumFeatures': 'Premium Özellikleri Test Et',
  'subscription.stayFree': 'Ücretsiz Kal',
  'subscription.currentPlan': 'Mevcut Plan',
  'subscription.oneDevice': '1 cihaz',
  'subscription.fourDevices': '4 cihaz',
  'subscription.unlimitedDevices': 'Sınırsız cihaz',
  'subscription.documentsPerDay': 'günlük belge',
  'subscription.documentsPerMonth': 'aylık belge',
  'subscription.unlimitedDocuments': 'Sınırsız belge',
  'subscription.startFreeTrial7Days': '7 günlük ücretsiz deneme başlat',
  'subscription.monthsInclusive': 'ay dahil',
  'subscription.save': 'Tasarruf Et',
  'subscription.premiumPlan': 'Premium Plan',
  'subscription.familyPlan': 'Aile Planı',
  'subscription.businessPlan': 'İş Planı',
  'subscription.premiumMonthly': 'Premium Aylık',
  'subscription.premiumYearly': 'Premium Yıllık',
  'subscription.familyMonthly': 'Aile Aylık',
  'subscription.familyYearly': 'Aile Yıllık',
  'subscription.businessMonthly': 'İş Aylık',
  'subscription.cancelAndStayFree': 'İptal Et ve Ücretsiz Kal',
  'subscription.perMonth': 'aylık',
  'subscription.perYear': 'yıllık',
  'subscription.unlimited': 'Sınırsız',
  'subscription.subscriptionSuccessful': 'Başarıyla abone oldunuz!',
  'subscription.familyPlanSuccessful': 'Aile Planı başarıyla alındı!',
  'subscription.businessPlanSuccessful': 'İş Planı başarıyla alındı!',
  'subscription.subscriptionFailed': 'Abonelik başarısız',
  'subscription.subscriptionCancelledMessage': 'Aboneliğiniz iptal edildi. Mevcut ödeme döneminin sonuna kadar premium özellikleri kullanmaya devam edebilirsiniz.',
  'subscription.confirmSubscription': 'Aboneliği Onayla',
  'subscription.confirmSubscriptionMessage': '{plan} premium planına abone olmak istediğinizden emin misiniz?',
  'subscription.subscribeButton': 'Abone Ol',
  'subscription.familyDashboard': 'Aile Paneli',
  'subscription.teamManagement': 'Takım Yönetimi',
  'subscription.apiAccess': 'API Erişimi',
  'subscription.prioritySupport': 'Öncelikli Destek',
  'subscription.savePercent': '%{percent} tasarruf et',
  'subscription.onlyEuroPerMonth': 'Sadece €{price}/ay',
  'subscription.freeTrialStarted': 'Ücretsiz Deneme Başlatıldı',
  'subscription.freeTrialStartedMessage': 'Premium özelliklerin 7 günlük ücretsiz denemesini başarıyla başlattınız!',
  'subscription.subscriptionReactivated': 'Abonelik Yeniden Aktifleştirildi',
  'subscription.subscriptionReactivatedMessage': 'Aboneliğiniz başarıyla yeniden aktifleştirildi.',
  'subscription.cancelSubscriptionConfirm': 'Premium aboneliğinizi iptal etmek istediğinizden emin misiniz?',
  'subscription.reactivateSubscriptionConfirm': 'Aboneliğinizi yeniden aktifleştirmek ister misiniz? Faturalandırma mevcut dönemin sonunda yeniden başlayacak.',
  'subscription.active': 'Aktif',
  'subscription.unknown': 'Bilinmeyen',
  'subscription.none': 'Yok',
  'subscription.upgradeLabel': 'YÜKSELTİM',
  'subscription.failedToLoadDetails': 'Abonelik detayları yüklenemedi. Lütfen tekrar deneyin.',
  'subscription.tryAgain': 'Lütfen tekrar deneyin',
  'subscription.subscriptionCancelled': 'Abonelik İptal Edildi',
  'subscription.subscriptionCancelledShort': 'Premium aboneliğiniz iptal edildi.',
  
  // Language
  'language.title': 'Dil',
  'language.description': 'Uygulama arayüzü için tercih ettiğiniz dili seçin. Değişiklikleri uygulamak için uygulama yeniden başlatılacak.',
  'language.info': 'Dil seçiminizden bağımsız olarak bazı içerikler İngilizce görünmeye devam edebilir.',
  'language.selectLanguage': 'Tercih ettiğiniz dili seçin',
  'language.changeNote': 'Değişiklikler uygulama arayüzüne hemen uygulanacak.',
};

// Japanese translations 
const ja: TranslationDictionary = {
  // Common
  'common.ok': 'OK',
  'common.cancel': 'キャンセル',
  'common.save': '保存',
  'common.delete': '削除',
  'common.edit': '編集',
  'common.loading': '読み込み中...',
  'common.retry': '再試行',
  'common.error': 'エラー',
  'common.success': '成功',
  'common.version': 'バージョン',
  'common.logout': 'ログアウト',
  'common.and': 'と',
  'common.annually': '年間',
  
  // Dashboard
  'dashboard.title': 'ダッシュボード',
  'dashboard.welcome': 'ようこそ',
  'dashboard.upload': 'アップロード',
  'dashboard.history': '履歴',
  'dashboard.profile': 'プロフィール',
  'dashboard.recentDocuments': '最近のドキュメント',
  'dashboard.viewAll': 'すべてのドキュメントを表示',
  'dashboard.noDocuments': 'まだドキュメントがありません',
  'dashboard.uploadFirst': '開始するには最初のドキュメントをアップロードしてください',
  'dashboard.documentsRemaining': 'ドキュメント残り',
  'dashboard.upgrade': 'アップグレード',
  'dashboard.reactivate': '再有効化',
  
  // Upload
  'upload.title': 'ドキュメントアップロード',
  'upload.selectImage': '画像を選択',
  'upload.takePhoto': '写真を撮る',
  'upload.processing': '処理中...',
  'upload.success': 'ドキュメントのアップロードが成功しました',
  'upload.error': 'ドキュメントアップロードエラー',
  'upload.permissionRequired': '許可が必要です',
  'upload.cameraPermission': '写真を撮るにはカメラの許可が必要です',
  'upload.successMessage': 'ドキュメントがアップロードされ、処理中です',
  'upload.errorMessage': 'ドキュメントのアップロード中にエラーが発生しました。もう一度お試しください。',
  'upload.confirm': '確認',
  'upload.selectImageDescription': 'ギャラリーから画像を選択',
  'upload.takePhotoDescription': 'カメラで新しい写真を撮影',
  
  // History
  'history.title': 'ドキュメント履歴',
  'history.noDocuments': 'まだドキュメントがありません',
  'history.uploadFirst': '開始するには最初のドキュメントをアップロードしてください',
  'history.loadingDocuments': 'ドキュメントを読み込み中...',
  'history.errorLoading': 'ドキュメント読み込みエラー',
  'history.status.completed': '完了',
  'history.status.processing': '処理中',
  'history.status.failed': '失敗',
  
  // Document View
  'docView.title': 'ドキュメントビューア',
  'docView.loading': 'ドキュメント読み込み中...',
  'docView.error': 'ドキュメント読み込みエラー',
  'docView.noPdf': 'PDFドキュメントがありません',
  'docView.invalidDocument': '無効なドキュメントID',
  'docView.failedToLoad': 'ドキュメントの読み込みに失敗しました',
  'docView.pdfRenderError': 'PDFドキュメントの表示に失敗しました',
  'docView.sharingFailed': '共有に失敗しました',
  
  // Profile
  'profile.title': 'プロフィール',
  'profile.editProfile': 'プロフィール編集',
  'profile.notifications': '通知',
  'profile.security': 'セキュリティ',
  'profile.helpSupport': 'ヘルプとサポート',
  'profile.appearance': '外観',
  'profile.language': '言語',
  'profile.logout': 'ログアウト',
  'profile.account': 'アカウント',
  'profile.preferences': '設定',
  'profile.loadingProfile': 'プロフィール読み込み中...',
  'profile.errorProfile': 'プロフィール読み込みエラー',
  'profile.settings': '設定',
  'profile.darkMode': 'ダークモード',
  'profile.changePassword': 'パスワード変更',
  'profile.privacyPolicy': 'プライバシーポリシー',
  'profile.termsOfService': '利用規約',
  'profile.logoutTitle': 'ログアウト',
  'profile.logoutConfirm': 'ログアウトしてもよろしいですか？',
  'profile.selectTheme': 'テーマを選択',
  'profile.systemDefault': 'システムデフォルト',
  'profile.lightMode': 'ライトモード',
  'profile.themeChangeNote': '変更はアプリインターフェースに即座に適用されます。',
  'profile.firstName': '名',
  'profile.lastName': '姓',
  'profile.email': 'メール',
  'profile.allFieldsRequired': 'すべてのフィールドを入力してください',
  'profile.profileUpdated': 'プロフィールが正常に更新されました',
  'profile.updateFailed': 'プロフィールの更新に失敗しました',
  'profile.currentPassword': '現在のパスワード',
  'profile.newPassword': '新しいパスワード',
  'profile.confirmPassword': 'パスワードの確認',
  'profile.passwordsDoNotMatch': 'パスワードが一致しません',
  'profile.passwordTooShort': 'パスワードは6文字以上である必要があります',
  'profile.passwordChanged': 'パスワードが正常に変更されました',
  'profile.passwordChangeFailed': 'パスワードの変更に失敗しました',
  'profile.passwordRequirements': 'パスワードが要件を満たしていません',
  'profile.minLength': '6文字以上',
  'profile.hasLetter': '少なくとも1つの文字を含む',
  'profile.hasNumber': '少なくとも1つの数字を含む',
  'profile.passwordsMatch': 'パスワードが一致しています',
  'subscription.title': 'サブスクリプション',
  'subscription.plan': 'プラン',
  'subscription.billing': '請求',
  'subscription.trialEnds': 'トライアル終了',
  'subscription.nextBilling': '次回請求',
  'subscription.documents': 'ドキュメント',
  'subscription.resetsOn': 'リセット日',
  'subscription.startFreeTrial': '無料トライアル開始',
  'subscription.subscribeMontly': '月額購読',
  'subscription.subscribeYearly': '年額購読',
  'subscription.cancelTrial': 'トライアルキャンセル',
  'subscription.cancelSubscription': 'サブスクリプションキャンセル',
  'subscription.cancel': 'キャンセル',
  'subscription.changePlan': 'プラン変更',
  'subscription.current': '現在',
  'subscription.switchToMonthly': '月額に変更',
  'subscription.switchToYearly': '年額に変更',
  'subscription.reactivate': '再有効化',
  'subscription.restore': '購入履歴を復元',
  'subscription.subscriptionEnding': 'プレミアムサブスクリプションがまもなく終了します',
  'subscription.limitReached': 'ドキュメント制限に達しました',
  'subscription.free': '無料',
  'subscription.premium': 'プレミアム',
  'subscription.trial': 'トライアル',
  'subscription.monthly': '月額',
  'subscription.yearly': '年額',
  'subscription.documentsRemaining': 'ドキュメント残り',
  'subscription.trialDescription': '全てのプレミアム機能を7日間お試し',
  'subscription.monthlyDescription': '全機能で定期利用',
  'subscription.yearlyDescription': '2ヶ月無料でお得',
  'subscription.freeDescription': 'たまに使用する場合',
  'subscription.feature.documents': '1日1ドキュメント',
  'subscription.feature.documentsWeekly': '週7ドキュメント',
  'subscription.feature.priority': '優先処理',
  'subscription.feature.standard': '標準処理',
  'subscription.feature.cancel': 'いつでもキャンセル',
  'subscription.feature.savings': '17%節約',
  'subscription.feature.premium': '全てのプレミアム機能',
  'subscription.chooseYourPlan': 'プランを選択',
  'subscription.recommended': 'おすすめ',
  'subscription.managePlan': 'プラン管理',
  'subscription.accessUntil': 'アクセス期限',
  'subscription.days7': '7日',
  'subscription.continueFree': '無料で続行',
  'subscription.freeTrial': '無料トライアル',
  'subscription.freeUser': '無料ユーザー',
  'subscription.premiumUser': 'プレミアムユーザー',
  'subscription.premiumFamily': 'プレミアムファミリー',
  'subscription.businessUser': 'ビジネスユーザー',
  'subscription.trialPeriod': 'トライアル期間',
  'subscription.freeForever': 'ずっと無料',
  'subscription.casualUse': 'カジュアル利用',
  'subscription.regularUse': '定期利用',
  'subscription.idealForFamilies': 'ファミリーに最適',
  'subscription.unlimitedUsage': '無制限利用',
  'subscription.testPremiumFeatures': 'プレミアム機能をテスト',
  'subscription.stayFree': '無料のまま',
  'subscription.currentPlan': '現在のプラン',
  'subscription.oneDevice': '1台',
  'subscription.fourDevices': '4台',
  'subscription.unlimitedDevices': '無制限台数',
  'subscription.documentsPerDay': 'ドキュメント/日',
  'subscription.documentsPerMonth': 'ドキュメント/月',
  'subscription.unlimitedDocuments': '無制限ドキュメント',
  'subscription.startFreeTrial7Days': '7日間無料トライアル開始',
  'subscription.monthsInclusive': 'ヶ月含む',
  'subscription.save': '節約',
  'subscription.premiumPlan': 'プレミアムプラン',
  'subscription.familyPlan': 'ファミリープラン',
  'subscription.businessPlan': 'ビジネスプラン',
  'subscription.premiumMonthly': 'プレミアム月額',
  'subscription.premiumYearly': 'プレミアム年額',
  'subscription.familyMonthly': 'ファミリー月額',
  'subscription.familyYearly': 'ファミリー年額',
  'subscription.businessMonthly': 'ビジネス月額',
  'subscription.cancelAndStayFree': 'キャンセルして無料のまま',
  'subscription.perMonth': '/月',
  'subscription.perYear': '/年',
  'subscription.unlimited': '無制限',
  'subscription.subscriptionSuccessful': '購読成功！',
  'subscription.familyPlanSuccessful': 'ファミリープラン購読成功！',
  'subscription.businessPlanSuccessful': 'ビジネスプラン購読成功！',
  'subscription.subscriptionFailed': '購読失敗',
  'subscription.subscriptionCancelledMessage': 'サブスクリプションがキャンセルされました。現在の請求期間の終了までプレミアム機能をご利用いただけます。',
  'subscription.confirmSubscription': 'サブスクリプション確認',
  'subscription.confirmSubscriptionMessage': '{plan}プレミアムプランに購読しますか？',
  'subscription.subscribeButton': '購読',
  'subscription.familyDashboard': 'ファミリーダッシュボード',
  'subscription.teamManagement': 'チーム管理',
  'subscription.apiAccess': 'APIアクセス',
  'subscription.prioritySupport': '優先サポート',
  'subscription.savePercent': '{percent}%節約',
  'subscription.onlyEuroPerMonth': 'わずか€{price}/月',
  'subscription.freeTrialStarted': '無料トライアル開始',
  'subscription.freeTrialStartedMessage': 'プレミアム機能の7日間無料トライアルを開始しました！',
  'subscription.subscriptionReactivated': 'サブスクリプション再有効化',
  'subscription.subscriptionReactivatedMessage': 'サブスクリプションが再有効化されました。',
  'subscription.cancelSubscriptionConfirm': 'プレミアムサブスクリプションをキャンセルしますか？',
  'subscription.reactivateSubscriptionConfirm': 'サブスクリプションを再有効化しますか？現在の期間終了後に請求が再開されます。',
  'subscription.active': 'アクティブ',
  'subscription.unknown': '不明',
  'subscription.none': 'なし',
  'subscription.upgradeLabel': 'アップグレード',
  'subscription.failedToLoadDetails': 'サブスクリプション詳細の読み込みに失敗しました。もう一度お試しください。',
  'subscription.tryAgain': 'もう一度お試しください',
  'subscription.subscriptionCancelled': 'サブスクリプションキャンセル',
  'subscription.subscriptionCancelledShort': 'プレミアムサブスクリプションがキャンセルされました。',
  
  // Language
  'language.title': '言語',
  'language.description': 'アプリインターフェースの言語を選択してください。変更を適用するためにアプリが再起動されます。',
  'language.info': '言語の選択に関係なく、一部のコンテンツは英語で表示される場合があります。',
  'language.selectLanguage': 'お好みの言語を選択してください',
  'language.changeNote': '変更はアプリインターフェースに即座に適用されます。',
};

// French translations
const fr: TranslationDictionary = {
  // Common
  'common.ok': 'OK',
  'common.cancel': 'Annuler',
  'common.save': 'Enregistrer',
  'common.delete': 'Supprimer',
  'common.edit': 'Modifier',
  'common.loading': 'Chargement...',
  'common.retry': 'Réessayer',
  'common.error': 'Erreur',
  'common.success': 'Succès',
  'common.version': 'Version',
  'common.logout': 'Se déconnecter',
  'common.and': 'et',
  'common.annually': 'Annuellement',
  
  // Dashboard
  'dashboard.title': 'Tableau de bord',
  'dashboard.welcome': 'Bienvenue',
  'dashboard.upload': 'Télécharger',
  'dashboard.history': 'Historique',
  'dashboard.profile': 'Profil',
  'dashboard.recentDocuments': 'Documents récents',
  'dashboard.viewAll': 'Voir tous les documents',
  'dashboard.noDocuments': 'Aucun document pour le moment',
  'dashboard.uploadFirst': 'Téléchargez votre premier document pour commencer',
  'dashboard.documentsRemaining': 'documents restants',
  'dashboard.upgrade': 'Mettre à niveau',
  'dashboard.reactivate': 'Réactiver',
  
  // Upload
  'upload.title': 'Télécharger un document',
  'upload.selectImage': 'Sélectionner une image',
  'upload.takePhoto': 'Prendre une photo',
  'upload.processing': 'Traitement en cours...',
  'upload.success': 'Document téléchargé avec succès',
  'upload.error': 'Erreur de téléchargement du document',
  'upload.permissionRequired': 'Permission requise',
  'upload.cameraPermission': 'Permission de caméra requise pour prendre des photos',
  'upload.successMessage': 'Votre document a été téléchargé et est en cours de traitement',
  'upload.errorMessage': 'Une erreur s\'est produite lors du téléchargement de votre document. Veuillez réessayer.',
  'upload.confirm': 'Confirmer',
  'upload.selectImageDescription': 'Sélectionnez une image depuis votre galerie',
  'upload.takePhotoDescription': 'Prenez une nouvelle photo avec votre appareil photo',
  
  // History
  'history.title': 'Historique des documents',
  'history.noDocuments': 'Aucun document pour le moment',
  'history.uploadFirst': 'Téléchargez votre premier document pour commencer',
  'history.loadingDocuments': 'Chargement des documents...',
  'history.errorLoading': 'Erreur de chargement des documents',
  'history.status.completed': 'Terminé',
  'history.status.processing': 'En cours',
  'history.status.failed': 'Échec',
  
  // Document View
  'docView.title': 'Visionneuse de documents',
  'docView.loading': 'Chargement du document...',
  'docView.error': 'Erreur de chargement du document',
  'docView.noPdf': 'Document PDF non disponible',
  'docView.invalidDocument': 'ID de document invalide',
  'docView.failedToLoad': 'Échec du chargement du document',
  'docView.pdfRenderError': 'Échec du rendu du document PDF',
  'docView.sharingFailed': 'Échec du partage',
  
  // Profile
  'profile.title': 'Profil',
  'profile.editProfile': 'Modifier le profil',
  'profile.notifications': 'Notifications',
  'profile.security': 'Sécurité',
  'profile.helpSupport': 'Aide et support',
  'profile.appearance': 'Apparence',
  'profile.language': 'Langue',
  'profile.logout': 'Se déconnecter',
  'profile.account': 'Compte',
  'profile.preferences': 'Préférences',
  'profile.loadingProfile': 'Chargement du profil...',
  'profile.errorProfile': 'Erreur de chargement du profil',
  'profile.settings': 'Paramètres',
  'profile.darkMode': 'Mode sombre',
  'profile.changePassword': 'Changer le mot de passe',
  'profile.privacyPolicy': 'Politique de confidentialité',
  'profile.termsOfService': 'Conditions d\'utilisation',
  'profile.logoutTitle': 'Se déconnecter',
  'profile.logoutConfirm': 'Êtes-vous sûr de vouloir vous déconnecter ?',
  'profile.selectTheme': 'Sélectionner un thème',
  'profile.systemDefault': 'Défaut du système',
  'profile.lightMode': 'Mode clair',
  'profile.themeChangeNote': 'Les modifications seront appliquées immédiatement à l\'interface de l\'application.',
  'profile.firstName': 'Prénom',
  'profile.lastName': 'Nom',
  'profile.email': 'Email',
  'profile.allFieldsRequired': 'Veuillez remplir tous les champs',
  'profile.profileUpdated': 'Profil mis à jour avec succès',
  'profile.updateFailed': 'Échec de la mise à jour du profil',
  'profile.currentPassword': 'Mot de passe actuel',
  'profile.newPassword': 'Nouveau mot de passe',
  'profile.confirmPassword': 'Confirmer le mot de passe',
  'profile.passwordsDoNotMatch': 'Les mots de passe ne correspondent pas',
  'profile.passwordTooShort': 'Le mot de passe doit contenir au moins 6 caractères',
  'profile.passwordChanged': 'Mot de passe modifié avec succès',
  'profile.passwordChangeFailed': 'Échec de la modification du mot de passe',
  'profile.passwordRequirements': 'Le mot de passe ne respecte pas les critères',
  'profile.minLength': 'Au moins 6 caractères',
  'profile.hasLetter': 'Contient au moins une lettre',
  'profile.hasNumber': 'Contient au moins un chiffre',
  'profile.passwordsMatch': 'Les mots de passe correspondent',
  'subscription.title': 'Abonnement',
  'subscription.plan': 'Plan',
  'subscription.billing': 'Facturation',
  'subscription.trialEnds': 'Fin d\'essai',
  'subscription.nextBilling': 'Prochaine facturation',
  'subscription.documents': 'Documents',
  'subscription.resetsOn': 'Réinitialise le',
  'subscription.startFreeTrial': 'Commencer l\'essai gratuit',
  'subscription.subscribeMontly': 'S\'abonner mensuellement',
  'subscription.subscribeYearly': 'S\'abonner annuellement',
  'subscription.cancelTrial': 'Annuler l\'essai',
  'subscription.cancelSubscription': 'Annuler l\'abonnement',
  'subscription.cancel': 'Annuler',
  'subscription.changePlan': 'Changer de plan',
  'subscription.current': 'Actuel',
  'subscription.switchToMonthly': 'Passer au mensuel',
  'subscription.switchToYearly': 'Passer à l\'annuel',
  'subscription.reactivate': 'Réactiver',
  'subscription.restore': 'Restaurer les achats',
  'subscription.subscriptionEnding': 'Votre abonnement premium se termine bientôt',
  'subscription.limitReached': 'Vous avez atteint votre limite de documents',
  'subscription.free': 'Gratuit',
  'subscription.premium': 'Premium',
  'subscription.trial': 'Essai',
  'subscription.monthly': 'Mensuel',
  'subscription.yearly': 'Annuel',
  'subscription.documentsRemaining': 'documents restants',
  'subscription.trialDescription': 'Essayez toutes les fonctionnalités premium pendant 7 jours',
  'subscription.monthlyDescription': 'Pour une utilisation régulière avec toutes les fonctionnalités',
  'subscription.yearlyDescription': 'Meilleure valeur avec 2 mois gratuits',
  'subscription.freeDescription': 'Pour une utilisation occasionnelle',
  'subscription.feature.documents': '1 document par jour',
  'subscription.feature.documentsWeekly': '7 documents par semaine',
  'subscription.feature.priority': 'Traitement prioritaire',
  'subscription.feature.standard': 'Traitement standard',
  'subscription.feature.cancel': 'Annuler à tout moment',
  'subscription.feature.savings': '17% d\'économies',
  'subscription.feature.premium': 'Toutes les fonctionnalités premium',
  'subscription.chooseYourPlan': 'Choisissez votre plan',
  'subscription.recommended': 'Recommandé',
  'subscription.managePlan': 'Gérer le plan',
  'subscription.accessUntil': 'Accès jusqu\'au',
  'subscription.days7': '7 jours',
  'subscription.continueFree': 'Continuer gratuitement',
  'subscription.freeTrial': 'Essai gratuit',
  'subscription.freeUser': 'Utilisateur gratuit',
  'subscription.premiumUser': 'Utilisateur premium',
  'subscription.premiumFamily': 'Premium Famille',
  'subscription.businessUser': 'Utilisateur Business',
  'subscription.trialPeriod': 'Période d\'essai',
  'subscription.freeForever': 'Gratuit pour toujours',
  'subscription.casualUse': 'Usage occasionnel',
  'subscription.regularUse': 'Usage régulier',
  'subscription.idealForFamilies': 'Idéal pour les familles',
  'subscription.unlimitedUsage': 'Usage illimité',
  'subscription.testPremiumFeatures': 'Tester les fonctionnalités premium',
  'subscription.stayFree': 'Rester gratuit',
  'subscription.currentPlan': 'Plan actuel',
  'subscription.oneDevice': '1 appareil',
  'subscription.fourDevices': '4 appareils',
  'subscription.unlimitedDevices': 'Appareils illimités',
  'subscription.documentsPerDay': 'documents par jour',
  'subscription.documentsPerMonth': 'documents par mois',
  'subscription.unlimitedDocuments': 'Documents illimités',
  'subscription.startFreeTrial7Days': 'Commencer l\'essai gratuit de 7 jours',
  'subscription.monthsInclusive': 'mois inclus',
  'subscription.save': 'Économiser',
  'subscription.premiumPlan': 'Plan Premium',
  'subscription.familyPlan': 'Plan Famille',
  'subscription.businessPlan': 'Plan Business',
  'subscription.premiumMonthly': 'Premium mensuel',
  'subscription.premiumYearly': 'Premium annuel',
  'subscription.familyMonthly': 'Famille mensuel',
  'subscription.familyYearly': 'Famille annuel',
  'subscription.businessMonthly': 'Business mensuel',
  'subscription.cancelAndStayFree': 'Annuler et rester gratuit',
  'subscription.perMonth': 'par mois',
  'subscription.perYear': 'par an',
  'subscription.unlimited': 'Illimité',
  'subscription.subscriptionSuccessful': 'Abonnement réussi !',
  'subscription.familyPlanSuccessful': 'Plan Famille souscrit avec succès !',
  'subscription.businessPlanSuccessful': 'Plan Business souscrit avec succès !',
  'subscription.subscriptionFailed': 'Échec de l\'abonnement',
  'subscription.subscriptionCancelledMessage': 'Votre abonnement a été annulé. Vous pouvez continuer à utiliser les fonctionnalités premium jusqu\'à la fin de votre période de facturation actuelle.',
  'subscription.confirmSubscription': 'Confirmer l\'abonnement',
  'subscription.confirmSubscriptionMessage': 'Êtes-vous sûr de vouloir vous abonner au plan premium {plan} ?',
  'subscription.subscribeButton': 'S\'abonner',
  'subscription.familyDashboard': 'Tableau de bord familial',
  'subscription.teamManagement': 'Gestion d\'équipe',
  'subscription.apiAccess': 'Accès API',
  'subscription.prioritySupport': 'Support prioritaire',
  'subscription.savePercent': 'Économisez {percent}%',
  'subscription.onlyEuroPerMonth': 'Seulement €{price}/mois',
  'subscription.freeTrialStarted': 'Essai gratuit commencé',
  'subscription.freeTrialStartedMessage': 'Vous avez commencé avec succès votre essai gratuit de 7 jours des fonctionnalités premium !',
  'subscription.subscriptionReactivated': 'Abonnement réactivé',
  'subscription.subscriptionReactivatedMessage': 'Votre abonnement a été réactivé avec succès.',
  'subscription.cancelSubscriptionConfirm': 'Êtes-vous sûr de vouloir annuler votre abonnement premium ?',
  'subscription.reactivateSubscriptionConfirm': 'Souhaitez-vous réactiver votre abonnement ? Votre facturation reprendra à la fin de votre période actuelle.',
  'subscription.active': 'Actif',
  'subscription.unknown': 'Inconnu',
  'subscription.none': 'Aucun',
  'subscription.upgradeLabel': 'AMÉLIORER',
  'subscription.failedToLoadDetails': 'Échec du chargement des détails de l\'abonnement. Veuillez réessayer.',
  'subscription.tryAgain': 'Veuillez réessayer',
  'subscription.subscriptionCancelled': 'Abonnement Annulé',
  'subscription.subscriptionCancelledShort': 'Votre abonnement premium a été annulé.',
  
  // Language
  'language.title': 'Langue',
  'language.description': 'Sélectionnez votre langue préférée pour l\'interface de l\'application. L\'application se relancera pour appliquer les changements.',
  'language.info': 'Certains contenus peuvent continuer à s\'afficher en anglais indépendamment de votre sélection de langue.',
  'language.selectLanguage': 'Sélectionnez votre langue préférée',
  'language.changeNote': 'Les modifications seront appliquées immédiatement à l\'interface de l\'application.',
};

// Combine all translations
const translations: Record<Language, TranslationDictionary> = {
  en,
  de,
  es,
  ru,
  tr,
  ja,
  fr
};

// Function to get a translation
export const translate = (key: TranslationKey, language: Language = 'en'): string => {
  // Get the translation dictionary for the specified language
  const dictionary = translations[language] || translations.en;
  
  // Return the translation or fall back to English if not found
  return dictionary[key] || translations.en[key] || key;
};

// React hook for translations
export const useTranslation = () => {
  const { language } = useLanguage();
  
  // Memoize the translate function to avoid unnecessary re-renders
  const t = useMemo(() => 
    (key: TranslationKey) => translate(key, language),
    [language]
  );
  
  // Format function for interpolating values into translations
  const format = (text: string, values: Record<string, string | number>) => {
    return Object.entries(values).reduce(
      (result, [key, value]) => result.replace(`{${key}}`, String(value)),
      text
    );
  };
  
  return { t, format, language };
};

// Hook for getting translations in a specific language
export const useTranslate = (language: Language = 'en') => {
  // Memoize the translate function to avoid unnecessary re-renders
  const t = useMemo(() => 
    (key: TranslationKey) => translate(key, language),
    [language]
  );
  
  return t;
};

export default { translate, useTranslation, useTranslate, translations }; 