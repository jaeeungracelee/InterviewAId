import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import SearchIcon from "@mui/icons-material/Search";
import RightArrow from "@mui/icons-material/ArrowForward";

export default function SearchBar() {
  const router = useRouter();
  const [value, setValue] = useState("");

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      router.push(`/questions?search=${value}`);
    }
  };

  return (
    <div className="mt-4 max-w-[700px] flex flex-col relative justify-center items-center">
      <SearchIcon color="disabled" className="absolute left-4" />
      <textarea
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Enter your meeting link..."
        rows={1}
        onKeyDown={handleKeyDown}
        className="search-bar w-full max-h-[50vh] border-[3px] border-[var(--primary-color)] px-12 py-3 rounded-full text-black"
      />
      <Link
        className="bg-[var(--primary-color)] text-white py-1 px-1 rounded-full absolute right-2"
        href={`/questions?search=${value}`}
      >
        <RightArrow />
      </Link>
    </div>
  );
}
