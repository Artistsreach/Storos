import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface UiState {
  darkMode: boolean;
  toggleDarkMode: () => void;
  // Add other UI-related states here, e.g., mobile menu open, modal states
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      darkMode: window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false,
      toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
    }),
    {
      name: 'ui-store-storage', // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
    }
  )
);

// Apply initial dark mode based on store (which checks localStorage or prefers-color-scheme)
// This should run once when the app loads.
// It's often better to do this in a top-level component like App.tsx or main.tsx
// to ensure the class is applied before rendering.
const initialDarkMode = useUiStore.getState().darkMode;
if (initialDarkMode) {
  document.documentElement.classList.add('dark');
} else {
  document.documentElement.classList.remove('dark');
}

// Listen to changes in the store and update the class on <html>
// This ensures that if the state changes from another tab (if using broadcast-channel middleware for example),
// or if devtools are used to change the state, the UI reflects it.
useUiStore.subscribe((state, prevState) => {
  // Only update if the darkMode state actually changed
  if (state.darkMode !== prevState.darkMode) {
    if (state.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }
});
