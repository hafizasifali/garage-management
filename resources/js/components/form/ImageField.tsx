import { cn } from '@/lib/utils';
import { useRef, useState } from 'react';

type Props = {
    name: string;
    label?: string;
    value: string | File | null;
    error?: string;
    onChange: (file: File | null) => void;
};

export default function ImageField({
    name,
    label,
    value,
    error,
    onChange,
}: Props) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [dragging, setDragging] = useState(false);

    const preview =
        value instanceof File
            ? URL.createObjectURL(value)
            : value
                ? `/storage/${value}`  // ✅ points to Laravel public disk
                : null;


    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragging(false);

        const file = e.dataTransfer.files[0];
        if (file) onChange(file);
    };

    return (
        <div className="w-full">


            {/* DROPZONE */}
            <div
                onClick={() => inputRef.current?.click()}
                onDragOver={(e) => {
                    e.preventDefault();
                    setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                className={cn(
                    'flex h-48 w-full cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed transition',
                    dragging ? 'border-primary bg-primary/5' : 'border-muted',
                    error && 'border-destructive',
                )}
            >
                {preview ? (
                    <div className="relative">
                        <img
                            src={preview}
                            className="h-32 w-32 rounded-md object-cover"
                        />

                        {/* REMOVE BUTTON */}
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                onChange(null);
                            }}
                            className="absolute -top-2 -right-2 rounded bg-destructive px-2 py-1 text-xs text-white"
                        >
                            ✕
                        </button>
                    </div>
                ) : (
                    <>
                        <svg
                            className="mb-3 h-8 w-8 text-muted-foreground"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeWidth={2}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M7 16a4 4 0 01-.88-7.903A5.5 5.5 0 1115.9 6H16a3 3 0 010 6h-1m-4 5v-9m0 0l-3 3m3-3l3 3"
                            />
                        </svg>

                        <p className="text-center text-sm">
                            <span className="font-semibold">
                                Click to upload
                            </span>{' '}
                            or drag & drop
                        </p>

                        <p className="text-xs text-muted-foreground">
                            PNG, JPG, GIF up to 2MB
                        </p>
                    </>
                )}

                <input
                    ref={inputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => onChange(e.target.files?.[0] || null)}
                />
            </div>

            {error && <p className="mt-1 text-sm text-destructive">{error}</p>}
        </div>
    );
}
