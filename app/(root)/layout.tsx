import React, {ReactNode} from 'react'
import Link from "next/link";
import Image from "next/image";
import SignOutButton from "@/components/SignOutButton";

const RootLayout = ({children}:{children:ReactNode}) => {
    return (
        <div className="root-layout">
            <nav className="flex justify-between items-center border-b border-dark-200 pb-4">
                <Link href="/" className="flex items-center gap-2">
                    <Image src="/logo.svg" alt="logo" height={32} width={38}/>
               <h2 className="text-primary-100">AI Coach</h2>
                </Link>
                <SignOutButton />
            </nav>
            {children}
        </div>
    )
}
export default RootLayout
