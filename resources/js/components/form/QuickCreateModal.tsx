import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { useForm } from '@inertiajs/react';
import axios from 'axios';
import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { route } from 'ziggy-js';
import FormRenderer from './FormRenderer';

export default function QuickCreateModal({
    open,
    title,
    fields,
    options,
    routeName,
    defaultValues = {},
    onClose,
    onCreated,
}) {
    const form = useForm({});

    useEffect(() => {
        if (open) {
            form.setData(defaultValues);
        }
    }, [open]);

    const submit = async () => {
        try {
            const res = await axios.post(route(routeName), form.data);

            const record = res.data.record ?? {
                id: res.data.id,
                name: res.data.name,
            };

            toast.success(`${record.name} created successfully`);
            onCreated(record.id, record.name, record);
        } catch (error: any) {
            if (error.response?.status === 422) {
                const errors = error.response.data.errors;

                // Flatten errors for toast
                const messages = Object.values(errors).flat();
                messages.forEach((msg) => toast.error(msg));
            } else {
                toast.error('Something went wrong. Please try again.');
            }
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-xl">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>

                <FormRenderer
                    fields={fields}
                    form={form}
                    columns={1}
                    options={options}
                />

                <div className="mt-4 flex justify-end gap-2">
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button onClick={submit} disabled={form.processing}>
                        Save
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
