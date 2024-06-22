"use client";
import SearchBar from "@/components/SearchBar";
import Image from "next/image";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

export default function Home() {
  return (
    <main>
      <div className="flex flex-col gap-6 font-semibold absolute top-[37vh] left-[10vw]">
        <div className="text-[var(--primary-color)] text-6xl">Lie Down</div>
        <div className="flex flex-row gap-4">
          <div className="flex text-3xl font-normal items-end text-[var(--secondary-color)]">
            while you
          </div>{" "}
          <div className="text-6xl text-[var(--secondary-color)]">Real-Time Results</div>
        </div>
        <button className="mt-4 rounded-xl pl-6 pr-4 py-3 bg-[var(--primary-color)] w-fit flex flex-row gap-[6px] items-center justify-center">
          Start Interview
          <ArrowForwardIcon sx={{ color: "white", fontSize: 24 }} />
        </button>
      </div>
    </main>
  );
}
