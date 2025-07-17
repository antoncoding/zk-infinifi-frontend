'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAccount } from 'wagmi';
import { Button } from '@/components/common/Button';
import Header from '@/components/layout/header/Header';

export default function HomePage() {
  const [showWeb3, setShowWeb3] = useState(true);
  const [techIndex, setTechIndex] = useState(0);
  const [secondCounter, setSecondCounter] = useState(0);

  const techTerms = ['Next.js', 'TypeScript', 'Tailwind'];
  const secondPhrases = ['Web3 Template', 'Ready to Build'];

  useEffect(() => {
    // Toggle between web3 and modern every 5 seconds
    const web3Interval = setInterval(() => {
      setShowWeb3((prev) => !prev);
    }, 5000);

    // Change tech terms every 3 seconds when showing modern
    const techInterval = setInterval(() => {
      if (!showWeb3) {
        setTechIndex((prev) => (prev + 1) % techTerms.length);
      }
    }, 3000);

    // Second segment changes every 4 seconds
    const secondInterval = setInterval(() => {
      setSecondCounter((prev) => (prev + 1) % secondPhrases.length);
    }, 4000);

    return () => {
      clearInterval(web3Interval);
      clearInterval(techInterval);
      clearInterval(secondInterval);
    };
  }, [showWeb3]);

  const renderFirstPhrase = () => {
    if (showWeb3) {
      return (
        <span className="absolute inset-0 flex items-center justify-center text-primary transition-all duration-700 ease-in-out">
          Modern Web3
        </span>
      );
    }
    return (
      <span className="absolute inset-0 flex items-center justify-center transition-all duration-700 ease-in-out">
        <span className="-ml-8 inline-flex items-center text-primary">
          Built with
          <span className="relative mx-2 inline-flex items-center md:mx-4">
            {techTerms.map((term, index) => (
              <span
                key={term}
                className={`absolute left-0 text-primary transition-all duration-700 ease-in-out ${
                  index === techIndex
                    ? 'transform-none opacity-100'
                    : 'translate-y-3 transform opacity-0'
                }`}
              >
                {term}
              </span>
            ))}
          </span>
        </span>
      </span>
    );
  };

  const { address } = useAccount();

  return (
    <div className="bg-main flex min-h-screen flex-col">
      <Header ghost />
      <main className="container mx-auto flex flex-1 flex-col items-center justify-center">
        <section className="flex w-full flex-col items-center justify-center">
          <div className="h-48 w-full sm:h-44 sm:w-4/5 md:w-3/5">
            <h2 className="mb-2 flex flex-col gap-6 px-4 text-center font-zen text-3xl leading-tight text-secondary sm:mb-10 sm:text-4xl md:text-5xl">
              <div className="relative h-[1.3em]">{renderFirstPhrase()}</div>
              <div className="relative h-[1.3em]">
                {secondPhrases.map((phrase, index) => (
                  <span
                    key={phrase}
                    className={`absolute left-0 right-0 transform transition-all duration-700 ease-in-out ${
                      index === secondCounter
                        ? 'translate-y-0 opacity-100'
                        : index ===
                          (secondCounter - 1 + secondPhrases.length) % secondPhrases.length
                        ? 'translate-y-2 opacity-0'
                        : '-translate-y-2 opacity-0'
                    }`}
                  >
                    {phrase}
                  </span>
                ))}
              </div>
            </h2>
          </div>
          <div className="mt-8 flex w-full justify-center gap-4 px-4 sm:w-auto sm:flex-row">
            <Link href="/docs" className="block w-full sm:w-auto">
              <Button variant="default" className="w-full px-10 py-4 font-zen" size="lg">
                Documentation
              </Button>
            </Link>
            <Link href="/demo" className="block w-full sm:w-auto">
              <Button variant="cta" className="w-full px-10 py-4 font-zen" size="lg">
                Get Started
              </Button>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
