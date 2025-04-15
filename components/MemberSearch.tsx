import { useState } from "react";

interface MemberSearchProps {
  onSearch: (memberId: string) => void;
}

export default function MemberSearch({ onSearch }: MemberSearchProps) {
  const [memberId, setMemberId] = useState("696875");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(memberId);
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4">
      <input
        type="number"
        value={memberId}
        onChange={(e) => setMemberId(e.target.value)}
        placeholder="696875"
        className="p-2 border rounded"
      />
      <button type="submit" className="ml-2 p-2 bg-blue-500 text-white rounded">
        Search
      </button>
    </form>
  );
}
