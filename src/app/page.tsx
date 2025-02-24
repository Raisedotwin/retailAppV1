"use client";

import StakePage from "./stake/page";
import { PrivyProvider } from '@privy-io/react-auth'; // Import PrivyProvider
import { use } from "react";
import HoldingsPage from "./holdings/page";
import MarketplacePage from "./marketplace/page";


export default function Home() {
  return (
    <div >
      <MarketplacePage />
    </div>
  );
}
