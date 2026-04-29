import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import {
    BarChart2,
    Building2,
    Car,
    ClipboardList,
    CreditCard,
    FileText,
    Layers,
    LayoutGrid,
    ListOrdered,
    LucideWrench,
    Package,
    PenTool,
    PlusCircle,
    UserCog,
    Users,
    Wrench,
} from 'lucide-react';
import AppLogo from './app-logo';
import { route } from 'ziggy-js';



const mainNavItems: NavItem[] = [
    // {
    //     title: 'Dashboard',
    //     href: '/dashboard',
    //     icon: LayoutGrid, // overview
    // },
    {
        title: 'New Order',
        href: route('orders.create'),
        icon: PlusCircle,
        isActive: route().current('orders.create'),
        exact: true,
        permission: 'order create',
    },
    {
        title: 'Orders',
        href: route('orders.index'),
        icon: ListOrdered,
        isActive: route().current('orders.index'), // only active on index
        exact: true,
        permission: 'order view',
    },

    // {
    //     title: 'Parts Purchases',
    //     href: route('purchase-orders.index'),
    //     icon: ClipboardList, // invoices
    // },
    {
        title: 'Products',
        href: route('products.index'),
        icon: Package, // spare parts/products
        permission: 'product view',
    },
    // {
    //     title: 'Suppliers',
    //     href: route('suppliers.index'),
    //     icon: Layers, // spare parts/products
    // },
    {
        title: 'Customers',
        href: route('customers.index'),
        icon: Users, // user/customer management
        isActive: route().current('customers.*'),
        permission: 'customer view',
    },
    // {
    //     title: 'Vehicles',
    //     href: route('vehicles.index'),
    //     icon: Car, // vehicles
    //     isActive: route().current('vehicles.*'),
    // },

    {
        title: 'Mechanics',
        href: route('employees.index'),
        icon: UserCog, // staff/mechanics
        isActive: route().current('employees.*'),
        permission: 'employee view',
    },
    {
        title: 'Reports',
        icon: BarChart2,
        permission: 'report view',
        children: [
            {
                title: 'Billing Report',
                href: route('reports.billingReport'),
                permission: 'report view',
            },
            {
                title: 'Brake Fluid Billing Report',
                href: route('reports.brakeFluidBillingReport'),
                permission: 'report view',
            },
        ],
    },
];
const footerNavItems: NavItem[] = [
    {
        title: 'Company',
        href: route('companies.create'),
        icon: Building2,
        isActive: route().current('companies.*'),
        permission: 'company create',
    },
    {
        title: 'Users',
        href: route('users.index'),
        icon: Users,
        isActive: route().current('users.*'),
        permission: 'user view',
    },
    {
        title: 'Access Control',
        href: route('access-control.index'),
        icon: Wrench,
        isActive: route().current('access-control.*'),
        permission: 'permission manage',
    },
    // {
    //     title: 'Repository',
    //     href: 'https://github.com/laravel/react-starter-kit',
    //     icon: Folder,
    // },
    // {
    //     title: 'Documentation',
    //     href: 'https://laravel.com/docs/starter-kits#react',
    //     icon: BookOpen,
    // },
];

export function AppSidebar() {
    return (
        <Sidebar className='bg-gray-800 text-white' collapsible="icon" variant="inset">
            <SidebarHeader className='bg-gray-800 text-white'>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent className='bg-gray-800 text-white'>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter className='bg-gray-800 text-white'>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser/>
            </SidebarFooter>
        </Sidebar>
    );
}
