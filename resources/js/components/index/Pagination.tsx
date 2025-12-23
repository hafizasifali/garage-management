import { router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';

type Props = {
    meta: {
        from: number;
        to: number;
        total: number;
        links: Array<{
            url: string | null;
            label: string;
            active: boolean;
        }>;
    };
};

export default function Pagination({ meta }: Props) {
    if (!meta?.links?.length) return null;

    return (
        <div className="flex justify-between items-center text-sm">
            {/* Left: showing text */}
            <div className="text-muted-foreground">
                Showing {meta.from}–{meta.to} of {meta.total}
            </div>

            {/* Right: page buttons */}
            <div className="flex gap-1">
                {meta.links.map((link, index) => (
                    <Button
                        key={index}
                        size="sm"
                        variant={link.active ? 'default' : 'outline'}
                        disabled={!link.url}
                        onClick={() => link.url && router.get(link.url)}
                        dangerouslySetInnerHTML={{
                            __html: link.label,
                        }}
                    />
                ))}
            </div>
        </div>
    );
}
