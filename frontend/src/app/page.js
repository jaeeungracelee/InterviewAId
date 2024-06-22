"use client";
import SearchBar from "@/components/SearchBar";
import Image from "next/image";
import Link from "next/link";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

export default function Home() {
  return (
    <main>
      <div className="flex flex-col gap-6 font-semibold absolute top-[42vh] left-[10vw]">
        <div className="text-[var(--secondary-color)] text-4xl">
          Create your own
        </div>
        <div className="flex flex-row gap-4">
          <div className="flex text-3xl font-normal items-end text-[var(--secondary-color)]">
            while you
          </div>{" "}
          <div className="text-6xl text-[var(--secondary-color)]">Stand Up</div>
        </div>
        <Link
          href="/questions"
          className="mt-4 rounded-xl pl-6 pr-4 py-3 bg-[var(--primary-color)] w-fit flex flex-row gap-[6px] items-center justify-center"
        >
          Start Interview
          <ArrowForwardIcon sx={{ color: "white", fontSize: 24 }} />
        </Link>
      </div>
    </main>
  );
}
