"use client"

import {useState} from "react";
import {useRouter} from "next/navigation";
import {toast} from "sonner";
import {signOut as serverSignOut} from "@/lib/actions/auth.action";

const SignOutButton = () => {
    const router = useRouter();
    const [isPending, setIsPending] = useState(false);

    const handleSignOut = async () => {
        if (isPending) return;
        setIsPending(true);

        try {
            // Clear Firebase client auth state (lazy import to avoid SSR bundle issues)
            const {auth} = await import("@/firebase/client");
            const {signOut: firebaseSignOut} = await import("firebase/auth");
            await firebaseSignOut(auth);
        } catch {
            // Best-effort — server cookie deletion is the real auth gate
        }

        try {
            const result = await serverSignOut();
            if (result?.success) {
                router.replace('/sign-in');
            } else {
                toast.error(result?.message || "Failed to sign out");
            }
        } catch {
            toast.error("Failed to sign out");
        } finally {
            setIsPending(false);
        }
    };

    return (
        <button onClick={handleSignOut} disabled={isPending} className="btn-secondary flex items-center gap-2">
            {isPending ? "Signing out..." : "Sign Out"}
        </button>
    );
};

export default SignOutButton;
