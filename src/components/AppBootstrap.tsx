import { ReactNode, useEffect } from "react";

import { usePurchaseStore } from "@/state/purchaseStore";
import { useSettingsStore } from "@/state/settingsStore";

type AppBootstrapProps = {
  children: ReactNode;
};

export default function AppBootstrap({ children }: AppBootstrapProps) {
  const hydrateSettings = useSettingsStore((state) => state.hydrate);
  const hydratePurchases = usePurchaseStore((state) => state.hydrate);
  const initIap = usePurchaseStore((state) => state.initIap);

  useEffect(() => {
    hydrateSettings();
    hydratePurchases();
    initIap();
  }, [hydrateSettings, hydratePurchases, initIap]);

  return children;
}
