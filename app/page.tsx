"use client";

import { useState } from "react";
import MemberSearch from "../components/MemberSearch";
import MemberStats from "../components/MemberStats";

export default function Home() {
  const [memberId, setMemberId] = useState("");

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl mb-4">iRacing Stats</h1>
      <MemberSearch onSearch={setMemberId} />
      <MemberStats memberId={memberId} />
    </div>
  );
}
