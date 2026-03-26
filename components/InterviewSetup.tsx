"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  roleOptions,
  levelOptions,
  interviewTypeOptions,
  techStackOptions,
} from "@/constants";
import { createInterview } from "@/lib/actions/interview.action";
import { toast } from "sonner";
import Image from "next/image";

export default function InterviewSetup({ userId }: { userId: string }) {
  const router = useRouter();
  const [role, setRole] = useState("");
  const [level, setLevel] = useState("Junior");
  const [type, setType] = useState("Technical");
  const [mode, setMode] = useState<"voice" | "text">("voice");
  const [selectedTech, setSelectedTech] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const toggleTech = (tech: string) => {
    setSelectedTech((prev) =>
      prev.includes(tech) ? prev.filter((t) => t !== tech) : [...prev, tech]
    );
  };

  const handleSubmit = async () => {
    if (!role) {
      toast.error("Please select a role");
      return;
    }
    if (selectedTech.length === 0) {
      toast.error("Please select at least one technology");
      return;
    }

    setLoading(true);
    try {
      const result = await createInterview({
        role,
        level,
        techstack: selectedTech,
        type,
        mode,
        userId,
      });

      if (result.success && result.interviewId) {
        toast.success("Interview created! Starting session...");
        router.push(`/interview/${result.interviewId}`);
      } else {
        toast.error(result.message || "Failed to create interview");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 max-w-3xl w-full">
      <div className="flex flex-col gap-2">
        <h2>Start a New Interview</h2>
        <p>Configure your practice interview session</p>
      </div>

      {/* Mode Toggle */}
      <div className="flex flex-col gap-3">
        <label className="text-light-100 font-semibold">Interview Mode</label>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setMode("voice")}
            className={`flex-1 flex items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all cursor-pointer ${
              mode === "voice"
                ? "border-primary-200 bg-primary-200/10"
                : "border-dark-200 bg-dark-200/50 hover:border-light-600"
            }`}
          >
            <Image src="/ai-avatar.png" alt="voice" width={32} height={32} />
            <div className="text-left">
              <p className="font-semibold text-white">Voice Interview</p>
              <p className="text-sm text-light-400">AI speaks with you in real-time</p>
            </div>
          </button>
          <button
            type="button"
            onClick={() => setMode("text")}
            className={`flex-1 flex items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all cursor-pointer ${
              mode === "text"
                ? "border-primary-200 bg-primary-200/10"
                : "border-dark-200 bg-dark-200/50 hover:border-light-600"
            }`}
          >
            <span className="text-2xl">💬</span>
            <div className="text-left">
              <p className="font-semibold text-white">Text Interview</p>
              <p className="text-sm text-light-400">Chat-based with STAR guidance</p>
            </div>
          </button>
        </div>
      </div>

      {/* Role Selection */}
      <div className="flex flex-col gap-3">
        <label className="text-light-100 font-semibold">Target Role</label>
        <div className="flex flex-wrap gap-2">
          {roleOptions.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={`px-4 py-2 rounded-full text-sm transition-all cursor-pointer ${
                role === r
                  ? "bg-primary-200 text-dark-100 font-bold"
                  : "bg-dark-200 text-light-100 hover:bg-dark-200/80"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Level Selection */}
      <div className="flex flex-col gap-3">
        <label className="text-light-100 font-semibold">Experience Level</label>
        <div className="flex flex-wrap gap-2">
          {levelOptions.map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setLevel(l)}
              className={`px-4 py-2 rounded-full text-sm transition-all cursor-pointer ${
                level === l
                  ? "bg-primary-200 text-dark-100 font-bold"
                  : "bg-dark-200 text-light-100 hover:bg-dark-200/80"
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* Interview Type */}
      <div className="flex flex-col gap-3">
        <label className="text-light-100 font-semibold">Interview Type</label>
        <div className="flex flex-wrap gap-2">
          {interviewTypeOptions.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={`px-4 py-2 rounded-full text-sm transition-all cursor-pointer ${
                type === t
                  ? "bg-primary-200 text-dark-100 font-bold"
                  : "bg-dark-200 text-light-100 hover:bg-dark-200/80"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Tech Stack */}
      <div className="flex flex-col gap-3">
        <label className="text-light-100 font-semibold">
          Tech Stack{" "}
          <span className="text-light-400 font-normal">
            ({selectedTech.length} selected)
          </span>
        </label>
        <div className="flex flex-wrap gap-2">
          {techStackOptions.map((tech) => (
            <button
              key={tech}
              type="button"
              onClick={() => toggleTech(tech)}
              className={`px-3 py-1.5 rounded-full text-sm transition-all cursor-pointer ${
                selectedTech.includes(tech)
                  ? "bg-primary-200 text-dark-100 font-bold"
                  : "bg-dark-200 text-light-100 hover:bg-dark-200/80"
              }`}
            >
              {tech}
            </button>
          ))}
        </div>
      </div>

      {/* Summary & Start */}
      <div className="card-border">
        <div className="card p-6 flex flex-col gap-4">
          <h3>Interview Summary</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-light-400">Mode</p>
              <p className="text-white font-semibold capitalize">{mode}</p>
            </div>
            <div>
              <p className="text-light-400">Role</p>
              <p className="text-white font-semibold">{role || "Not selected"}</p>
            </div>
            <div>
              <p className="text-light-400">Level</p>
              <p className="text-white font-semibold">{level}</p>
            </div>
            <div>
              <p className="text-light-400">Type</p>
              <p className="text-white font-semibold">{type}</p>
            </div>
          </div>
          {selectedTech.length > 0 && (
            <div>
              <p className="text-light-400 text-sm">Tech Stack</p>
              <p className="text-white text-sm">{selectedTech.join(", ")}</p>
            </div>
          )}
          <Button
            onClick={handleSubmit}
            disabled={loading || !role || selectedTech.length === 0}
            className="btn-primary w-full !text-center mt-2"
          >
            {loading ? "Generating Questions..." : `Start ${mode === "voice" ? "Voice" : "Text"} Interview`}
          </Button>
        </div>
      </div>
    </div>
  );
}
