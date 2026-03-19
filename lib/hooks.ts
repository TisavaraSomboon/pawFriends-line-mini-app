"use client";

import {
  ChangeEvent,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { useRouter } from "next/navigation";
import {
  PlacePrediction,
  useAuthUser,
  usePlacesAutocomplete,
} from "@/lib/queries";

// True only on the client after hydration (server always returns false)
export function useMounted() {
  return useSyncExternalStore(
    () => () => {}, // no subscription needed
    () => true, // client snapshot
    () => false, // server snapshot
  );
}

// True once window "load" fires (all images + fonts + assets ready)
function usePageReady() {
  return useSyncExternalStore(
    (cb) => {
      window.addEventListener("load", cb);
      return () => window.removeEventListener("load", cb);
    },
    () => document.readyState === "complete",
    () => false,
  );
}

// Use in login/register pages — redirects to home if already logged in
export function useRequireGuest() {
  const router = useRouter();
  const { data: user, isLoading } = useAuthUser();

  useEffect(() => {
    if (!isLoading && user) {
      router.replace("/");
    }
  }, [user, isLoading, router]);

  return { isLoading };
}

// Use in protected pages — redirects to login if not logged in
export function useRequireAuth() {
  const router = useRouter();
  const { data: user, isLoading: authLoading } = useAuthUser();
  const mounted = useMounted();
  const pageReady = usePageReady();

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
    }
  }, [user, authLoading, router]);

  // Show skeleton until: hydrated + assets loaded + auth checked
  const isLoading = !mounted || !pageReady || authLoading;

  return { user, isLoading };
}

export function useLocationAutocomplete() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Debounce: only update the query sent to the hook after 350 ms of no typing
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 350);
    return () => clearTimeout(timer);
  }, [query]);

  const { data: predictions = [], isFetching } =
    usePlacesAutocomplete(debouncedQuery);

  // Open dropdown when results arrive
  useEffect(() => {
    setOpen(predictions.length > 0);
  }, [predictions]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelectLocation = (p: PlacePrediction) => {
    setQuery(p.description);
    setDebouncedQuery(""); // disable the hook immediately — prevents re-open
    setOpen(false);
  };

  const handleSearchChange = (
    e: ChangeEvent<HTMLInputElement, HTMLInputElement>,
  ) => {
    setQuery(e.target.value);
    if (!e.target.value) setOpen(false);
  };

  return {
    open,
    query,
    predictions,
    containerRef,
    isFetching,
    handleSelectLocation,
    handleSearchChange,
  };
}
