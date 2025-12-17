// src/components/Poll.jsx
import { useState } from "react";
import "../styles/Poll.css";

export default function Poll({ poll, onVote }) {
    const [selectedOption, setSelectedOption] = useState(null);
    const [hasVoted, setHasVoted] = useState(false);

    const handleVote = (optionIndex) => {
        if (hasVoted) return;

        setSelectedOption(optionIndex);
        setHasVoted(true);
        onVote?.(optionIndex);
    };

    const totalVotes = poll.options.reduce((sum, opt) => sum + (opt.votes || 0), 0);

    const getPercentage = (votes) => {
        if (totalVotes === 0) return 0;
        return Math.round((votes / totalVotes) * 100);
    };

    return (
        <div className="poll">
            <div className="poll-question">
                📊 {poll.question}
            </div>

            {poll.options.map((option, index) => {
                const percentage = getPercentage(option.votes || 0);
                const isSelected = selectedOption === index;

                return (
                    <button
                        key={index}
                        className={`poll-option ${isSelected ? "selected" : ""} ${hasVoted ? "disabled" : ""}`}
                        onClick={() => handleVote(index)}
                        disabled={hasVoted}
                    >
                        {hasVoted && (
                            <div
                                className="poll-bar"
                                style={{ width: `${percentage}%` }}
                            />
                        )}
                        <div className="poll-option-text">
                            <span>{option.text}</span>
                            {hasVoted && (
                                <span className="poll-percentage">
                                    {percentage}%
                                </span>
                            )}
                        </div>
                    </button>
                );
            })}

            {hasVoted && (
                <div className="poll-total">
                    {totalVotes} vote{totalVotes !== 1 ? "s" : ""} au total
                </div>
            )}
        </div>
    );
}
