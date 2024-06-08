// components/PriceChart.tsx
import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import axios from "axios";

const PriceChart = () => {
  const [priceData, setPriceData] = useState<any[]>([]);
  const [interval, setInterval] = useState<string>("7");

  useEffect(() => {
    const fetchPriceData = async () => {
      try {
        const response = await axios.get(
          `https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=${interval}`
        );
        const formattedData = response.data.prices.map(
          (price: [number, number]) => ({
            time: new Date(price[0]).toLocaleDateString(),
            price: price[1],
          })
        );
        setPriceData(formattedData);
      } catch (error) {
        console.error("Failed to fetch price data:", error);
      }
    };

    fetchPriceData();
  }, [interval]);

  return (
    <div>
      <div>
        <button onClick={() => setInterval("1")}>1D</button>
        <button onClick={() => setInterval("7")}>1W</button>
        <button onClick={() => setInterval("30")}>1M</button>
      </div>
      <ResponsiveContainer width="100%" height={600}>
        <LineChart data={priceData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="price" stroke="#8884d8" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PriceChart;
