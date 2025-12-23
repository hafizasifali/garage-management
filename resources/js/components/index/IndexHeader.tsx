import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import ViewToggle from './ViewToggle';

type Props = {
    title: string;
    createUrl: string;
    view: 'list' | 'kanban';
    onViewChange: (v: 'list' | 'kanban') => void;
    bulkCount?: number;
    onBulkDelete?: () => void;
};

export default function IndexHeader({
    title,
    createLink,
    view,
    onViewChange,
    bulkCount = 0,
    onBulkDelete,
}: Props) {
    return (
        <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold">{title}</h1>

            <div className="flex gap-2 items-center">
                {bulkCount > 0 && (
                    <Button
                        size="sm"
                        variant="destructive"
                        onClick={onBulkDelete}
                    >
                        Delete ({bulkCount})
                    </Button>
                )}

                <ViewToggle view={view} onChange={onViewChange} />

                <Button asChild>
                    <Link href={createLink}>Create</Link>
                </Button>
            </div>
        </div>
    );
}
