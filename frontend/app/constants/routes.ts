export interface Routes {
  WELCOME: string;
  SIGN_IN: string;
  SIGN_UP: string;
  FORGOT_PASSWORD: string;
  DASHBOARD: string;
  DOCUMENT_LIST: string;
  DOCUMENT_DETAIL: string;
  UPLOAD: string;
  SETTINGS: string;
  PROFILE: string;
}

export const ROUTES: Routes = {
  // Auth routes
  WELCOME: '/',
  SIGN_IN: '/auth/signin',
  SIGN_UP: '/auth/signup',
  FORGOT_PASSWORD: '/auth/forgot-password',
  
  // Main app routes
  DASHBOARD: '/dashboard',
  DOCUMENT_LIST: '/documents',
  DOCUMENT_DETAIL: '/documents/[id]',
  UPLOAD: '/upload',
  SETTINGS: '/settings',
  PROFILE: '/profile',
};

export default ROUTES; 