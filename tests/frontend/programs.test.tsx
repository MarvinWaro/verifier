import { useProgramRefresh } from '@/hooks/use-program-refresh';
import { filterPrograms, permitState } from '@/lib/programs';
import Programs from '@/pages/programs';
import type { PortalProgram, ProgramSnapshot } from '@/types/programs';
import {
    act,
    cleanup,
    fireEvent,
    render,
    renderHook,
    screen,
} from '@testing-library/react';
import axios from 'axios';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('axios', () => ({
    default: { post: vi.fn(), isAxiosError: vi.fn(() => true) },
}));
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock('@/layouts/app-layout', () => ({
    default: ({ children }: { children: ReactNode }) => children,
}));
vi.mock('@inertiajs/react', () => ({
    Head: () => null,
    router: { get: vi.fn() },
}));
vi.mock('@/components/welcome/permit-dialog', () => ({
    default: ({ program }: { program: { name: string } | null }) =>
        program ? <div role="dialog">{program.name}</div> : null,
}));

const program = (
    id: number,
    extra: Partial<PortalProgram> = {},
): PortalProgram => ({
    id,
    program_name: `Science ${id}`,
    major: 'Computing',
    program_type: 'Board',
    program_status: 'Active',
    permit_number: `GR-${id}`,
    permit_pdf_url: 'https://portal.test/document.pdf',
    institution: { institution_code: '1', name: 'School One', type: 'public' },
    ...extra,
});
const initial: ProgramSnapshot = {
    programs: [program(1)],
    last_fetched_at: '2026-09-18T00:00:00Z',
    stale: false,
    error: null,
};
const response = (code = '1', programs = [program(2)]) => ({
    data: {
        ...initial,
        instCode: code,
        programs,
        last_fetched_at: '2026-09-18T00:05:00Z',
    },
});

beforeEach(() => {
    Object.defineProperty(navigator, 'onLine', {
        configurable: true,
        value: true,
    });
    Object.defineProperty(document, 'visibilityState', {
        configurable: true,
        value: 'visible',
    });
});
afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.resetAllMocks();
});

describe('refresh lifecycle', () => {
    it('refreshes only when visible and online and stops after unmount', async () => {
        vi.useFakeTimers();
        vi.mocked(axios.post).mockResolvedValue(response());
        const { unmount } = renderHook(() => useProgramRefresh('1', initial));
        Object.defineProperty(document, 'visibilityState', {
            configurable: true,
            value: 'hidden',
        });
        await act(() => vi.advanceTimersByTimeAsync(300_000));
        expect(axios.post).not.toHaveBeenCalled();
        Object.defineProperty(document, 'visibilityState', {
            configurable: true,
            value: 'visible',
        });
        await act(async () =>
            document.dispatchEvent(new Event('visibilitychange')),
        );
        expect(axios.post).toHaveBeenCalledTimes(1);
        Object.defineProperty(navigator, 'onLine', {
            configurable: true,
            value: false,
        });
        await act(() => vi.advanceTimersByTimeAsync(300_000));
        expect(axios.post).toHaveBeenCalledTimes(1);
        unmount();
        await act(() => vi.advanceTimersByTimeAsync(600_000));
        expect(axios.post).toHaveBeenCalledTimes(1);
    });

    it('skips overlapping requests and discards late responses after switching schools', async () => {
        let resolve!: (value: ReturnType<typeof response>) => void;
        vi.mocked(axios.post).mockReturnValue(
            new Promise((done) => {
                resolve = done;
            }),
        );
        const old = renderHook(() => useProgramRefresh('1', initial));
        act(() => {
            void old.result.current.refresh();
            void old.result.current.refresh();
        });
        expect(axios.post).toHaveBeenCalledTimes(1);
        const signal = vi.mocked(axios.post).mock.calls[0][2]?.signal;
        old.unmount();
        const next = renderHook(() =>
            useProgramRefresh('2', { ...initial, programs: [program(9)] }),
        );
        await act(async () => resolve(response('1')));
        expect(signal?.aborted).toBe(true);
        expect(next.result.current.snapshot.programs[0].id).toBe(9);
    });

    it('keeps previous rows and timestamp on failure', async () => {
        vi.mocked(axios.post).mockRejectedValue(new Error('Offline'));
        const { result } = renderHook(() => useProgramRefresh('1', initial));
        await act(() => result.current.refresh());
        expect(result.current.snapshot.programs).toEqual(initial.programs);
        expect(result.current.snapshot.last_fetched_at).toBe(
            initial.last_fetched_at,
        );
        expect(result.current.snapshot.stale).toBe(true);
        expect(result.current.refreshing).toBe(false);
    });
});

it('searches majors and permit numbers while combining filters', () => {
    const rows = [
        program(1),
        program(2, { program_type: 'Non-Board', permit_pdf_url: null }),
    ];
    expect(
        filterPrograms(rows, 'Computing', 'Board', 'active', 'document'),
    ).toHaveLength(1);
    expect(filterPrograms(rows, 'GR-2', 'all', 'all', 'all')).toEqual([
        rows[1],
    ]);
    expect(permitState(program(3, { permit_number: null }))).toBe('document');
    expect(permitState(program(4, { permit_pdf_url: null }))).toBe('number');
    expect(
        permitState(program(5, { permit_pdf_url: null, permit_number: null })),
    ).toBe('missing');
});

it('preserves search and page during refresh and clamps shrinking results', async () => {
    const rows = Array.from({ length: 23 }, (_, index) => program(index + 1));
    vi.mocked(axios.post)
        .mockResolvedValueOnce(response('1', rows))
        .mockResolvedValueOnce(response('1', rows.slice(0, 4)));
    render(
        <Programs
            {...initial}
            programs={rows}
            hei={[{ instCode: '1', instName: 'School One' }]}
            selectedInstCode="1"
            schools_error={null}
        />,
    );
    const search = screen.getByPlaceholderText(/search.*program/i);
    fireEvent.change(search, { target: { value: 'Science' } });
    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    expect(screen.getByText('Science 11')).toBeTruthy();
    await act(async () =>
        fireEvent.click(
            screen.getByRole('button', { name: /refresh from portal/i }),
        ),
    );
    expect(screen.getByText('Science 11')).toBeTruthy();
    expect((search as HTMLInputElement).value).toBe('Science');
    await act(async () =>
        fireEvent.click(
            screen.getByRole('button', { name: /refresh from portal/i }),
        ),
    );
    expect(screen.getByText('Science 1')).toBeTruthy();
    expect(
        screen.getAllByRole('button', { name: /view permit/i }),
    ).toHaveLength(4);
    fireEvent.click(screen.getAllByRole('button', { name: /view permit/i })[0]);
    expect(screen.getByRole('dialog').textContent).toBe('Science 1');
});
