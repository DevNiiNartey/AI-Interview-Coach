"use client"

import { useState } from "react";
import Link from "next/link";

const FREE_FEATURES = [
  "5 text interviews / month",
  "1 voice interview / month",
  "AI-powered feedback & scoring",
  "Interview history & filtering",
  "STAR method guidance",
];

const PRO_FEATURES = [
  "Unlimited text interviews",
  "Unlimited voice interviews",
  "AI-powered feedback & scoring",
  "Interview history & filtering",
  "STAR method guidance",
  "Priority AI processing",
  "Early access to new features",
];

const PricingCards = ({ currentTier }: { currentTier: string }) => {
  const [billing, setBilling] = useState<"monthly" | "annual">("annual");
  const isPro = currentTier === "pro";

  const monthlyPrice = 19;
  const annualPrice = 12;
  const price = billing === "annual" ? annualPrice : monthlyPrice;

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Billing toggle */}
      <div className="flex justify-center gap-2">
        <button
          onClick={() => setBilling("monthly")}
          className={`px-4 py-2 rounded-full text-sm transition-all cursor-pointer ${
            billing === "monthly"
              ? "bg-primary-200 text-dark-100 font-bold"
              : "bg-dark-200 text-light-100"
          }`}
        >
          Monthly
        </button>
        <button
          onClick={() => setBilling("annual")}
          className={`px-4 py-2 rounded-full text-sm transition-all cursor-pointer ${
            billing === "annual"
              ? "bg-primary-200 text-dark-100 font-bold"
              : "bg-dark-200 text-light-100"
          }`}
        >
          Annual <span className="text-xs opacity-75">Save 37%</span>
        </button>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Free tier */}
        <div className="card-border">
          <div className="card p-8 flex flex-col gap-6 h-full">
            <div>
              <h3 className="text-primary-100">Free</h3>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-4xl font-bold text-white">$0</span>
                <span className="text-light-400">/month</span>
              </div>
              <p className="text-light-400 text-sm mt-2">Get started with interview practice</p>
            </div>
            <ul className="flex flex-col gap-3 flex-1">
              {FREE_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-light-100">
                  <span className="text-success-100 mt-0.5">&#10003;</span>
                  {f}
                </li>
              ))}
            </ul>
            {!isPro ? (
              <div className="btn-secondary text-center w-full opacity-60">Current Plan</div>
            ) : (
              <div className="btn-secondary text-center w-full opacity-40">Free Tier</div>
            )}
          </div>
        </div>

        {/* Pro tier */}
        <div className="card-border relative">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary-200 text-dark-100 px-4 py-1 rounded-full text-xs font-bold z-10">
            Most Popular
          </div>
          <div className="card p-8 flex flex-col gap-6 h-full border-2 border-primary-200/30 rounded-2xl">
            <div>
              <h3 className="text-primary-100">Pro</h3>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-4xl font-bold text-white">${price}</span>
                <span className="text-light-400">/month</span>
              </div>
              {billing === "annual" && (
                <p className="text-success-100 text-sm mt-1">
                  Billed ${annualPrice * 12}/year (save ${(monthlyPrice - annualPrice) * 12}/year)
                </p>
              )}
              <p className="text-light-400 text-sm mt-2">Unlimited practice for serious job seekers</p>
            </div>
            <ul className="flex flex-col gap-3 flex-1">
              {PRO_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-light-100">
                  <span className="text-primary-200 mt-0.5">&#10003;</span>
                  {f}
                </li>
              ))}
            </ul>
            {isPro ? (
              <Link href="/api/stripe/portal" className="btn-secondary text-center w-full">
                Manage Billing
              </Link>
            ) : (
              <Link
                href={`/api/stripe/checkout?billing=${billing}`}
                className="btn-primary text-center w-full"
              >
                Upgrade to Pro
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingCards;
