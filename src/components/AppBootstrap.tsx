import { ReactNode, useEffect, useRef } from "react";

import { syncLocalProgress } from "@/lib/sync";
import { supabase, supabaseEnabled } from "@/lib/supabase";
import { useGameStore } from "@/state/gameStore";
import { usePurchaseStore } from "@/state/purchaseStore";
import { useSettingsStore } from "@/state/settingsStore";

type AppBootstrapProps = {
  children: ReactNode;
};

export default function AppBootstrap({ children }: AppBootstrapProps) {
  const hydrateSettings = useSettingsStore((state) => state.hydrate);
  const loadGame = useGameStore((state) => state.load);
  const puzzles = useGameStore((state) => state.puzzles);
  const progress = useGameStore((state) => state.progress);
  const hydratePurchases = usePurchaseStore((state) => state.hydrate);
  const initIap = usePurchaseStore((state) => state.initIap);

  useEffect(() => {
    hydrateSettings();
    loadGame();
    hydratePurchases();
    initIap();
  }, [hydrateSettings, hydratePurchases, initIap, loadGame]);

  const puzzlesRef = useRef(puzzles);
  const progressRef = useRef(progress);

  useEffect(() => {
    puzzlesRef.current = puzzles;
  }, [puzzles]);

  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  useEffect(() => {
    if (!supabaseEnabled || !supabase) return;
    const { data } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const userId = session?.user?.id;
        if (userId) {
          await syncLocalProgress(
            userId,
            puzzlesRef.current,
            progressRef.current
          );
        }
      }
    );
    return () => {
      data.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!supabaseEnabled || !supabase) return;
    supabase.auth.getSession().then(({ data }) => {
      const userId = data.session?.user?.id;
      if (userId) {
        syncLocalProgress(userId, puzzles, progress);
      }
    });
  }, [puzzles, progress]);

  return children;
}
