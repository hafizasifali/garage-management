type Props = {
    value: string;
    states: { id: string; name: string }[];
};

export default function StatusBadge({ value, states }: Props) {
    const colorMap: Record<string, string> = {
        draft: 'bg-gray-100 text-gray-800 border-gray-300',
        confirmed: 'bg-blue-100 text-blue-800 border-blue-300',
        received: 'bg-green-100 text-green-800 border-green-300',
        cancelled: 'bg-red-100 text-red-800 border-red-300',

        pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
        in_progress: 'bg-indigo-100 text-indigo-800 border-indigo-300',
        completed: 'bg-green-100 text-green-800 border-green-300',
    };

    const label = states.find((s) => s.id === value)?.name ?? value;

    return (
        <span
            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                colorMap[value] ?? 'bg-gray-100 text-gray-800 border-gray-300'
            }`}
        >
      {label}
    </span>
    );
}
