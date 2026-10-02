import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { SizingProfile, CustomMeasurements } from '@/types';

interface VaultState {
  profiles: SizingProfile[];
  setProfiles: (profiles: SizingProfile[]) => void;
  addProfile: (name: string, measurements: CustomMeasurements, isDefault?: boolean) => SizingProfile;
  updateProfile: (id: string, name: string, measurements: CustomMeasurements) => void;
  deleteProfile: (id: string) => void;
  setDefaultProfile: (id: string) => void;
  getProfileById: (id: string) => SizingProfile | undefined;
  clearProfiles: () => void;
}

export const useVaultStore = create<VaultState>()(
  persist(
    (set, get) => ({
      profiles: [],

      setProfiles: (profiles) => {
        set({ profiles });
      },

      addProfile: (name, measurements, isDefault = false) => {
        const newProfile: SizingProfile = {
          id: `vault-${Date.now()}`,
          name: name.trim(),
          measurements,
          isDefault,
          createdAt: new Date().toISOString().split('T')[0],
        };

        set((state) => {
          let updated = state.profiles;
          if (isDefault) {
            updated = updated.map((p) => ({ ...p, isDefault: false }));
          }
          // Avoid duplicate name profiles
          const filtered = updated.filter((p) => p.name.toLowerCase() !== name.trim().toLowerCase());
          return { profiles: [...filtered, newProfile] };
        });

        return newProfile;
      },

      updateProfile: (id, name, measurements) => {
        set((state) => ({
          profiles: state.profiles.map((p) =>
            p.id === id ? { ...p, name: name.trim(), measurements } : p
          ),
        }));
      },

      deleteProfile: (id) => {
        set((state) => ({
          profiles: state.profiles.filter((p) => p.id !== id),
        }));
      },

      setDefaultProfile: (id) => {
        set((state) => ({
          profiles: state.profiles.map((p) => ({
            ...p,
            isDefault: p.id === id,
          })),
        }));
      },

      getProfileById: (id) => {
        return get().profiles.find((p) => p.id === id);
      },

      clearProfiles: () => {
        set({ profiles: [] });
      },
    }),
    {
      name: 'miss-stitch-sizing-vault',
      version: 2,
      migrate: (persistedState: any, version: number) => {
        if (version < 2) {
          return {
            profiles: [],
          };
        }
        return persistedState;
      },
    }
  )
);
