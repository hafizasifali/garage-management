import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useForm, usePage } from '@inertiajs/react';
import FormRenderer from '@/components/form/FormRenderer';

export default function CustomerQuickCreate({
fields,
  open,
  defaultName,
  onCreated,
}) {

  const form = useForm({
    name: defaultName || '',
    email: '',
    phone: '',
    address: '',
    is_company: false,
    active: true,
  });

  const submit = () => {
    form.post(route('customers.quickCreate'), {
      preserveScroll: true,
      onSuccess: (page: any) => {
        onCreated(page.props.created_id, page.props.created_name);
      },
    });
  };

  return (
    <Dialog open={open}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
            <DialogTitle>Create Customer</DialogTitle>
        </DialogHeader>

        <FormRenderer
          fields={fields}
          form={form}
          columns={1}
        />

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => onCreated(null)}>
            Cancel
          </Button>
          <Button onClick={submit}>
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
