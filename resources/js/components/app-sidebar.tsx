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
import { BarChart2, Building2, Car, CreditCard, FileText, LayoutGrid, LucideWrench, Package, PenTool, UserCog, Users, Wrench } from 'lucide-react';
import AppLogo from './app-logo';
import { route } from 'ziggy-js';


const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutGrid, // overview
    },
    {
        title: 'Customers',
         href: route('customers.index'),
        icon: Users, // user/customer management
        isActive: route().current('customers.*'),
    },
    {
        title: 'Vehicles',
        href: route('vehicles.index'),
        icon: Car, // vehicles
        isActive: route().current('vehicles.*'),
    },
    {
        title: 'Jobs',
        href: route('garage-jobs.index'),
        icon: LucideWrench, // garage jobs/work orders
        isActive: route().current('garage-jobs.*'),
    },
    {
        title: 'Mechanics',
        href: route('employees.index'),
        icon: UserCog, // staff/mechanics
        isActive: route().current('employees.*'),
    },
    {
        title: 'Products',
        href: route('products.index'),
        icon: Package, // spare parts/products
    },
    {
        title: 'Invoices',
        href: '/invoices',
        icon: FileText, // invoices
    },
    {
        title: 'Payments',
        href: '/payments',
        icon: CreditCard, // payments
    },
    {
        title: 'Reports',
        href: '/reports',
        icon: BarChart2, // reports/statistics
    },
];
const footerNavItems: NavItem[] = [
    {
        title: 'Companies',
        href: route('companies.index'),
        icon: Building2, 
        isActive: route().current('companies.*'),
    },
    {
        title: 'Users',
        href: route('users.index'),
        icon: Users, 
        isActive: route().current('users.*'),
    },
    {
        title: 'Access Control',
        href: '/users',
        icon: Wrench,
        isActive: route().current('users.*'),
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
