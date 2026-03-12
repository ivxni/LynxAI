declare module 'react-native-purchases' {
  export interface PurchasesPackage {
    identifier: string;
    offeringIdentifier: string;
    packageType: string;
    product: {
      identifier: string;
      description: string;
      title: string;
      price: number;
      priceString: string;
    };
  }

  export default class Purchases {
    static configure(options: { apiKey: string; appUserID: string }): Promise<void>;
    static getOfferings(): Promise<{ current: { availablePackages: PurchasesPackage[] } }>;
    static purchasePackage(packageToPurchase: PurchasesPackage): Promise<{
      customerInfo: {
        originalAppUserId: string;
        managementURL: string;
        allPurchaseDates: Record<string, string>;
      };
      productIdentifier: string;
    }>;
    static restorePurchases(): Promise<{
      originalAppUserId: string;
      managementURL: string;
      allPurchaseDates: Record<string, string>;
    }>;
  }
} 