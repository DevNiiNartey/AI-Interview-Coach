"use client"

import {z} from "zod"
import {zodResolver} from "@hookform/resolvers/zod"
import {useForm} from "react-hook-form"
import {Button} from "@/components/ui/button"
import {
    Form
} from "@/components/ui/form"
import Image from "next/image";
import Link from "next/link";
import {toast} from "sonner";
import FormField from "@/components/FormField";


const authFormSchema = (type: FormType) => {
    return z.object({
        name: type === 'sign-up' ? z.string().min(3).max(20) : z.string().optional(),
        email: z.string().email(),
        password: z.string().min(8).max(20),
    })
}

const AuthForm = ({type}: { type: FormType }) => {

    const formSchema = authFormSchema(type)
    // 1. Define your form.
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            email: "",
            password: ""

        },
    })

    // 2. Define a submit handler.
    function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            if (type === 'sign-up') {
                console.log("sign in", values)
            } else {
                console.log("sign up", values)
            }
        } catch (e) {
            console.log(e)
            toast.error(`An error occurred: ${e}`)
        }
    }

    const isSignIn = type === "sign-in";

    return (
        <div className="card-border lg:min-w-[566px]">
            <div className="flex flex-col gap-6 card py-14 px-10">
                <div className="flex flex-row gap-2 justify-center">
                    <Image src="/logo.svg" alt="logo" height={32} width={38}/>
                    <h2>AI Coach</h2>
                </div>
                <h3>Practice Job Interviews with AI</h3>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-6 mt-4 form">
                        {!isSignIn && (
                            <FormField control={form.control}
                                       name="name"
                                       label="Name"
                                       placeholder="Your Name"/>)}
                        <FormField control={form.control}
                                   name="email"
                                   label="email"
                                   placeholder="Your Email address" type="email"/>
                        <FormField control={form.control}
                                   name="password"
                                   label="password"
                                   placeholder="Enter your password" type="password"/>
                        <Button type="submit"
                                className="btn">{isSignIn ? 'Sign In' : 'Create an Account'}</Button>
                    </form>
                </Form>
                <p className="text-center">{isSignIn ? 'Don\'t have an account?' : 'Have an Account already'}
                    <Link
                        href={!isSignIn ? '/sign-in' : '/sign-up'}
                        className="font-bold text-user-primary ml-1">{!isSignIn ? "Sign In" : "Sign Up"}</Link>
                </p>
            </div>
        </div>


    )
}
export default AuthForm
