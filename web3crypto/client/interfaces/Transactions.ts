interface FormData {
  addressTo: string;
  amount: string;
  keyword: string;
  message: string;
}

interface TransactionMap {
  sender: string;
  receiver: string;
  amount: bigint;
  message: string;
  timestamp: bigint;
  keyword: string;
}

interface Transaction {
  addressFrom: string;
  addressTo: string;
  amount: number;
  message: string;
  timestamp: string;
  keyword: string;
}

interface TransactionContextValue {
  transactionCount: string;
  connectWallet: () => Promise<void>;
  transactions: Transaction[];
  currentAccount: string;
  isLoading: boolean;
  sendTransaction: () => Promise<void>;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>, name: string) => void;
  formData: FormData;
}

export type { TransactionMap, Transaction, TransactionContextValue, FormData };
