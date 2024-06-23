"use client";
import SearchBar from "@/components/SearchBar";
import Image from "next/image";
import Link from "next/link";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

export default function Home() {
  return (
    <main className="home-background h-[100vh] flex items-center">
      <div className="flex flex-col gap-12 font-semibold mt-20 ml-36">
        <div className="flex flex-col gap-6">
          <div className="text-[var(--secondary-color)] text-3xl">
            Practice with Confidence
          </div>
          <div className="text-8xl text-[var(--secondary-color)]">
            InterviewAId
          </div>
        </div>
        <Link href="/questions" className="btn">
          Start Interview
          <ArrowForwardIcon sx={{ color: "black", fontSize: 24 }} />
        </Link>
      </div>
    </main>
  );
}
