"use client";

import React from "react";
import PerpsForm from "../componants/PerpsForm";
import HowToTrade from "../componants/HowToTrade";

const PerpsPage: React.FC = () => (
  <div className="min-h-screen p-6" style={{ backgroundColor: "#edf2f7" }}>
    <div className="max-w-6xl mx-auto flex flex-col lg:flex-row justify-center items-start gap-6 p-6">
      {/* Perps Form Component */}
      <PerpsForm />

      {/* How to Trade Component */}
      <HowToTrade />
    </div>
  </div>
);

export default PerpsPage;
