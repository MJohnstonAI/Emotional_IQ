import { create } from "zustand";
import { Platform } from "react-native";

import { IAP_PRODUCTS } from "@/lib/iap";
import { readJson, STORAGE_KEYS, writeJson } from "@/lib/storage";
import { supabase, supabaseEnabled } from "@/lib/supabase";

type Purchase = { productId?: string } & Record<string, any>;

type Entitlements = {
  removeAds: boolean;
  proAccess: boolean;
  pending: boolean;
};

type PurchaseState = {
  entitlements: Entitlements;
  products: string[];
  initialized: boolean;
  hydrate: () => Promise<void>;
  initIap: () => Promise<void>;
  purchase: (productId: string) => Promise<void>;
  restore: () => Promise<void>;
  setEntitlement: (productId: string) => void;
};

const defaultEntitlements: Entitlements = {
  removeAds: false,
  proAccess: false,
  pending: false,
};

const getIap = () => {
  if (Platform.OS !== "android") return null;
  // Lazy require to avoid crashing web bundling/runtime.
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  return require("react-native-iap") as typeof import("react-native-iap");
};

export const usePurchaseStore = create<PurchaseState>((set, get) => ({
  entitlements: defaultEntitlements,
  products: [],
  initialized: false,
  hydrate: async () => {
    const saved = await readJson(STORAGE_KEYS.entitlements, defaultEntitlements);
    set({ entitlements: saved });
  },
  initIap: async () => {
    if (get().initialized) return;
    if (Platform.OS !== "android") {
      set({ initialized: true });
      return;
    }

    const iap = getIap();
    if (!iap) {
      set({ initialized: true });
      return;
    }

    try {
      await iap.initConnection();
      const items = await iap.fetchProducts({
        skus: [IAP_PRODUCTS.removeAds, IAP_PRODUCTS.proAccess],
      });
      set({ products: items.map((item) => item.productId), initialized: true });

      iap.purchaseUpdatedListener(async (purchase: Purchase) => {
        if (purchase.productId) {
          get().setEntitlement(purchase.productId);
        }
        try {
          await iap.finishTransaction({
            purchase: purchase as any,
            isConsumable: false,
          });
        } catch {
          // no-op
        }
      });
    } catch {
      set({ initialized: true });
    }
  },
  purchase: async (productId) => {
    if (Platform.OS !== "android") return;
    const iap = getIap();
    if (!iap) return;
    await iap.requestPurchase({
      type: "in-app",
      request: { google: { skus: [productId] } },
    } as any);
  },
  restore: async () => {
    if (Platform.OS !== "android") return;
    const iap = getIap();
    if (!iap) return;
    const purchases = await iap.getAvailablePurchases();
    purchases.forEach((purchase: Purchase) => {
      if (purchase.productId) {
        get().setEntitlement(purchase.productId);
      }
    });
  },
  setEntitlement: (productId) => {
    const next = { ...get().entitlements };
    if (productId === IAP_PRODUCTS.removeAds) {
      next.removeAds = true;
    }
    if (productId === IAP_PRODUCTS.proAccess) {
      next.proAccess = true;
    }
    next.pending = false;
    set({ entitlements: next });
    writeJson(STORAGE_KEYS.entitlements, next);

    if (supabaseEnabled && supabase) {
      supabase.auth.getSession().then(({ data }) => {
        const userId = data.session?.user?.id;
        if (!userId) return;
        supabase
          .from("entitlements")
          .upsert(
            {
              user_id: userId,
              product_id: productId,
              status: "active",
            },
            { onConflict: "user_id,product_id" }
          )
          .then(() => undefined);
      });
    }
  },
}));
