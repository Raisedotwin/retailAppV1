"use client";

import Image from "next/image";
import LeaderboardPage from "./positions/page";
import StakePage from "./stake/page";
import { PrivyProvider } from '@privy-io/react-auth'; // Import PrivyProvider
import { use } from "react";


export default function Home() {
  return (
    <div >
      <StakePage />
    </div>
  );
}
