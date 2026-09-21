import Dashboard from '@/pages/dashboard';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';

const navigation = vi.hoisted(() => ({ get: vi.fn() }));
vi.mock('@inertiajs/react', () => ({ Head: () => null, router: navigation }));
vi.mock('@/layouts/app-layout', () => ({
    default: ({ children }: { children: ReactNode }) => <main>{children}</main>,
}));
vi.mock('@/components/dashboard/graduate-search', () => ({
    default: () => <input aria-label="Global graduate search" />,
}));
vi.mock('recharts', () => ({
    ResponsiveContainer: () => null,
    Bar: () => null,
    BarChart: () => null,
    CartesianGrid: () => null,
    Cell: () => null,
    Line: () => null,
    LineChart: () => null,
    Pie: () => null,
    PieChart: () => null,
    Tooltip: () => null,
    XAxis: () => null,
    YAxis: () => null,
}));
const props = {
    stats: { graduates: 0, institutions: 0, programs: 0 },
    chartData: {
        trend: [],
        sex: [],
        topPrograms: [],
        topInstitutions: [],
        undated: 0,
    },
    options: { years: [2024, 2025], institutions: [] },
    filters: { year: null, institution: null },
    portal: { count: null, stale: true, lastFetchedAt: null },
    hasRecords: false,
};
beforeEach(() => {
    vi.stubGlobal('matchMedia', () => ({
        matches: true,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
    }));
});
afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
});
it('distinguishes empty imports, filtered emptiness and unavailable portal totals', () => {
    const { rerender } = render(<Dashboard {...props} />);
    expect(screen.getByText('No graduate records yet')).toBeTruthy();
    expect(screen.getByText('Directory currently unavailable')).toBeTruthy();
    rerender(<Dashboard {...props} hasRecords />);
    expect(screen.getByText('No matching graduate records')).toBeTruthy();
    expect(screen.getByLabelText('Global graduate search')).toBeTruthy();
});
it('cancels older filter visits and retains loading until the newest request finishes', () => {
    const cancel = vi.fn();
    const finishes: (() => void)[] = [];
    navigation.get.mockImplementation((_url, _query, options) => {
        options.onCancelToken({ cancel });
        finishes.push(options.onFinish);
    });
    render(<Dashboard {...props} />);
    fireEvent.change(screen.getByLabelText('Graduation year'), {
        target: { value: '2024' },
    });
    fireEvent.change(screen.getByLabelText('Graduation year'), {
        target: { value: '2025' },
    });
    expect(cancel).toHaveBeenCalledOnce();
    expect(navigation.get.mock.calls.at(-1)?.[1]).toEqual({ year: 2025 });
    act(() => finishes[0]());
    expect(screen.getByText('Updating analytics...')).toBeTruthy();
    act(() => finishes[1]());
    expect(screen.queryByText('Updating analytics...')).toBeNull();
});
