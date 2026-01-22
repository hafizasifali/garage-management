import React from 'react';

export type WorkflowState = {
    id: string;
    name: string;
};

export type WorkflowAction = {
    value: string;
    label: string;
    visibleInStates: string[];
};

type Props = {
    states: WorkflowState[];
    currentState: string;
    onStateChange?: (value: string) => void;
    actions?: WorkflowAction[];
    size?: 'sm' | 'md';
    className?: string;
};

export default function StateBarWithActions({
                                                states,
                                                currentState,
                                                onStateChange,
                                                actions = [],
                                                size = 'md',
                                                className = '',
                                            }: Props) {
    const visibleActions = actions.filter((a) =>
        a.visibleInStates.includes(currentState)
    );

    const sizeClasses = {
        sm: 'px-3 py-1 text-xs',
        md: 'px-4 py-2 text-sm',
    };

    return (
        <div className={`flex items-center justify-between mb-3 p-2 ${className}`}>
            {/* LEFT: Header Action Buttons */}
            <div className="inline-flex items-center gap-2">
                {visibleActions.map((action) => {
                    const active = currentState === action.value;

                    return (
                        <button
                            key={action.value}
                            type="button"
                            onClick={() => onStateChange?.(action.value)}
                            className={`cursor-pointer inline-flex items-center rounded-lg font-medium shadow-sm transition
                ${sizeClasses[size]}
                ${
                                active
                                    ? 'bg-gray-700 text-white hover:bg-gray-800'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }
              `}
                        >
                            {action.label}
                        </button>
                    );
                })}
            </div>

            {/* RIGHT: State Bar */}
            <ol className="pl-3 ml-auto inline-flex items-center bg-gray-200 text-sm text-gray-500 sm:text-base relative">
                {states.map((state, index) => {
                    const active = currentState === state.id;

                    return (
                        <li key={state.id} className="flex items-center">
                            <button
                                type="button"
                                // onClick={() => onStateChange?.(state.id)}
                                className={`-ml-3 px-5 py-1 transition
                  ${active
                                    ? 'bg-gray-700 rounded-l-md text-white border border-gray-500'
                                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}
                `}
                            >
                                {state.name}
                            </button>

                            {/* Arrow */}
                            {index !== states.length - 1 && (
                                <span
                                    className={`w-6 h-6 transform rotate-45 -ml-3 border border-l-0 border-b-0 transition
                    ${active
                                        ? 'bg-gray-700 border-gray-500'
                                        : 'bg-gray-200 border-gray-300'}
                  `}
                                />
                            )}
                        </li>
                    );
                })}
            </ol>
        </div>
    );
}
