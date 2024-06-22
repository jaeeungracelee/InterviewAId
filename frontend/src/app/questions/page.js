"use client";
import React, { useState, useEffect, useRef } from "react";

import Image from "next/image";
import HomeIcon from "@mui/icons-material/Home";
import KeyboardReturnIcon from "@mui/icons-material/KeyboardReturn";
import Link from "next/link";
import SearchBar from "@/components/SearchBar";
import { useRouter } from "next/navigation";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

export default function Questions() {
  const [curTyping, setCurTyping] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [curIndex, setCurIndex] = useState(0);
  const questions = [
    "Hey there! What is your name?",
    "Thank you! What is the company you are applying for?",
    "Great! What is the job title you are applying for?",
    "Finally, please copy and paste your job description.",
  ];
  const router = useRouter();

  const [answers, setAnswers] = useState([]);

  const typing = (text) => {
    setIsTyping(true);
    let i = 0;
    const interval = setInterval(() => {
      setCurTyping(questions[curIndex].slice(0, i));
      i++;
      if (i >= text.length) {
        clearInterval(interval);
        if (curIndex < questions.length) {
          setCurTyping("");
          setIsTyping(false);
          setCurIndex((prev) => prev + 1);
        }
      }
    }, 20);
  };

  const submitAnswer = (answer) => {
    setAnswers((prev) => [...prev, answer]);
    if (curIndex < questions.length) {
      typing(questions[curIndex]);
    }
  };

  const messageBottomRef = useRef(null);
  useEffect(() => {
    if (messageBottomRef.current) {
      messageBottomRef.current.scrollTop =
        messageBottomRef.current.scrollHeight;
    }
  }, [answers]);

  useEffect(() => {
    typing(questions[curIndex]);
  }, []);

  return (
    <div className="w-full h-[100vh] questions-background">
      <div className="w-[80%] h-[100vh] flex flex-col items-center">
        <Link
          className="absolute top-6 left-6 border-2 border-[var(--primary-color)] p-[6px] rounded-2xl"
          href="/"
        >
          <KeyboardReturnIcon
            sx={{ color: "var(--primary-color)", fontSize: 32 }}
          />
        </Link>
        <div
          ref={messageBottomRef}
          className="messages flex flex-col h-full pt-8 pb-8 gap-4 w-[700px]"
        >
          {questions
            .filter((_, i) => i < curIndex)
            .map((q, i) => (
              <div className="section flex flex-col gap-3">
                <div className="flex flex-col gap-2">
                  <div className="font-semibold text-[var(--primary-color)]">
                    Engine:
                  </div>
                  <div className="text-white rounded-lg">{q}</div>
                </div>
                {answers[i] && (
                  <div className="flex flex-col gap-2 items-end">
                    <div className="font-semibold text-[var(--primary-color)]">
                      You:
                    </div>
                    <div className="text-white rounded-lg">{answers[i]}</div>
                  </div>
                )}
              </div>
            ))}
          {isTyping && (
            <div className="section flex flex-col gap-2">
              <div className="font-semibold text-[var(--primary-color)]">
                Engine:
              </div>
              <div className="text-white rounded-lg">{curTyping}</div>
            </div>
          )}
        </div>
        <div
          className={"w-full absolute bottom-6 flex flex-row justify-center ".concat(
            answers.length == questions.length && "hidden"
          )}
        >
          <SearchBar submitAnswer={submitAnswer} />
        </div>
      </div>
      {answers.length == questions.length && (
        <Link
          href="/"
          className="absolute bottom-6 right-6 rounded-xl pl-6 pr-4 py-3 bg-[var(--primary-color)] w-fit flex flex-row gap-[6px] items-center justify-center"
        >
          Start Interview
          <ArrowForwardIcon sx={{ color: "white", fontSize: 24 }} />
        </Link>
      )}
    </div>
  );
}
