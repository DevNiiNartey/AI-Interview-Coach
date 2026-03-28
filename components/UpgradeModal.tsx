"use client"

import Link from "next/link";

const UpgradeModal = ({ message, onClose }: { message: string; onClose: () => void }) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
            <div className="card-border max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
                <div className="card p-8 flex flex-col items-center gap-6 text-center">
                    <div className="text-4xl">🚀</div>
                    <h3 className="text-primary-100">Upgrade to Pro</h3>
                    <p className="text-light-100 text-sm">{message}</p>
                    <div className="flex flex-col sm:flex-row gap-3 w-full">
                        <Link href="/pricing" className="btn-primary flex-1 text-center">
                            View Pricing
                        </Link>
                        <button onClick={onClose} className="btn-secondary flex-1">
                            Maybe Later
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UpgradeModal;
