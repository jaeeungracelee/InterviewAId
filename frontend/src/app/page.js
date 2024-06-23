"use client";
import SearchBar from "@/components/SearchBar";
import Image from "next/image";
import Link from "next/link";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import React from 'react'
import VideoFeed from './../components/VideoFeed';

export default function Home() {
  return (
    <main className="h-[100dvh] flex items-center">
      <div className="flex flex-col gap-8 font-semibold mt-20 ml-36">
        <div className="flex flex-col gap-2">
          <div className="text-[var(--secondary-color)] text-4xl">
            Practice with Confidence
          </div>
          <div className="text-8xl text-[var(--secondary-color)]">
            InterviewAId
          </div>
        </div>
        <Link
          href="/questions"
          className="btn"
        >
          Start Interview
          <ArrowForwardIcon sx={{ color: "black", fontSize: 24 }} />
        </Link>
            <div className="App">
        </div>
      </div>
    </main>
  );
}
