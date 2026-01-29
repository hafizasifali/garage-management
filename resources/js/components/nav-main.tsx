import {
    SidebarGroup,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import { resolveUrl } from '@/lib/utils';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';

export function NavMain({ items = [] }: { items: NavItem[] }) {
    const page = usePage();
    const [openMenu, setOpenMenu] = useState<string | null>(null);

    const isUrlActive = (href?: string, exact = false) => {
        if (!href) return false;

        try {
            const currentPath = page.url.split('?')[0];
            const targetPath = new URL(resolveUrl(href), window.location.origin)
                .pathname;

            if (exact) {
                return currentPath === targetPath;
            }

            // previous behavior
            return (
                currentPath === targetPath ||
                currentPath.startsWith(targetPath + '/')
            );
        } catch {
            return false;
        }
    };


    /**
     * Auto-open parent menu if any child is active
     */
    useEffect(() => {
        const activeParent = items.find((item) =>
            item.children?.some((child) => isUrlActive(child.href))
        );

        if (activeParent) {
            setOpenMenu(activeParent.title);
        }
    }, [page.url, items]);

    return (
        <SidebarGroup className="px-2 py-0">
            <SidebarMenu>
                {items.map((item) => {
                    const hasChildren = !!item.children?.length;

                    const selfActive = isUrlActive(item.href, item.exact);
                    const childActive = item.children?.some((child) =>
                        isUrlActive(child.href)
                    );

                    const isActive = selfActive || childActive;
                    const isOpen = openMenu === item.title;

                    return (
                        <SidebarMenuItem key={item.title}>
                            {/* Parent with children */}
                            {hasChildren ? (
                                <>
                                    <SidebarMenuButton
                                        onClick={() =>
                                            setOpenMenu(
                                                isOpen ? null : item.title
                                            )
                                        }
                                        className={
                                            isActive
                                                ? 'bg-gray-700 text-white'
                                                : ''
                                        }
                                        tooltip={{ children: item.title }}
                                    >
                                        {item.icon && <item.icon />}
                                        <span>{item.title}</span>

                                        <ChevronRight
                                            className={`ml-auto h-4 w-4 transition-transform ${
                                                isOpen ? 'rotate-90' : ''
                                            }`}
                                        />
                                    </SidebarMenuButton>

                                    {isOpen && (
                                        <SidebarMenuSub className="ml-3 border-l border-gray-700 pl-2">
                                            {item.children!.map((child) => {
                                                const active = isUrlActive(
                                                    child.href
                                                );

                                                return (
                                                    <SidebarMenuSubItem
                                                        key={child.title}
                                                    >
                                                        <SidebarMenuSubButton
                                                            asChild
                                                            className={
                                                                active
                                                                    ? 'bg-gray-700 text-white'
                                                                    : 'text-gray-300'
                                                            }
                                                        >
                                                            <Link
                                                                href={
                                                                    child.href!
                                                                }
                                                                prefetch
                                                            >
                                                                {child.icon && (
                                                                    <child.icon />
                                                                )}
                                                                <span>
                                                                    {
                                                                        child.title
                                                                    }
                                                                </span>
                                                            </Link>
                                                        </SidebarMenuSubButton>
                                                    </SidebarMenuSubItem>
                                                );
                                            })}
                                        </SidebarMenuSub>
                                    )}
                                </>
                            ) : (
                                /* Normal menu item */
                                <SidebarMenuButton
                                    asChild
                                    className={
                                        isActive
                                            ? 'bg-gray-700 text-white'
                                            : ''
                                    }
                                    tooltip={{ children: item.title }}
                                >
                                    <Link href={item.href!} prefetch>
                                        {item.icon && <item.icon />}
                                        <span>{item.title}</span>
                                    </Link>
                                </SidebarMenuButton>
                            )}
                        </SidebarMenuItem>
                    );
                })}
            </SidebarMenu>
        </SidebarGroup>
    );
}
