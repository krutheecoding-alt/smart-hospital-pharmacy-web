import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { fetchBranding } from '../lib/api';
import type { Branding } from '../lib/types';

const defaultBranding: Branding = {
  hospital_name: 'Smart Hospital Pharmacy',
  theme_primary: '#0d9488',
  theme_secondary: '#0891b2',
  theme_accent: '#14b8a6'
};

interface BrandingContextValue {
  branding: Branding;
}

const BrandingContext = createContext<BrandingContextValue>({ branding: defaultBranding });

function applyBranding(b: Branding) {
  const root = document.documentElement;
  root.style.setProperty('--accent', b.theme_primary);
  root.style.setProperty('--accent-2', b.theme_secondary);
  root.style.setProperty('--accent-light', b.theme_accent);
}

export function BrandingProvider({ children }: { children: ReactNode }) {
  const [branding, setBranding] = useState<Branding>(defaultBranding);

  useEffect(() => {
    fetchBranding().then((r) => {
      if (r.success && r.branding) {
        const b = r.branding as Branding;
        setBranding(b);
        applyBranding(b);
      }
    });
  }, []);

  return (
    <BrandingContext.Provider value={{ branding }}>
      {children}
    </BrandingContext.Provider>
  );
}

export function useBranding() {
  return useContext(BrandingContext);
}
