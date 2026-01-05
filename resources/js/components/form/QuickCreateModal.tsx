import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useForm } from '@inertiajs/react';
import FormRenderer from './FormRenderer';
import axios from 'axios';
import { route } from 'ziggy-js';

export default function QuickCreateModal({
  open,
  title,
  fields,
  routeName,
  defaultValues = {},
  onClose,
  onCreated,
}) {
  const form = useForm(defaultValues);

  const submit = async () => {
    const res = await axios.post(route(routeName), form.data);
    onCreated(res.data.id, res.data.name);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <FormRenderer fields={fields} form={form} columns={1} />

        <div className="flex justify-end gap-2 mt-4">
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
