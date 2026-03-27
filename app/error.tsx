"use client"

import {useEffect} from "react";
import Link from "next/link";

const Error = ({error, reset}: { error: Error & { digest?: string }; reset: () => void }) => {
    useEffect(() => {
        console.error("Application error:", error);
    }, [error]);

    return (
        <div className="flex-center min-h-screen flex-col gap-6 px-4">
            <div className="card-border">
                <div className="card flex flex-col items-center gap-6 py-14 px-10 text-center">
                    <h1 className="text-primary-100 text-4xl font-bold">Oops!</h1>
                    <h2 className="text-primary-100 text-xl">Something Went Wrong</h2>
                    <p className="text-light-100 max-w-md">
                        An unexpected error occurred. Please try again or return to the home page.
                    </p>
                    <div className="flex gap-4">
                        <button onClick={reset} className="btn-primary">
                            Try Again
                        </button>
                        <Link href="/" className="btn-secondary">
                            Go Home
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Error;
