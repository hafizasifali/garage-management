import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { BreadcrumbItem } from '@/types';
import { route } from 'ziggy-js';
import toast from 'react-hot-toast';
import { useConfirm } from '@/hooks/useConfirm';
import { useState } from 'react';

export default function Index() {
    const { companies } = usePage().props as any;
    const form = useForm();
    const { confirm } = useConfirm();

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Companies',
            href: route('companies.index'),
        },
    ];

    /* -------------------- Bulk selection -------------------- */
    const [selected, setSelected] = useState<number[]>([]);

    const toggleAll = () => {
        setSelected(
            selected.length === companies.length
                ? []
                : companies.map((c: any) => c.id)
        );
    };

    const toggleOne = (id: number) => {
        setSelected((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
        );
    };

    /* -------------------- Single delete -------------------- */
    const handleDelete = async (id: number, name: string) => {
        const ok = await confirm({
            title: 'Delete Company?',
            text: `Company "${name}" will be permanently removed.`,
            confirmText: 'Delete',
        });

        if (!ok) return;

        form.delete(route('companies.destroy', id), {
            preserveScroll: true,
            onSuccess: () => toast.success(`"${name}" deleted`),
        });
    };

    /* -------------------- Bulk delete -------------------- */
    const handleBulkDelete = async () => {
        const ok = await confirm({
            title: 'Delete selected companies?',
            text: `${selected.length} companies will be permanently removed.`,
            confirmText: 'Delete all',
        });

        if (!ok) return;

        form.post(route('companies.bulk-delete'), {
            data: { ids: selected },
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Companies deleted');
                setSelected([]);
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Companies" />

            <div className="p-4 space-y-4">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <h1 className="text-xl font-bold">Companies</h1>

                    <div className="flex gap-2">
                        {selected.length > 0 && (
                            <Button
                                variant="destructive"
                                onClick={handleBulkDelete}
                            >
                                Delete ({selected.length})
                            </Button>
                        )}

                        <Button asChild className="bg-gray-700 hover:bg-gray-800">
                            <Link href={route('companies.create')}>
                                Create
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-10">
                                    <input
                                        type="checkbox"
                                        checked={
                                            companies.length > 0 &&
                                            selected.length === companies.length
                                        }
                                        onChange={toggleAll}
                                    />
                                </TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Phone</TableHead>
                                <TableHead>Country</TableHead>
                                <TableHead>Currency</TableHead>
                                <TableHead>Active</TableHead>
                                <TableHead className="text-right">
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {companies.map((company: any) => (
                                <TableRow
                                    key={company.id}
                                    className="h-10 text-sm"
                                >
                                    <TableCell>
                                        <input
                                            type="checkbox"
                                            checked={selected.includes(
                                                company.id
                                            )}
                                            onChange={() =>
                                                toggleOne(company.id)
                                            }
                                        />
                                    </TableCell>

                                    <TableCell>{company.name}</TableCell>
                                    <TableCell>{company.email}</TableCell>
                                    <TableCell>{company.phone}</TableCell>
                                    <TableCell>
                                        {company.country?.name}
                                    </TableCell>
                                    <TableCell>
                                        {company.currency?.name}
                                    </TableCell>
                                    <TableCell>
                                        {company.active ? 'Yes' : 'No'}
                                    </TableCell>

                                    <TableCell className="flex justify-end gap-2">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            asChild
                                        >
                                            <Link
                                                href={route(
                                                    'companies.edit',
                                                    company.id
                                                )}
                                            >
                                                Edit
                                            </Link>
                                        </Button>

                                        <Button
                                            size="sm"
                                            variant="destructive"
                                            onClick={() =>
                                                handleDelete(
                                                    company.id,
                                                    company.name
                                                )
                                            }
                                        >
                                            Delete
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </AppLayout>
    );
}
