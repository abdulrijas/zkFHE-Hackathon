"use client";
import React, { useEffect, useState, createContext } from "react";
import { ethers } from "ethers";

import { contractABI, contractAddress } from "../utils/constants";
import {
  TransactionContextValue,
  TransactionMap,
  Transaction,
  FormData,
} from "@/interfaces/Transactions";

declare global {
  interface Window {
    ethereum?: any;
  }
}

let ethereumW: any;

if (typeof window !== "undefined") {
  const { ethereum } = window;
  ethereumW = ethereum;
}

const defaultTransactionContextValue: TransactionContextValue = {
  transactionCount: "",
  connectWallet: async () => {},
  transactions: [],
  currentAccount: "",
  isLoading: false,
  sendTransaction: async () => {},
  handleChange: (_: React.ChangeEvent<HTMLInputElement>, __: string) => {},
  formData: {
    addressTo: "",
    amount: "",
    keyword: "",
    message: "",
  },
};

export const TransactionContext = createContext<TransactionContextValue>(
  defaultTransactionContextValue
);

const createEthereumContract = async () => {
  const provider = new ethers.BrowserProvider(ethereumW);
  const signer = await provider.getSigner();
  const transactionsContract = new ethers.Contract(
    contractAddress,
    contractABI,
    signer
  );
  return transactionsContract;
};

export default function TransactionsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const defaultFormData = {
    addressTo: "",
    amount: "",
    keyword: "",
    message: "",
  };
  const getLocalStorage = () => {
    if (typeof window !== "undefined") {
      return window.localStorage.getItem("transactionCount") ?? "";
    }
    return "";
  };
  const [formData, setformData] = useState<FormData>(defaultFormData);
  const [currentAccount, setCurrentAccount] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [transactionCount, setTransactionCount] = useState<string>(
    getLocalStorage()
  );
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    name: string
  ) => {
    setformData((prevState) => ({ ...prevState, [name]: e.target.value }));
  };

  async function getAllTransactions(): Promise<void> {
    try {
      if (ethereumW) {
        const transactionsContract = await createEthereumContract();

        const availableTransactions: TransactionMap[] =
          await transactionsContract.getAllTransactions();
        const structuredTransactions: Transaction[] = availableTransactions.map(
          (transaction: TransactionMap) => ({
            addressTo: transaction.receiver,
            addressFrom: transaction.sender,
            timestamp: new Date(
              Number(transaction.timestamp) * 1000
            ).toLocaleString(),
            message: transaction.message,
            keyword: transaction.keyword,
            amount: Number(ethers.formatEther(transaction.amount)),
          })
        );

        console.log(structuredTransactions);

        setTransactions(structuredTransactions);
      } else {
        console.log("Ethereum is not present");
      }
    } catch (error) {
      console.log(error);
    }
  }

  async function checkIfTransactionsExists(): Promise<void> {
    try {
      if (ethereumW) {
        const transactionsContract = await createEthereumContract();
        const currentTransactionCount: BigInt =
          await transactionsContract.getTransactionCount();
        if (typeof window !== "undefined") {
          window.localStorage.setItem(
            "transactionCount",
            Number(currentTransactionCount).toString()
          );
        }
      }
    } catch (error) {
      console.log(error);

      throw new Error("No ethereum object");
    }
  }

  async function connectWallet(): Promise<void> {
    try {
      if (!ethereumW) return alert("Please install MetaMask.");

      const accounts = await ethereumW.request({
        method: "eth_requestAccounts",
      });

      setCurrentAccount(accounts[0]);
      window.location.reload();
    } catch (error) {
      console.log(error);

      throw new Error("No ethereum object");
    }
  }

  async function sendTransaction(): Promise<void> {
    try {
      if (ethereumW) {
        const { addressTo, amount, keyword, message } = formData;
        const transactionsContract = await createEthereumContract();
        const parsedAmount = ethers.parseEther(amount);
        await ethereumW.request({
          method: "eth_sendTransaction",
          params: [
            {
              from: currentAccount,
              to: addressTo,
              gas: "0x5208", // 21000 GWEI
              value: parsedAmount.toString(16),
            },
          ],
        });

        const transactionHash = await transactionsContract.addToBlockchain(
          addressTo,
          parsedAmount,
          message,
          keyword
        );

        setIsLoading(true);
        console.log(`Loading - ${transactionHash.hash}`);
        await transactionHash.wait();
        console.log(`Success - ${transactionHash.hash}`);
        setIsLoading(false);

        const transactionsCount: BigInt =
          await transactionsContract.getTransactionCount();

        setTransactionCount(Number(transactionsCount).toString());
        window.location.reload();
      } else {
        console.log("No ethereum object");
      }
    } catch (error) {
      console.log(error);

      throw new Error("No ethereum object");
    }
  }

  useEffect(() => {
    const checkIfWalletIsConnect = async () => {
      try {
        if (!ethereumW) return alert("Please install MetaMask.");

        const accounts = await ethereumW.request({ method: "eth_accounts" });

        if (accounts.length) {
          setCurrentAccount(accounts[0]);

          await getAllTransactions();
        } else {
          console.log("No accounts found");
        }
      } catch (error) {
        console.log(error);
      }
    };
    checkIfWalletIsConnect();
    checkIfTransactionsExists();
  }, [transactionCount]);

  return (
    <TransactionContext.Provider
      value={{
        transactionCount,
        connectWallet,
        transactions,
        currentAccount,
        isLoading,
        sendTransaction,
        handleChange,
        formData,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
}
