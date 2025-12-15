import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    BookOpen,
    Building2,
    Download,
    FileSpreadsheet,
    GraduationCap,
    MoreHorizontal
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

// Define props interface
interface DashboardProps {
    stats: {
        graduates: number;
        institutions: number;
        programs: number;
    };
    recentGraduates: {
        id: number;
        name: string;
        program: string;
        school: string;
        initials: string;
    }[];
}

export default function Dashboard({ stats, recentGraduates }: DashboardProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="CHED Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-y-auto rounded-xl p-4">

                {/* Header Section */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">System Overview</h2>
                        <p className="text-sm text-muted-foreground">
                            Monitoring Institutions, Programs, and Graduate Records.
                        </p>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button variant="outline">
                            <FileSpreadsheet className="mr-2 h-4 w-4" />
                            Import Excel
                        </Button>
                        <Button>
                            <Download className="mr-2 h-4 w-4" />
                            Export Report
                        </Button>
                    </div>
                </div>

                <Tabs defaultValue="overview" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="institutions" disabled>Institutions</TabsTrigger>
                        <TabsTrigger value="graduates" disabled>Graduates</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-4">

                        {/* KPI Cards (Dynamic Data) */}
                        <div className="grid gap-4 md:grid-cols-3">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        Total Graduates
                                    </CardTitle>
                                    <GraduationCap className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">
                                        {stats.graduates.toLocaleString()}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Registered in system
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        Partner Institutions
                                    </CardTitle>
                                    <Building2 className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">
                                        {stats.institutions.toLocaleString()}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Active HEIs (Portal API)
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        Active Programs
                                    </CardTitle>
                                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">
                                        {stats.programs.toLocaleString()}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Distinct programs recorded
                                    </p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Main Content Area */}
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">

                            {/* Chart Area (Keeping Static for now, as requested) */}
                            <Card className="col-span-4">
                                <CardHeader>
                                    <CardTitle>Graduate Distribution</CardTitle>
                                    <CardDescription>
                                        Graduates by Program Field (Current Academic Year).
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="pl-2">
                                    <div className="flex h-[350px] w-full items-end justify-between gap-2 px-4 pt-10">
                                        {/* Static visual for now */}
                                        {[
                                            { label: 'IT', val: 80, color: 'bg-blue-500' },
                                            { label: 'Eng', val: 65, color: 'bg-blue-500' },
                                            { label: 'Bus', val: 90, color: 'bg-blue-500' },
                                            { label: 'Edu', val: 45, color: 'bg-blue-500' },
                                            { label: 'Nur', val: 70, color: 'bg-blue-500' },
                                            { label: 'Art', val: 30, color: 'bg-blue-500' },
                                            { label: 'Sci', val: 55, color: 'bg-blue-500' },
                                        ].map((item, i) => (
                                            <div key={i} className="group relative flex w-full flex-col justify-end gap-2">
                                                <div
                                                    className={`w-full rounded-t-md opacity-80 transition-all hover:opacity-100 ${item.color}`}
                                                    style={{ height: `${item.val}%` }}
                                                ></div>
                                                <span className="text-center text-xs font-medium text-muted-foreground">
                                                    {item.label}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Recent Records List (Dynamic Data) */}
                            <Card className="col-span-3">
                                <CardHeader>
                                    <CardTitle>Recent Records</CardTitle>
                                    <CardDescription>
                                        Latest students added to the system.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-8">
                                        {recentGraduates.length === 0 ? (
                                            <p className="text-sm text-muted-foreground text-center py-4">
                                                No graduates found.
                                            </p>
                                        ) : (
                                            recentGraduates.map((student) => (
                                                <div key={student.id} className="flex items-center">
                                                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 border border-primary/20 text-primary">
                                                        <span className="text-xs font-bold">{student.initials}</span>
                                                    </div>
                                                    <div className="ml-4 space-y-1">
                                                        <p className="text-sm font-medium leading-none">{student.name}</p>
                                                        <div className="flex items-center gap-2">
                                                            <p className="text-xs text-muted-foreground line-clamp-1">{student.program}</p>
                                                        </div>
                                                        <p className="text-[10px] text-muted-foreground line-clamp-1">{student.school}</p>
                                                    </div>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="ml-auto h-8 w-8">
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem>View Record</DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </AppLayout>
    );
}
