import {Button} from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import {dummyInterviews} from "@/constants";
import InterviewCard from "@/components/InterviewCard";

export default function Page() {
    return (
        <>
            <section className="card-cta">
                <div className="flex flex-col gap-6 max-w-lg">
                    <h2>Get Interview-Ready with AI-Powered Practice and Feedback</h2>
                    <p>Practice on real interview questions and get instance feedback</p>
                    <Button asChild className="btn-primary max-sm:w-full">
                        <Link href="/interview">Start an Interview</Link>
                    </Button>
                </div>

                <Image src="/robot.png" alt="robot" width={400} height={400} className="max-sm:hidden"/>

            </section>

            <section className="flex flex-col gap-6 mt-8">
                <h2>Your Interviews</h2>
                <div className="interview sections">
                    {dummyInterviews.map(interview => <InterviewCard key={interview.id} {...interview}/>)}
                </div>
            </section>

            <section className="flex flex-col gap-6 mt-8">
                <h2>Take your Interview</h2>
                <div className="inteviews-section">
                    {dummyInterviews.map(interview => <InterviewCard key={interview.id} {...interview}/>)}
               {/*<p>You haven&apos;t taken an interview yet</p>*/}
                </div>
            </section>
        </>
    )
}