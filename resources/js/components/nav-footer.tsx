import { Icon } from '@/components/icon';
import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { resolveUrl } from '@/lib/utils';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { type ComponentPropsWithoutRef } from 'react';

export function NavFooter({
    items,
    className,
    ...props
}: ComponentPropsWithoutRef<typeof SidebarGroup> & {
    items: NavItem[];
}) {
    const page = usePage();
    const { permissions } = page.props as any;
    const userPermissions = permissions?.permissions || [];

    // Check if user has permission
    const hasPermission = (item: NavItem) => {
        if (!item.permission) {
            return true;
        }
        return userPermissions.includes(item.permission);
    };

    // Filter items based on permission
    const filterItems = (navItems: NavItem[]): NavItem[] => {
        return navItems
            .filter(hasPermission)
            .map((item) => ({
                ...item,
                children: item.children ? filterItems(item.children) : undefined,
            }));
    };

    const filteredItems = filterItems(items);

    return (
        <SidebarGroup
            {...props}
            className={`group-data-[collapsible=icon]:p-0 ${className || ''}`}
        >
            <SidebarGroupContent>
                <SidebarMenu className='bg-gray-800 text-white'>
                    {filteredItems.map((item) => (
                        <SidebarMenuItem key={item.title} className='bg-gray-800 text-white'>
                            <SidebarMenuButton asChild>
                                <Link href={item.href} prefetch>
                                    {item.icon && <Icon iconNode={item.icon} className="h-5 w-5" />}
                                    <span>{item.title}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    );
}
