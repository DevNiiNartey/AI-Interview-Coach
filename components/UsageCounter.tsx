"use client"

const UsageCounter = ({ usage }: { usage: UserUsage }) => {
    if (usage.subscriptionTier === "pro") return null;

    return (
        <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2 bg-dark-200 rounded-full px-4 py-2">
                <span>💬</span>
                <span className="text-light-100">
                    {usage.textInterviewsRemaining} of 5 text interviews remaining
                </span>
            </div>
            <div className="flex items-center gap-2 bg-dark-200 rounded-full px-4 py-2">
                <span>🎙️</span>
                <span className="text-light-100">
                    {usage.voiceInterviewsRemaining} of 1 voice interview remaining
                </span>
            </div>
        </div>
    );
};

export default UsageCounter;
