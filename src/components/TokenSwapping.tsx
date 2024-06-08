import { useState, useEffect } from "react";
import { Web3Provider } from "@ethersproject/providers";
import { parseUnits, formatUnits } from "@ethersproject/units";
import { BigNumber } from "@ethersproject/bignumber";
import { Contract } from "@ethersproject/contracts";
import axios from "axios";

// Define the 0x Exchange Proxy Address for mainnet
const EXCHANGE_PROXY = "0xdef1c0ded9bec7f1a1670819833240f027b25eff";

// Minimal ERC-20 ABI for necessary functions
const ERC20_ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function balanceOf(address owner) external view returns (uint256)",
  "function decimals() view returns (uint8)",
];

const TokenSwap = ({ provider }: { provider: Web3Provider | null }) => {
  const [fromToken, setFromToken] = useState<string>("ETH"); // Assuming ETH by default
  const [toToken, setToToken] = useState<string>("DAI"); // Defaulting to DAI
  const [amount, setAmount] = useState<string>("");
  const [quote, setQuote] = useState<any>(null);
  const [isApproving, setIsApproving] = useState<boolean>(false);
  const [isSwapping, setIsSwapping] = useState<boolean>(false);
  const [transactionHash, setTransactionHash] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setQuote(null);
    setTransactionHash("");
    setError(null);
  }, [fromToken, toToken, amount]);

  const fetchQuote = async () => {
    if (!provider || !amount || parseFloat(amount) <= 0) {
      setError("Please enter a valid amount.");
      return;
    }

    try {
      // If fromToken is ETH, use a large number for decimals since it's not an ERC-20 token
      const sellAmount =
        fromToken === "ETH"
          ? parseUnits(amount, 18).toString()
          : parseUnits(amount, 18).toString(); // Assuming 18 decimals for simplicity

      const response = await axios.get("https://api.0x.org/swap/v1/quote", {
        params: {
          sellToken: fromToken,
          buyToken: toToken,
          sellAmount,
        },
      });

      setQuote(response.data);
      setError(null); // Clear previous errors
    } catch (error) {
      console.error("Failed to fetch quote:", error);
      setError("Failed to fetch quote. Please try again.");
    }
  };

  const approveToken = async () => {
    if (!provider || !quote) return;

    const signer = provider.getSigner();
    const tokenContract = new Contract(fromToken, ERC20_ABI, signer);

    try {
      setIsApproving(true);
      const amountToApprove = BigNumber.from(quote.sellAmount);

      // Check current allowance
      const allowance = await tokenContract.allowance(
        await signer.getAddress(),
        EXCHANGE_PROXY
      );
      if (allowance.lt(amountToApprove)) {
        // Approve the necessary amount for the swap
        const approveTx = await tokenContract.approve(
          EXCHANGE_PROXY,
          amountToApprove
        );
        await approveTx.wait();
        console.log("Approval successful:", approveTx);
        setError(null); // Clear previous errors
      } else {
        console.log("Sufficient allowance already granted.");
      }
    } catch (error) {
      console.error("Approval failed:", error);
      setError("Failed to approve tokens. Please try again.");
    } finally {
      setIsApproving(false);
    }
  };

  const executeSwap = async () => {
    if (!provider || !quote) return;

    const signer = provider.getSigner();

    try {
      setIsSwapping(true);

      const tx = await signer.sendTransaction({
        to: quote.to,
        data: quote.data,
        value:
          fromToken === "ETH" ? BigNumber.from(quote.value) : BigNumber.from(0), // Set value for ETH swaps
        gasLimit: BigNumber.from(500000), // Default gas limit; you can adjust based on your needs
      });

      setTransactionHash(tx.hash);
      await tx.wait();
      console.log("Swap successful:", tx);
      setError(null); // Clear previous errors
    } catch (error) {
      console.error("Swap failed:", error);
      setError("Failed to execute swap. Please try again.");
    } finally {
      setIsSwapping(false);
    }
  };

  return (
    <div>
      <div>
        <input
          type="text"
          value={fromToken}
          onChange={(e) => setFromToken(e.target.value)}
          placeholder="From Token (address or symbol)"
        />
        <input
          type="text"
          value={toToken}
          onChange={(e) => setToToken(e.target.value)}
          placeholder="To Token (address or symbol)"
        />
        <input
          type="text"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount"
        />
        <button
          onClick={fetchQuote}
          disabled={!provider || isApproving || isSwapping}
        >
          Get Quote
        </button>
      </div>

      {quote && (
        <div>
          <h3>Quote Details:</h3>
          <p>
            Sell Amount: {formatUnits(quote.sellAmount, 18)} {fromToken}
          </p>
          <p>
            Buy Amount: {formatUnits(quote.buyAmount, 18)} {toToken}
          </p>
          <button
            onClick={approveToken}
            disabled={isApproving || isSwapping || fromToken === "ETH"}
          >
            {isApproving ? "Approving..." : "Approve"}
          </button>
          <button
            onClick={executeSwap}
            disabled={
              isSwapping || !provider || (fromToken !== "ETH" && !quote)
            }
          >
            {isSwapping ? "Swapping..." : "Execute Swap"}
          </button>
        </div>
      )}

      {error && <p style={{ color: "red" }}>{error}</p>}
      {transactionHash && (
        <p>
          Swap successful! Transaction hash:{" "}
          <a
            href={`https://etherscan.io/tx/${transactionHash}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {transactionHash}
          </a>
        </p>
      )}
    </div>
  );
};

export default TokenSwap;
