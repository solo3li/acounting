import { create } from 'zustand';
import axios from 'axios';
import { getTokenAsync } from '../utils/AuthHelper';
import { API_URL } from '../utils/config';

interface Account {
  id: number;
  name: string;
  type: string;
  currentBalance: number;
}

interface Transaction {
  id: number;
  accountId: number;
  toAccountId?: number;
  type: string;
  amount: number;
  date: string;
  notes?: string;
  receiptImage?: string;
}

interface AppState {
  accounts: Account[];
  transactions: Transaction[];
  loading: boolean;
  fetchAccounts: () => Promise<void>;
  fetchTransactions: (accountId?: number, type?: string) => Promise<void>;
}

export const useStore = create<AppState>((set) => ({
  accounts: [],
  transactions: [],
  loading: false,
  fetchAccounts: async () => {
    set({ loading: true });
    try {
      const token = await getTokenAsync();
      const res = await axios.get(`${API_URL}/accounts`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      set({ accounts: res.data, loading: false });
    } catch (e) {
      console.error(e);
      set({ loading: false });
    }
  },
  fetchTransactions: async (accountId?: number, type?: string) => {
    set({ loading: true });
    try {
      const token = await getTokenAsync();
      let url = `${API_URL}/transactions?`;
      if (accountId) url += `accountId=${accountId}&`;
      if (type) url += `type=${type}`;
      
      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      set({ transactions: res.data, loading: false });
    } catch (e) {
      console.error(e);
      set({ loading: false });
    }
  }
}));
