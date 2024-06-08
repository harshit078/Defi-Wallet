import React, { useState, useEffect } from "react";
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";
import { Web3Provider } from "@ethersproject/providers"; // Correct import for ethers v6+

const WalletConnector = () => {
  const [provider, setProvider] = useState<Web3Provider | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState<boolean>(false);

  // Auto-detect and establish wallet connection if cacheProvider is set
  useEffect(() => {
    const init = async () => {
      const web3Modal = new Web3Modal({
        cacheProvider: true, // Enables auto-connection to cached provider
        providerOptions: {
          walletconnect: {
            package: WalletConnectProvider,
            options: {
              infuraId: "a1e60e22f6e948c7a2a561ba31ffcad4",
            },
          },
        },
      });

      if (web3Modal.cachedProvider) {
        try {
          const instance = await web3Modal.connect();
          const web3Provider = new Web3Provider(instance);
          setProvider(web3Provider);
          const accounts = await web3Provider.listAccounts();
          setAccount(accounts[0]);
          setConnected(true);
          setError(null); // Clear any previous errors
        } catch (error) {
          console.error("Failed to auto-connect wallet:", error);
          setError(
            "Failed to auto-connect wallet. Please try connecting manually."
          );
        }
      }
    };
    init();
  }, []);

  const connectWallet = async () => {
    const web3Modal = new Web3Modal({
      cacheProvider: true,
      providerOptions: {
        walletconnect: {
          package: WalletConnectProvider,
          options: {
            infuraId: "a1e60e22f6e948c7a2a561ba31ffcad4",
          },
        },
      },
    });

    try {
      const instance = await web3Modal.connect();
      const web3Provider = new Web3Provider(instance);
      setProvider(web3Provider);
      const accounts = await web3Provider.listAccounts();
      setAccount(accounts[0]);
      setConnected(true);
      setError(null); // Clear any previous errors
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      setError("Failed to connect wallet. Please try again.");
    }
  };

  const disconnectWallet = async () => {
    const web3Modal = new Web3Modal({
      cacheProvider: true,
    });

    web3Modal.clearCachedProvider();
    setProvider(null);
    setAccount(null);
    setConnected(false);
    setError(null);
  };

  useEffect(() => {
    if (provider) {
      provider.on("accountsChanged", (accounts: string[]) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
        } else {
          setAccount(null);
          setError("No accounts found. Please reconnect your wallet.");
        }
      });

      provider.on("chainChanged", () => {
        window.location.reload();
      });
    }
  }, [provider]);

  return (
    <div>
      {connected && account ? (
        <div>
          <p>Connected Account: {account}</p>
          <button onClick={disconnectWallet}>Disconnect Wallet</button>
        </div>
      ) : (
        <div>
          <button onClick={connectWallet}>Connect Wallet</button>
          {error && <p style={{ color: "red" }}>{error}</p>}
        </div>
      )}
    </div>
  );
};

export default WalletConnector;
