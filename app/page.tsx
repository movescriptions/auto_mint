"use client";

import { executeTransaction, executeStop } from "@/utils/mint";
import { useRef, useState } from "react";
import "./simpleAnimation.css";

export default function Home() {
  const [isAnimating, setIsAnimating] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const secondsRef = useRef<HTMLInputElement>(null);
  const tickRef = useRef<HTMLInputElement>(null);
  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    executeTransaction(
      inputRef.current?.value!,
      Number(secondsRef.current?.value!),
      tickRef.current?.value!
    );
    setIsAnimating(true);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-gray-100">
      <form onSubmit={submit}>
        <div
          className={`bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 ${
            isAnimating ? "animate-bg" : ""
          }`}
        >
          <input
            ref={tickRef}
            type="text"
            placeholder="Tick you wanna mint(default is LONG)"
            defaultValue={"LONG"}
            required
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
          <input
            ref={inputRef}
            type="text"
            required
            placeholder="Enter your wallet Private key"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
          <input
            ref={secondsRef}
            type="number"
            placeholder="Enter mint interval (seconds) default is 10"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
          <div className="flex justify-between mt-4">
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Start
            </button>
            <button
              type="button"
              onClick={() => {
                setIsAnimating(false);
                executeStop();
              }}
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Stop
            </button>
          </div>
        </div>
      </form>
    </main>
  );
}
