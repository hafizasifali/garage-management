import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils'; // utility for conditional classNames

type FormRendererProps = {
    fields: Record<string, any>;
    form: any;
    options?: Record<string, any>;
    columns?: 2 | 4; // default 2 columns
};

export default function FormRenderer({
    fields,
    form,
    options = {},
    columns = 2,
}: FormRendererProps) {
    const gridCols = columns === 4 ? 'md:grid-cols-4' : 'md:grid-cols-2';

    return (
        <div className={`grid gap-4 ${gridCols}`}>
            {Object.entries(fields).map(([name, field]: any) => {
                const error = form.errors[name];
                return (
                    <div key={name} className="flex items-center gap-2">
                        {/* Label */}
                        <Label className="w-32 flex-shrink-0 text-left">
                            {field.label}
                        </Label>

                        {/* Field */}
                        <div className="flex-1 flex flex-col">
                            {field.type === 'char' && (
                                <Input
                                    value={form.data[name] || ''}
                                    onChange={(e) =>
                                        form.setData(name, e.target.value)
                                    }
                                    className={cn(error && 'border-destructive')}
                                />
                            )}

                            {field.type === 'text' && (
                                <Textarea
                                    value={form.data[name] || ''}
                                    onChange={(e) =>
                                        form.setData(name, e.target.value)
                                    }
                                    className={cn(error && 'border-destructive')}
                                />
                            )}

                            {field.type === 'boolean' && (
                                <Switch
                                    checked={form.data[name]}
                                    onCheckedChange={(val) =>
                                        form.setData(name, val)
                                    }
                                />
                            )}

                            {field.type === 'many2one' && (
                                <Select
                                    value={String(form.data[name] ?? '')}
                                    onValueChange={(val) =>
                                        form.setData(name, val)
                                    }
                                >
                                    <SelectTrigger
                                        className={cn(error && 'border-destructive')}
                                    >
                                        <SelectValue
                                            placeholder={`Select ${field.label}`}
                                        />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {options[field.relation]?.map(
                                            (item) => (
                                                <SelectItem
                                                    key={item.id}
                                                    value={String(item.id)}
                                                >
                                                    {item.name}
                                                </SelectItem>
                                            )
                                        )}
                                    </SelectContent>
                                </Select>
                            )}

                            {/* Inline error message
                            {error && (
                                <span className="text-destructive text-sm mt-1">
                                    {error}
                                </span>
                            )} */}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
