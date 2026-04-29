import { Head, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { route } from 'ziggy-js';
import toast from 'react-hot-toast';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';

type Permission = {
    id: number;
    name: string;
    feature: string;
};

type Role = {
    id: number;
    name: string;
    permissions: string[];
};

type Props = {
    roles: Role[];
    permissionsByFeature: Record<string, Permission[]>;
};

const ACTION_ORDER = ['view', 'create', 'edit', 'delete', 'export', 'manage'];

function getAction(permissionName: string): string {
    const parts = permissionName.split(' ');
    return parts[parts.length - 1];
}

export default function AccessControlIndex() {
    const { roles, permissionsByFeature } = usePage().props as unknown as Props;
    const [activeRoleId, setActiveRoleId] = useState<number>(roles[0]?.id);

    const activeRole = roles.find((r) => r.id === activeRoleId)!;

    const { data, setData, put, processing } = useForm({
        permissions: activeRole?.permissions ?? [],
    });

    const handleRoleChange = (role: Role) => {
        setActiveRoleId(role.id);
        setData('permissions', role.permissions);
    };

    const toggle = (permName: string, checked: boolean) => {
        setData('permissions', checked
            ? [...data.permissions, permName]
            : data.permissions.filter((p) => p !== permName)
        );
    };

    const toggleFeature = (featurePerms: Permission[], checked: boolean) => {
        const names = featurePerms.map((p) => p.name);
        if (checked) {
            const merged = Array.from(new Set([...data.permissions, ...names]));
            setData('permissions', merged);
        } else {
            setData('permissions', data.permissions.filter((p) => !names.includes(p)));
        }
    };

    const isFeatureChecked = (featurePerms: Permission[]) =>
        featurePerms.every((p) => data.permissions.includes(p.name));

    const isFeatureIndeterminate = (featurePerms: Permission[]) => {
        const checked = featurePerms.filter((p) => data.permissions.includes(p.name));
        return checked.length > 0 && checked.length < featurePerms.length;
    };

    const handleSave = () => {
        put(route('access-control.update', activeRole.id), {
            permissions: data.permissions,
            preserveScroll: true,
            onSuccess: () => toast.success(`Permissions for "${activeRole.name}" saved.`),
            onError: () => toast.error('Failed to save permissions.'),
        });
    };

    const allActions = Array.from(
        new Set(
            Object.values(permissionsByFeature)
                .flat()
                .map((p) => getAction(p.name))
        )
    ).sort((a, b) => ACTION_ORDER.indexOf(a) - ACTION_ORDER.indexOf(b));

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Access Control', href: route('access-control.index') },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Access Control" />

            <div className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-semibold">Access Control</h1>
                    <Button onClick={handleSave} disabled={processing}>
                        {processing ? 'Saving…' : 'Save Changes'}
                    </Button>
                </div>

                {/* Role Tabs */}
                <div className="flex gap-2 border-b">
                    {roles.map((role) => (
                        <button
                            key={role.id}
                            onClick={() => handleRoleChange(role)}
                            className={`px-4 py-2 text-sm font-medium capitalize border-b-2 transition-colors ${
                                role.id === activeRoleId
                                    ? 'border-primary text-primary'
                                    : 'border-transparent text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            {role.name}
                        </button>
                    ))}
                </div>

                {/* Permissions Table */}
                <div className="rounded-md border overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-muted/50">
                                <th className="text-left px-4 py-3 font-medium w-40">Feature</th>
                                {allActions.map((action) => (
                                    <th key={action} className="text-center px-4 py-3 font-medium capitalize w-24">
                                        {action}
                                    </th>
                                ))}
                                <th className="text-center px-4 py-3 font-medium w-24">All</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {Object.entries(permissionsByFeature).map(([feature, perms]) => {
                                const featureChecked = isFeatureChecked(perms);
                                const featureIndeterminate = isFeatureIndeterminate(perms);

                                return (
                                    <tr key={feature} className="hover:bg-muted/30">
                                        <td className="px-4 py-3 font-medium">{feature}</td>
                                        {allActions.map((action) => {
                                            const perm = perms.find((p) => getAction(p.name) === action);
                                            if (!perm) {
                                                return <td key={action} className="text-center px-4 py-3" />;
                                            }
                                            return (
                                                <td key={action} className="text-center px-4 py-3">
                                                    <Checkbox
                                                        checked={data.permissions.includes(perm.name)}
                                                        onCheckedChange={(checked) => toggle(perm.name, !!checked)}
                                                    />
                                                </td>
                                            );
                                        })}
                                        <td className="text-center px-4 py-3">
                                            <Checkbox
                                                checked={featureIndeterminate ? 'indeterminate' : featureChecked}
                                                onCheckedChange={(checked) => toggleFeature(perms, checked === 'indeterminate' ? false : !!checked)}
                                            />
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}
