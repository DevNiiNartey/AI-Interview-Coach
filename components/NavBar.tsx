import Link from "next/link";
import Image from "next/image";
import SignOutButton from "@/components/SignOutButton";
import { getCurrentUser } from "@/lib/actions/auth.action";

export default async function NavBar() {
    const user = await getCurrentUser();
    const isPro = user?.subscriptionTier === "pro";

    return (
        <nav className="flex justify-between items-center border-b border-dark-200 pb-4">
            <Link href="/" className="flex items-center gap-2">
                <Image src="/logo.svg" alt="logo" height={32} width={38} />
                <h2 className="text-primary-100">AI Coach</h2>
                {isPro && (
                    <span className="bg-primary-200 text-dark-100 text-xs font-bold px-2 py-0.5 rounded-full ml-1">
                        PRO
                    </span>
                )}
            </Link>
            <div className="flex items-center gap-3">
                {isPro && (
                    <Link href="/api/stripe/portal" className="text-light-400 text-sm hover:text-primary-100 transition-colors">
                        Manage Billing
                    </Link>
                )}
                {!isPro && user && (
                    <Link href="/pricing" className="text-light-400 text-sm hover:text-primary-100 transition-colors">
                        Upgrade
                    </Link>
                )}
                <SignOutButton />
            </div>
        </nav>
    );
}
