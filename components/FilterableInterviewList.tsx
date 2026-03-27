"use client"

import {useMemo, useState} from "react";
import InterviewCardClient from "@/components/InterviewCardClient";

export interface EnrichedInterview {
    id: string;
    role: string;
    type: string;
    techstack: string[];
    createdAt: string;
    feedbackId?: string;
    feedbackScore?: number;
    feedbackAssessment?: string;
    finalized: boolean;
}

type SortOption = "newest" | "oldest" | "highest-score";

const FilterableInterviewList = ({interviews}: { interviews: EnrichedInterview[] }) => {
    const [typeFilter, setTypeFilter] = useState("All");
    const [roleFilter, setRoleFilter] = useState("All");
    const [sortBy, setSortBy] = useState<SortOption>("newest");

    const uniqueRoles = useMemo(() => {
        const roles = new Set(interviews.map((i) => i.role));
        return ["All", ...Array.from(roles).sort()];
    }, [interviews]);

    const typeOptions = ["All", "Technical", "Behavioral", "Mixed"];

    const filtersActive = typeFilter !== "All" || roleFilter !== "All";

    const filteredAndSorted = useMemo(() => {
        let result = [...interviews];

        if (typeFilter !== "All") {
            result = result.filter((i) => {
                const normalized = /mix/gi.test(i.type) ? "Mixed" : i.type;
                return normalized === typeFilter;
            });
        }

        if (roleFilter !== "All") {
            result = result.filter((i) => i.role === roleFilter);
        }

        result.sort((a, b) => {
            switch (sortBy) {
                case "newest":
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                case "oldest":
                    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                case "highest-score": {
                    const scoreA = a.feedbackScore ?? -1;
                    const scoreB = b.feedbackScore ?? -1;
                    return scoreB - scoreA;
                }
                default:
                    return 0;
            }
        });

        return result;
    }, [interviews, typeFilter, roleFilter, sortBy]);

    const clearFilters = () => {
        setTypeFilter("All");
        setRoleFilter("All");
        setSortBy("newest");
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row flex-wrap gap-4 items-stretch sm:items-center">
                <div className="flex flex-col gap-1">
                    <label className="text-sm text-light-100">Type</label>
                    <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        className="bg-dark-200 text-primary-100 rounded-full px-4 py-2 text-sm border border-dark-200 cursor-pointer w-full sm:w-auto"
                    >
                        {typeOptions.map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                        ))}
                    </select>
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-sm text-light-100">Role</label>
                    <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className="bg-dark-200 text-primary-100 rounded-full px-4 py-2 text-sm border border-dark-200 cursor-pointer w-full sm:w-auto"
                    >
                        {uniqueRoles.map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                        ))}
                    </select>
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-sm text-light-100">Sort</label>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as SortOption)}
                        className="bg-dark-200 text-primary-100 rounded-full px-4 py-2 text-sm border border-dark-200 cursor-pointer w-full sm:w-auto"
                    >
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                        <option value="highest-score">Highest Score</option>
                    </select>
                </div>

                {filtersActive && (
                    <button onClick={clearFilters} className="btn-secondary sm:mt-5 text-sm w-full sm:w-auto">
                        Clear Filters
                    </button>
                )}
            </div>

            <div className="interviews-section">
                {filteredAndSorted.length > 0 ? (
                    filteredAndSorted.map((interview) => (
                        <InterviewCardClient
                            key={interview.id}
                            id={interview.id}
                            role={interview.role}
                            type={interview.type}
                            techstack={interview.techstack}
                            createdAt={interview.createdAt}
                            feedbackId={interview.feedbackId}
                            feedbackScore={interview.feedbackScore}
                            feedbackAssessment={interview.feedbackAssessment}
                        />
                    ))
                ) : (
                    <p className="text-light-100">No interviews match your filters</p>
                )}
            </div>
        </div>
    );
};

export default FilterableInterviewList;
