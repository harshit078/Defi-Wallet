// pages/index.tsx
import { useState } from "react";
import WalletConnector from "../components/wallet";
import PriceChart from "../components/PriceChart";
import TokenSwap from "../components/TokenSwapping";

const Home = () => {
  const [provider, setProvider] = useState<any>(null);

  return (
    <div>
      <h2>Wallet Connection</h2>
      <WalletConnector />

      <h2>Cryptocurrency Price Chart</h2>
      <PriceChart />

      <h2>Token Swap</h2>
      <TokenSwap provider={provider} />
    </div>
  );
};

export default Home;
