"use client";
import React, { useState, useEffect } from "react";

import Image from "next/image";
import HomeIcon from "@mui/icons-material/Home";
import KeyboardReturnIcon from "@mui/icons-material/KeyboardReturn";
import Link from "next/link";

export default function Questions() {
  const intro =
    "H i there! We are just going to have you answer a few questions about this meeting.";
  const [curTyping, setCurTyping] = useState("");

  const typing = (text) => {
    let i = 0;
    const interval = setInterval(() => {
      setCurTyping((prev) => prev + text.charAt(i)); // Use charAt(i) to get one character at a time
      i++;
      if (i >= text.length) {
        // Adjusted condition to check when i reaches text.length
        clearInterval(interval);
      }
    }, 50);
  };

  useEffect(() => {
    typing(intro);
  }, []);

  return (
    <div className="w-full h-[100vh] flex flex-col items-center bg-black">
      <Link
        className="absolute top-6 left-6 border-2 border-[var(--primary-color)] p-[6px] rounded-2xl"
        href="/"
      >
        <KeyboardReturnIcon
          sx={{ color: "var(--primary-color)", fontSize: 32 }}
        />
      </Link>
      <div className="flex flex-col w-1/2 h-full pt-8 pb-4">
        <div className="flex flex-col gap-2">
          <div className="font-semibold text-[var(--primary-text)]">
            Engine:
          </div>
          <div className="bg-[var(--primary-bg)] rounded-lg">{curTyping}</div>
        </div>
      </div>
    </div>
  );
}
