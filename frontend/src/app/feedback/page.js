"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

export default function FeedbackPage() {
  const randomText =
    "It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for 'lorem ipsum' will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like).";
  const [behaviorRes, setBehaviorRes] = useState("");
  const [techRes, setTechRes] = useState("");
  useEffect(() => {
    setBehaviorRes(randomText);
    setTechRes(randomText);
  });
  return (
    <div className="questions-background w-full h-screen">
      <div className="flex flex-col gap-6 p-10 h-screen w-3/5">
        <h1 className="text-3xl font-semibold text-[var(--primary-color)]">
          Results from your interview
        </h1>
        <div className="border-2 border-[var(--secondary-color)] p-6 rounded-2xl">
          <div className="text-lg mb-1 text-[var(--primary-color)]">
            Technical Questions:
          </div>
          <div className="text-sm">{techRes}</div>
        </div>
        <div className="border-2 border-[var(--secondary-color)] p-6 rounded-2xl">
          <div className="text-lg mb-1 text-[var(--primary-color)]">
            Behavorial Comments:
          </div>
          <div className="text-sm">{behaviorRes}</div>
        </div>
        <div className="flex flex-row gap-2 items-center">
          <Link
            href="/questions"
            className="font-semibold rounded-xl pl-6 pr-4 py-3 bg-[var(--primary-color)] w-fit flex flex-row gap-[6px] items-center justify-center text-black"
          >
            Take Another Interview
            <ArrowForwardIcon sx={{ color: "black", fontSize: 24 }} />
          </Link>
          <div className="text-lg ml-1">or</div>
          <Link
            href="/"
            className="underline text-lg text-[var(--primary-color)]"
          >
            back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
