import GraduateImport from '@/components/graduate-import';
import {
    act,
    cleanup,
    fireEvent,
    render,
    screen,
} from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';

const api = vi.hoisted(() => ({
    get: vi.fn(),
    post: vi.fn(),
    isAxiosError: vi.fn(() => false),
}));

vi.mock('axios', () => ({ default: api }));
vi.mock('@/hooks/use-permissions', () => ({
    usePermissions: () => ({
        can: (permission: string) => permission === 'import_graduates',
    }),
}));
vi.mock('sonner', () => ({ toast: { success: vi.fn() } }));

const run = (status = 'completed') => ({
    id: 1,
    filename: 'students.xlsx',
    status,
    phase: 'writing' as const,
    total_rows: 10,
    total_chunks: 1,
    completed_chunks: status === 'processing' ? 0 : 1,
    counts: {
        created: status === 'processing' ? 0 : 10,
        updated: 0,
        unchanged: 0,
        skipped: 0,
        invalid: 0,
    },
    error: null,
    issues: 0,
    created_at: '2026-09-21T08:00:00Z',
    finished_at: status === 'processing' ? null : '2026-09-21T08:01:00Z',
    failed_chunks: [],
});

const history = (status = 'completed') => ({
    runs: {
        data: [run(status)],
        current_page: 1,
        last_page: 1,
        total: 1,
    },
    active_id: status === 'processing' ? 1 : null,
    worker_last_seen: null,
});

const flush = async () => {
    await act(async () => {
        await Promise.resolve();
        await Promise.resolve();
    });
};

beforeEach(() => {
    vi.useFakeTimers({ now: new Date('2026-09-21T08:00:00Z') });
    api.get.mockReset();
    api.post.mockReset();
    api.isAxiosError.mockClear();
    api.get.mockResolvedValue({ data: history() });
});

afterEach(() => {
    cleanup();
    vi.useRealTimers();
});

it('loads completed history once and refreshes only when requested', async () => {
    render(<GraduateImport />);
    await flush();

    expect(api.get).toHaveBeenCalledTimes(1);
    await act(async () => vi.advanceTimersByTimeAsync(10_000));
    expect(api.get).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: 'Refresh history' }));
    await flush();
    expect(api.get).toHaveBeenCalledTimes(2);
});

it('uses processing responses for active progress and stops after completion', async () => {
    api.get
        .mockResolvedValueOnce({ data: history('processing') })
        .mockResolvedValue({ data: history() });
    api.post.mockResolvedValue({ data: { run: run() } });

    render(<GraduateImport />);
    await flush();
    await flush();

    expect(api.post).toHaveBeenCalledTimes(1);
    expect(api.post).toHaveBeenCalledWith('/import/graduates/runs/1/process');
    expect(api.get).toHaveBeenCalledTimes(2);

    await act(async () => vi.advanceTimersByTimeAsync(10_000));
    expect(api.post).toHaveBeenCalledTimes(1);
    expect(api.get).toHaveBeenCalledTimes(2);
});
