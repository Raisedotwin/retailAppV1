"use client";

import StakePage from "./stake/page";
import { PrivyProvider } from '@privy-io/react-auth'; // Import PrivyProvider
import { use } from "react";
import HoldingsPage from "./holdings/page";


export default function Home() {
  return (
    <div >
      <HoldingsPage />
    </div>
  );
}
