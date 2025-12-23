import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

type Column<T> = {
    label: string;
    render: (row: T) => React.ReactNode;
};

type Props<T> = {
    data: T[];
    columns: Column<T>[];
    selected: number[];
    toggleAll: () => void;
    toggleOne: (id: number) => void;
};

export default function DataTable<T extends { id: number }>({
    data,
    columns,
    selected,
    toggleAll,
    toggleOne,
}: Props<T>) {
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>
                        <input
                            type="checkbox"
                            checked={selected.length === data.length}
                            onChange={toggleAll}
                        />
                    </TableHead>
                    {columns.map((c, i) => (
                        <TableHead key={i}>{c.label}</TableHead>
                    ))}
                </TableRow>
            </TableHeader>

            <TableBody>
                {data.map((row) => (
                    <TableRow key={row.id}>
                        <TableCell>
                            <input
                                type="checkbox"
                                checked={selected.includes(row.id)}
                                onChange={() => toggleOne(row.id)}
                            />
                        </TableCell>

                        {columns.map((c, i) => (
                            <TableCell key={i}>{c.render(row)}</TableCell>
                        ))}
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}
