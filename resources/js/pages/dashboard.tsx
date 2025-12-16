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
import {
    BookOpen,
    Building2,
    GraduationCap,
} from 'lucide-react';
import GraduateSearch from '@/components/dashboard/graduate-search';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

interface ProgramCount {
    program: string;
    count: number;
}

interface DashboardProps {
    stats: {
        graduates: number;
        institutions: number;
        programs: number;
    };
    chartData: {
        topPrograms: ProgramCount[];
    };
}

export default function Dashboard({ stats, chartData }: DashboardProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="CHED Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-y-auto rounded-xl p-4">
                {/* Header Section - Buttons Removed */}
                <div className="flex flex-col gap-2">
                    <h2 className="text-3xl font-bold tracking-tight">
                        System Dashboard Overview
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        Monitoring Institutions, Programs, and Graduate Records.
                    </p>
                </div>

                {/* Eye-Catching Search Section */}
                <Card className="border-2 border-blue-200 dark:border-blue-900 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 shadow-lg">
                    <CardHeader className="pb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-3 rounded-full bg-blue-600 text-white">
                                <GraduationCap className="h-6 w-6" />
                            </div>
                            <div>
                                <CardTitle className="text-xl">
                                    Quick Graduate Search
                                </CardTitle>
                                <CardDescription className="text-sm">
                                    Search by name, SO number, or program to quickly find graduate records
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <GraduateSearch />
                    </CardContent>
                </Card>

                {/* KPI Cards */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card className="hover:shadow-lg transition-shadow">
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

                    <Card className="hover:shadow-lg transition-shadow">
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

                    <Card className="hover:shadow-lg transition-shadow">
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

                {/* Top Programs - Full Width */}
                <Card>
                    <CardHeader>
                        <CardTitle>Top Programs</CardTitle>
                        <CardDescription>
                            Programs with most graduates
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {chartData.topPrograms.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-8">
                                    No program data available yet.
                                </p>
                            ) : (
                                chartData.topPrograms.map((prog, idx) => (
                                    <div
                                        key={idx}
                                        className="flex items-center gap-4"
                                    >
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 font-bold text-sm">
                                            {idx + 1}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">
                                                {prog.program}
                                            </p>
                                            <div className="mt-1.5 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all"
                                                    style={{
                                                        width: `${(prog.count / chartData.topPrograms[0].count) * 100}%`,
                                                    }}
                                                />
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="text-right">
                                                <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                                                    {prog.count}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    graduates
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
