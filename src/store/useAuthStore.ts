import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CustomerAddress, Order } from '@/types';

interface User {
  id?: string;
  phone: string;
  name?: string;
  email?: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  addresses: CustomerAddress[];
  orders: Order[];
  loginWithPhone: (phone: string, name?: string, id?: string) => void;
  setUser: (user: User | null) => void;
  logout: () => void;
  addAddress: (address: Omit<CustomerAddress, 'id'>) => void;
  updateAddress: (id: string, address: Partial<CustomerAddress>) => void;
  deleteAddress: (id: string) => void;
  addOrder: (order: Order) => void;
  setOrders: (orders: Order[]) => void;
  getOrderById: (orderNumber: string) => Order | undefined;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      user: null,
      addresses: [],
      orders: [],

      loginWithPhone: (phone, name = 'Valued Customer', id) => {
        const cleanPhone = phone.startsWith('+92') ? phone : `+92 ${phone.replace(/^0/, '')}`;
        set({
          isAuthenticated: true,
          user: {
            id,
            phone: cleanPhone,
            name,
            email: undefined,
          },
        });
      },

      setUser: (user) => {
        set({
          isAuthenticated: !!user,
          user,
        });
      },

      logout: () => {
        set({
          isAuthenticated: false,
          user: null,
          addresses: [],
          orders: [],
        });
      },

      addAddress: (addressData) => {
        const newAddress: CustomerAddress = {
          ...addressData,
          id: `addr-${Date.now()}`,
        };
        set((state) => ({
          addresses: [...state.addresses, newAddress],
        }));
      },

      updateAddress: (id, updated) => {
        set((state) => ({
          addresses: state.addresses.map((a) => (a.id === id ? { ...a, ...updated } : a)),
        }));
      },

      deleteAddress: (id) => {
        set((state) => ({
          addresses: state.addresses.filter((a) => a.id !== id),
        }));
      },

      addOrder: (order) => {
        set((state) => {
          // Avoid duplicate order entries
          const filtered = state.orders.filter((o) => o.orderNumber !== order.orderNumber);
          return { orders: [order, ...filtered] };
        });
      },

      setOrders: (orders) => {
        set({ orders });
      },

      getOrderById: (orderNumber) => {
        return get().orders.find(
          (o) => o.orderNumber.toUpperCase() === orderNumber.toUpperCase()
        );
      },
    }),
    {
      name: 'miss-stitch-auth',
      version: 2,
      migrate: (persistedState: any, version: number) => {
        if (
          version < 2 ||
          persistedState?.user?.name === 'Ayesha Khan' ||
          persistedState?.user?.phone?.includes('8472910')
        ) {
          return {
            isAuthenticated: false,
            user: null,
            addresses: [],
            orders: [],
          };
        }
        return persistedState;
      },
    }
  )
);
