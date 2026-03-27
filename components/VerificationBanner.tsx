"use client"

import { useState } from "react";
import { toast } from "sonner";
import { resendVerificationEmail } from "@/lib/actions/email.action";

const VerificationBanner = ({ userId, emailVerified }: { userId: string; emailVerified?: boolean }) => {
    const [sending, setSending] = useState(false);

    if (emailVerified) return null;

    const handleResend = async () => {
        if (sending) return;
        setSending(true);
        const result = await resendVerificationEmail(userId);
        if (result.success) {
            toast.success("Verification email sent! Check your inbox.");
        } else {
            toast.error(result.message || "Failed to resend email");
        }
        setSending(false);
    };

    return (
        <div className="w-full bg-yellow-900/30 border border-yellow-600/40 rounded-xl px-6 py-4 flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
                <span className="text-yellow-400 text-lg">&#9888;</span>
                <p className="text-yellow-200 text-sm">
                    Please verify your email address. Check your inbox for a verification link.
                </p>
            </div>
            <button
                onClick={handleResend}
                disabled={sending}
                className="btn-secondary text-sm !min-h-8 !px-4"
            >
                {sending ? "Sending..." : "Resend Verification"}
            </button>
        </div>
    );
};

export default VerificationBanner;
