import Link from "next/link";

const NotFound = () => {
    return (
        <div className="flex-center min-h-screen flex-col gap-6 px-4">
            <div className="card-border">
                <div className="card flex flex-col items-center gap-6 py-14 px-10 text-center">
                    <h1 className="text-primary-100 text-4xl font-bold">404</h1>
                    <h2 className="text-primary-100 text-xl">Page Not Found</h2>
                    <p className="text-light-100 max-w-md">
                        The page you&apos;re looking for doesn&apos;t exist or has been moved.
                    </p>
                    <Link href="/" className="btn-primary">
                        Go Home
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default NotFound;
