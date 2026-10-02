import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CurrencyCode } from '@/types';

interface CurrencyState {
  currentCurrency: CurrencyCode;
  rates: Record<CurrencyCode, number>;
  symbols: Record<CurrencyCode, string>;
  setCurrency: (currency: CurrencyCode) => void;
  formatPrice: (amountPKR: number) => string;
}

export const useCurrencyStore = create<CurrencyState>()(
  persist(
    (set, get) => ({
      currentCurrency: 'PKR',
      rates: {
        PKR: 1,
        USD: 0.0036, // 1 PKR = ~0.0036 USD (~278 PKR/USD)
        GBP: 0.0028, // 1 PKR = ~0.0028 GBP
        AED: 0.0132, // 1 PKR = ~0.0132 AED
      },
      symbols: {
        PKR: 'Rs. ',
        USD: '$',
        GBP: '£',
        AED: 'AED ',
      },
      setCurrency: (currency: CurrencyCode) => set({ currentCurrency: currency }),
      formatPrice: (amountPKR: number) => {
        const { currentCurrency, rates, symbols } = get();
        const rate = rates[currentCurrency] || 1;
        const converted = amountPKR * rate;
        const symbol = symbols[currentCurrency];

        if (currentCurrency === 'PKR') {
          return `${symbol}${amountPKR.toLocaleString('en-PK')}`;
        }
        return `${symbol}${converted.toFixed(2)}`;
      },
    }),
    {
      name: 'miss-stitch-currency',
    }
  )
);
