"use client";

import React from "react";
import { Inter } from "next/font/google";
import NavBar from "./componants/NavBar";
import { AccountProvider } from "./context/AccountContext";
import { PrivyProvider } from "@privy-io/react-auth";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (

    <html lang="en">
 
      <body className={inter.className}>
      <PrivyProvider
          appId="clzo969qv00otb7t90m9k47tr" // Replace with your actual Privy app ID
          config={{
            appearance: {
            theme: 'light',
            accentColor: '#676FFF',
            logo: "/icons/logo.png"
          },
          embeddedWallets: {
            createOnLogin: 'users-without-wallets',
          },
        }}
      >
        <AccountProvider>
          <NavBar />
          {children}
        </AccountProvider>
        </PrivyProvider>
      </body>
    </html>
  );
}

