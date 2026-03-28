import React, {ReactNode} from 'react'
import NavBar from "@/components/NavBar";

const RootLayout = ({children}:{children:ReactNode}) => {
    return (
        <div className="root-layout">
            <NavBar />
            {children}
        </div>
    )
}
export default RootLayout
