"use client";

import {
  ArrowDownIcon,
  BankIcon,
  BuildingsIcon,
  HandHeartIcon,
  LockIcon,
  UserCircleIcon,
} from "@phosphor-icons/react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import { FEE_DISTRIBUTION } from "@/lib/dbc";

const FLOW_DATA = [
  {
    id: "platform",
    label: "Platform Fees",
    percent: FEE_DISTRIBUTION.platform,
    description: "Operating costs for Parity",
    icon: BuildingsIcon,
    color: "var(--primary)",
  },
  {
    id: "meteora",
    label: "Liquidity Pool",
    percent: FEE_DISTRIBUTION.meteora,
    description: "Meteora liquidity pool",
    icon: BankIcon,
    color: "var(--primary)",
  },
  {
    id: "creator",
    label: "Creator",
    percent: FEE_DISTRIBUTION.creator,
    description: "Direct to creator supplies wallet",
    icon: UserCircleIcon,
    color: "var(--primary)",
  },
  {
    id: "charity",
    label: "Charity",
    percent: FEE_DISTRIBUTION.charity,
    description: "Creators choosing, verified",
    icon: HandHeartIcon,
    color: "var(--primary)",
  },
];

export function FeeDistributionFlow() {
  // Use state to track "live" transaction simulations
  const [activeTx, setActiveTx] = useState<{
    id: number;
    amount: number;
  } | null>(null);

  // Track if component has mounted to prevent re-animations on scroll
  const [isMounted, setIsMounted] = useState(false);

  const triggerTransaction = useCallback(() => {
    // Generate a slightly larger buy amount so the split decimals aren't too tiny
    const randomBuyAmount = (Math.random() * 20 + 5).toFixed(1);
    setActiveTx({ id: Date.now(), amount: Number.parseFloat(randomBuyAmount) });
  }, []);

  // Simulate a live transaction stream
  useEffect(() => {
    // Set mounted to trigger animations once
    setIsMounted(true);

    // Initial delay for entrance
    const timer = setTimeout(triggerTransaction, 500);

    // Regular interval synced with animation duration
    const interval = setInterval(triggerTransaction, 6000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [triggerTransaction]);

  return (
    <div className="w-full py-12">
      <div className="mx-auto max-w-5xl px-4">
        {/* Container for the flowchart */}
        <div className="relative flex flex-col items-center gap-12 md:flex-row md:items-stretch md:justify-center md:gap-0">
          {/* Source Node (The simulated Transaction) */}
          <div className="relative z-10 flex flex-col items-center justify-center py-4">
            <div className="group relative flex min-h-[260px] min-w-[320px] flex-col items-center justify-center gap-3 rounded-[2.5rem] border border-primary/30 bg-background/60 p-12 shadow-2xl shadow-primary/10 backdrop-blur-3xl transition-all hover:border-primary/50">
              {/* Live Transactions Label */}
              <div className="absolute top-5 left-6 flex items-center gap-2">
                <div className="relative flex size-2 items-center justify-center">
                  <div className="absolute inset-0 animate-ping rounded-full bg-primary/50" />
                  <div className="relative size-2 rounded-full bg-primary" />
                </div>
                <span className="font-bold font-mono text-[10px] text-primary uppercase tracking-widest">
                  Live Transactions
                </span>
              </div>
              {/* Inner Glow */}
              <div className="absolute inset-0 -z-10 rounded-[2.5rem] bg-gradient-to-br from-primary/5 via-transparent to-transparent" />

              <div className="relative flex h-[120px] w-full flex-col items-center justify-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className="flex w-full flex-col items-center gap-1"
                    exit={{ opacity: 0, scale: 1.03, y: -10 }}
                    initial={{ opacity: 0, scale: 0.97, y: 10 }}
                    key={activeTx?.id}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <div className="font-black font-mono text-5xl text-primary tracking-tighter md:text-6xl">
                      {activeTx ? activeTx.amount.toFixed(1) : "0.0"}{" "}
                      <span className="text-2xl">SOL</span>
                    </div>
                    <div className="mt-1 text-center font-bold text-[10px] text-muted-foreground uppercase tracking-[0.4em] transition-colors group-hover:text-primary/70">
                      Order Volume
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="mt-4 h-px w-12 bg-primary/20" />

              <div className="flex flex-col items-center gap-1">
                <div className="h-7 overflow-hidden">
                  <AnimatePresence mode="wait">
                    <motion.div
                      animate={{ opacity: 1, y: 0 }}
                      className="font-black font-mono text-lg text-primary/90"
                      exit={{ opacity: 0, y: -5 }}
                      initial={{ opacity: 0, y: 5 }}
                      key={activeTx?.id}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                    >
                      {activeTx ? (activeTx.amount * 0.01).toFixed(3) : "0.000"}{" "}
                      SOL
                    </motion.div>
                  </AnimatePresence>
                </div>
                <div className="font-bold font-mono text-[9px] text-primary/40 uppercase tracking-widest">
                  1% Protocol Fee
                </div>
              </div>
            </div>

            {/* Mobile Arrow */}
            <div className="mt-8 block md:hidden">
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2 }}
              >
                <ArrowDownIcon
                  className="size-6 text-primary/50"
                  weight="bold"
                />
              </motion.div>
            </div>
          </div>

          {/* Desktop Connector Lines (SVG) */}
          <div className="relative hidden w-40 md:flex">
            <svg
              className="absolute inset-0 h-full w-full"
              fill="none"
              preserveAspectRatio="none"
              viewBox="0 0 100 100"
              xmlns="http://www.w3.org/2000/svg"
            >
              <title>Fee Distribution Flow</title>
              {/* Main horizontal approach */}
              <motion.line
                animate={isMounted ? { pathLength: 1 } : { pathLength: 0 }}
                initial={{ pathLength: 0 }}
                stroke="url(#lineGradient)"
                strokeOpacity="0.4"
                strokeWidth="1.5"
                transition={{ duration: 1 }}
                x1="0"
                x2="45"
                y1="50"
                y2="50"
              />
              {/* Vertical trunk */}
              <motion.line
                animate={isMounted ? { pathLength: 1 } : { pathLength: 0 }}
                initial={{ pathLength: 0 }}
                stroke="url(#lineGradient)"
                strokeOpacity="0.4"
                strokeWidth="1.5"
                transition={{ duration: 0.8, delay: 0.5 }}
                x1="45"
                x2="45"
                y1="12.5"
                y2="87.5"
              />
              {/* Branch outs */}
              {[12.5, 37.5, 62.5, 87.5].map((y, i) => (
                <motion.line
                  animate={isMounted ? { pathLength: 1 } : { pathLength: 0 }}
                  initial={{ pathLength: 0 }}
                  key={y}
                  stroke="url(#lineGradient)"
                  strokeOpacity="0.4"
                  strokeWidth="1.5"
                  transition={{ duration: 0.8, delay: 0.8 + i * 0.1 }}
                  x1="45"
                  x2="100"
                  y1={y}
                  y2={y}
                />
              ))}
              <defs>
                <linearGradient
                  gradientUnits="userSpaceOnUse"
                  id="lineGradient"
                  x1="0"
                  x2="100"
                  y1="50"
                  y2="50"
                >
                  <stop stopColor="var(--primary)" stopOpacity="0" />
                  <stop offset="0.2" stopColor="var(--primary)" />
                  <stop offset="0.8" stopColor="var(--primary)" />
                  <stop offset="1" stopColor="var(--primary)" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>

            {/* Animated Flow Particles */}
            <div className="pointer-events-none absolute inset-0">
              <AnimatePresence>
                {activeTx && (
                  <motion.div
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    initial={{ opacity: 0 }}
                    key={activeTx.id}
                    transition={{ duration: 0.5 }}
                  >
                    {FLOW_DATA.map((item, i) => {
                      const targetY = [12.5, 37.5, 62.5, 87.5][i];

                      // CORRECT FEE MATH:
                      // 1. Total Fee = Buy Amount * 0.01 (1%)
                      // 2. Share = Fee Total * (Lane %)
                      const feeTotal = activeTx.amount * 0.01;
                      const feeShare = (
                        feeTotal *
                        (item.percent / 100)
                      ).toFixed(3);

                      return (
                        <motion.div
                          animate={{
                            left: ["0%", "45%", "45%", "100%", "100%"],
                            top: [
                              "50%",
                              "50%",
                              `${targetY}%`,
                              `${targetY}%`,
                              `${targetY}%`,
                            ],
                            opacity:
                              i === 0 ? [1, 1, 1, 1, 0] : [0, 0, 1, 1, 0],
                          }}
                          className="absolute flex flex-col items-center justify-center"
                          key={`${activeTx.id}-${item.id}`}
                          style={{
                            width: "60px",
                            height: "60px",
                            marginLeft: "-30px",
                            marginTop: "-30px",
                            zIndex: 20,
                          }}
                          transition={{
                            duration: 4.5,
                            times: [0, 0.4, 0.6, 0.9, 1],
                            ease: "easeInOut",
                          }}
                        >
                          {/* Amount Reveal */}
                          <motion.div
                            animate={{
                              opacity: [0, 0, 1, 1, 0],
                              scale: [0.5, 0.5, 1, 1, 0],
                            }}
                            className="absolute -top-3 flex flex-col items-center"
                            transition={{
                              times: [0, 0.45, 0.55, 0.9, 1],
                              duration: 4.5,
                            }}
                          >
                            <span className="whitespace-nowrap font-black font-mono text-primary text-xs drop-shadow-[0_0_8px_rgba(255,140,61,0.5)]">
                              {feeShare}
                            </span>
                          </motion.div>

                          <div className="relative flex size-6 items-center justify-center">
                            <div className="absolute inset-0 size-full animate-pulse rounded-full bg-primary/30 blur-md" />
                            <svg
                              className="z-10 size-full"
                              fill="none"
                              height="88"
                              viewBox="0 0 101 88"
                              width="101"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M100.48 69.3817L83.8068 86.8015C83.4444 87.1799 83.0058 87.4816 82.5185 87.6878C82.0312 87.894 81.5055 88.0003 80.9743 88H1.93563C1.55849 88 1.18957 87.8926 0.874202 87.6912C0.558829 87.4897 0.31074 87.2029 0.160416 86.8659C0.0100923 86.529 -0.0359181 86.1566 0.0280382 85.7945C0.0919944 85.4324 0.263131 85.0964 0.520422 84.8278L17.2061 67.408C17.5676 67.0306 18.0047 66.7295 18.4904 66.5234C18.9762 66.3172 19.5002 66.2104 20.0301 66.2095H99.0644C99.4415 66.2095 99.8104 66.3169 100.126 66.5183C100.441 66.7198 100.689 67.0067 100.84 67.3436C100.99 67.6806 101.036 68.0529 100.972 68.415C100.908 68.7771 100.737 69.1131 100.48 69.3817ZM83.8068 34.3032C83.4444 33.9248 83.0058 33.6231 82.5185 33.4169C82.0312 33.2108 81.5055 33.1045 80.9743 33.1048H1.93563C1.55849 33.1048 1.18957 33.2121 0.874202 33.4136C0.558829 33.6151 0.31074 33.9019 0.160416 34.2388C0.0100923 34.5758 -0.0359181 34.9482 0.0280382 35.3103C0.0919944 35.6723 0.263131 36.0083 0.520422 36.277L17.2061 53.6968C17.5676 54.0742 18.0047 54.3752 18.4904 54.5814C18.9762 54.7875 19.5002 54.8944 20.0301 54.8952H99.0644C99.4415 54.8952 99.8104 54.7879 100.126 54.5864C100.441 54.3849 100.689 54.0981 100.84 53.7612C100.99 53.4242 101.036 53.0518 100.972 52.6897C100.908 52.3277 100.737 51.9917 100.48 51.723L83.8068 34.3032ZM1.93563 21.7905H80.9743C81.5055 21.7907 82.0312 21.6845 82.5185 21.4783C83.0058 21.2721 83.4444 20.9704 83.8068 20.592L100.48 3.17219C100.737 2.90357 100.908 2.56758 100.972 2.2055C101.036 1.84342 100.99 1.47103 100.84 1.13408C100.689 0.79713 100.441 0.510296 100.126 0.308823C99.8104 0.107349 99.4415 1.24074e-05 99.0644 0L20.0301 0C19.5002 0.000878397 18.9762 0.107699 18.4904 0.313848C18.0047 0.519998 17.5676 0.821087 17.2061 1.19848L0.524723 18.6183C0.267681 18.8866 0.0966198 19.2223 0.0325185 19.5839C-0.0315829 19.9456 0.0140624 20.3177 0.163856 20.6545C0.31365 20.9913 0.561081 21.2781 0.875804 21.4799C1.19053 21.6817 1.55886 21.7896 1.93563 21.7905Z"
                                fill="url(#solanaGradient)"
                              />
                              <defs>
                                <linearGradient
                                  gradientUnits="userSpaceOnUse"
                                  id="solanaGradient"
                                  x1="8.52558"
                                  x2="88.9933"
                                  y1="90.0973"
                                  y2="-3.01622"
                                >
                                  <stop offset="0.08" stopColor="#9945FF" />
                                  <stop offset="0.3" stopColor="#8752F3" />
                                  <stop offset="0.5" stopColor="#5497D5" />
                                  <stop offset="0.6" stopColor="#43B4CA" />
                                  <stop offset="0.72" stopColor="#28E0B9" />
                                  <stop offset="0.97" stopColor="#19FB9B" />
                                </linearGradient>
                              </defs>
                            </svg>
                          </div>
                        </motion.div>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Destination Nodes (The Cards) */}
          <div className="relative flex w-full flex-col md:w-auto">
            {/* Locked Contract Link */}
            <a
              className="absolute -top-10 left-1/2 -translate-x-1/2 inline-flex w-fit items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-4 py-1.5 font-bold text-[11px] text-primary uppercase tracking-wider transition-all hover:bg-primary/10 hover:shadow-[0_0_15px_rgba(255,140,61,0.1)]"
              href="https://solscan.io/account/Eo7WjKq67rjJQSvbdBk6iA54uH3jJm61e9W888fS5E3m"
              rel="noopener noreferrer"
              target="_blank"
            >
              <LockIcon className="size-3.5" weight="bold" />
              Locked Contract
            </a>

            <div className="grid grid-rows-4 gap-4 md:gap-0">
            {FLOW_DATA.map((item, index) => (
              <div
                className="flex min-h-[100px] items-center md:h-24 md:min-h-0"
                key={item.id}
              >
                <motion.div
                  className="group relative flex h-[90px] w-full items-center gap-5 rounded-2xl border border-border/60 bg-background/50 p-5 transition-all hover:border-primary/50 hover:bg-background/80 md:ml-0 md:min-w-[340px]"
                  initial={{ opacity: 0, x: 20 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  viewport={{ once: true, margin: "0px 0px -50px 0px" }}
                  whileInView={{ opacity: 1, x: 0 }}
                >
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/5 text-primary shadow-inner transition-colors group-hover:bg-primary/10">
                    <item.icon className="size-6" weight="bold" />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <div className="mb-0.5 flex items-center justify-between">
                      <h3 className="mr-2 truncate font-bold text-foreground/90 text-sm tracking-tight">
                        {item.label}
                      </h3>
                      <div className="flex shrink-0 flex-col items-end self-center">
                        <span className="font-black font-mono text-primary text-xl leading-none">
                          {item.percent}%
                        </span>
                      </div>
                    </div>
                    <p className="max-w-[180px] truncate text-[11px] text-muted-foreground/70 leading-tight">
                      {item.description}
                    </p>
                  </div>

                  <div className="absolute top-1/2 -left-1.5 -ml-[1px] hidden size-3 -translate-y-1/2 rotate-45 border-primary/30 border-b border-l bg-background/80 md:block" />
                </motion.div>
              </div>
            ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
