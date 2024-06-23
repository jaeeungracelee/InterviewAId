import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import SearchIcon from "@mui/icons-material/Search";
import RightArrow from "@mui/icons-material/ArrowForward";

export default function SearchBar({ submitAnswer }) {
  const router = useRouter();
  const [value, setValue] = useState("");
  const textAreaRef = useRef(null);
  useEffect(() => {
    if (textAreaRef) {
      textAreaRef.current.style.height = "0px";
      const scrollHeight = textAreaRef.current.scrollHeight;
      textAreaRef.current.style.height = scrollHeight + "px";
    }
  }, [textAreaRef, value]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submitAnswer(value);
      setValue("");
    }
  };

  return (
    <div className="w-[700px] flex flex-col relative justify-center items-center">
      <SearchIcon color="disabled" className="absolute left-4" />
      <textarea
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Write here..."
        onKeyDown={handleKeyDown}
        ref={textAreaRef}
        rows={1}
        className="search-bar w-full max-h-[50vh] border-[3px] border-[var(--primary-color)] px-12 py-3 rounded-[24px] text-black disabled:bg-[var(--primary-bg)] disabled:cursor-not-allowed"
      />
      <button
        className="bg-[var(--primary-color)] text-white py-1 px-1 rounded-full absolute right-2"
        onClick={() => submitAnswer(value)}
      >
        <RightArrow />
      </button>
    </div>
  );
}
