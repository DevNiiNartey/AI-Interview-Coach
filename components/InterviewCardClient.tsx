"use client"

import dayjs from "dayjs";
import Image from "next/image";
import Link from "next/link";
import {Button} from "@/components/ui/button";
import {mappings} from "@/constants";
import {cn} from "@/lib/utils";
import {interviewCovers} from "@/constants";

interface InterviewCardClientProps {
    id: string;
    role: string;
    type: string;
    techstack: string[];
    createdAt: string;
    feedbackId?: string;
    feedbackScore?: number;
    feedbackAssessment?: string;
}

const getScoreColor = (score: number) => {
    if (score >= 80) return "text-success-100";
    if (score >= 60) return "text-yellow-400";
    return "text-destructive-100";
};

const getCoverImage = () => {
    const randomIndex = Math.floor(Math.random() * interviewCovers.length);
    return `/covers${interviewCovers[randomIndex]}`;
};

const getTechIconUrl = (tech: string) => {
    const key = tech.toLowerCase().replace(/\.js$/, "").replace(/\s+/g, "");
    const normalized = mappings[key];
    if (!normalized) return "/tech.svg";
    return `https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${normalized}/${normalized}-original.svg`;
};

const InterviewCardClient = ({
    id,
    role,
    type,
    techstack,
    createdAt,
    feedbackId,
    feedbackScore,
    feedbackAssessment,
}: InterviewCardClientProps) => {
    const normalizedType = /mix/gi.test(type) ? "Mixed" : type;
    const formattedDate = dayjs(createdAt || Date.now()).format("MMM D, YYYY");
    const hasFeedback = !!feedbackId && feedbackScore !== undefined;

    return (
        <div className="card-border w-full sm:w-[360px] min-h-96">
            <div className="card-interview">
                <div>
                    <div className="absolute top-0 right-0 w-fit px-4 py-2 rounded-bl-lg bg-light-600">
                        <p className="badge-text">{normalizedType}</p>
                    </div>
                    <Image
                        src={getCoverImage()}
                        alt="cover"
                        width={90}
                        height={90}
                        className="rounded-full object-fit size-[90px]"
                    />
                    <h3 className="mt-5 capitalize">{role} Interview</h3>
                    <div className="flex flex-row gap-5 mt-3">
                        <div className="flex flex-row gap-2">
                            <Image src="/calendar.svg" alt="calendar" width={22} height={22}/>
                            <p>{formattedDate}</p>
                        </div>
                        <div className="flex flex-row gap-2 items-center">
                            <Image src="/star.svg" alt="star" width={22} height={22}/>
                            <p className={hasFeedback ? getScoreColor(feedbackScore!) : ""}>
                                {hasFeedback ? `${feedbackScore}/100` : "---/100"}
                            </p>
                        </div>
                    </div>
                    <p className="line-clamp-2 mt-5">
                        {feedbackAssessment ||
                            "You haven't taken this interview yet. Take it now to improve your skills."}
                    </p>
                </div>
                <div className="flex flex-row justify-between">
                    <div className="flex flex-row">
                        {techstack.slice(0, 3).map((tech, index) => (
                            <div
                                key={tech}
                                className={cn(
                                    "relative group bg-dark-300 rounded-full p-2 flex-center",
                                    index >= 1 && "-ml-3"
                                )}
                            >
                                <span className="tech-tooltip">{tech}</span>
                                <Image
                                    src={getTechIconUrl(tech)}
                                    alt={tech}
                                    width={100}
                                    height={100}
                                    className="size-5"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = "/tech.svg";
                                    }}
                                />
                            </div>
                        ))}
                    </div>
                    <Button className="btn-primary">
                        <Link
                            href={
                                hasFeedback
                                    ? `/interview/${id}/feedback`
                                    : `/interview/${id}`
                            }
                        >
                            {hasFeedback ? "View Feedback" : "Take Interview"}
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default InterviewCardClient;
