'use server'

import {auth, db} from "@/firebase/admin";
import {cookies} from "next/headers";


const ONE_WEEK = 60 * 60 * 24 * 7;

export async function signUp(params: SignUpParams) {
    const {uid, name, email} = params;
    try {
        const userRecord = await db.collection('users').doc(uid).get();

        if (userRecord.exists) {
            return {success: false, message: "User already exists, Please sign in instead"}
        }

        await db.collection("users").doc(uid).set({
            name,
            email,
        })

    } catch (e: any) {
        console.error("Error creating user: ", e)
        if (e.code === "auth/email-already-in-use") {
            return {
                success: false,
                message: "Email already in use"
            }
        }
        return {
            success: false,
            message: e.message || "Failed to create user account"
        }
    }
}

export async function signIn(params: SignInParams) {
    const {email, idToken} = params;

    try {
        const userRecord = await auth.getUserByEmail(email);

        if (!userRecord) {
            return {
                success: false,
                message: "User does not exist. Create an account instead"
            }
        }
        await setSessionCookie(idToken);

    } catch (e: any) {
        console.error("Error signing in: ", e)
        return {
            success: false,
            message: e.message || "Failed to sign in"
        }
    }

}

export async function setSessionCookie(idToken: string) {


    const cookieStore = await cookies();

    const sessionCookie = await auth.createSessionCookie(idToken, {
        expiresIn: ONE_WEEK * 1000,
    })

    const cookieStore.set('session', sessionCookie, {
        maxAge: ONE_WEEK,
        httpOnly: true,
        path: '/',
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
    });

}

