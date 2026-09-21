import GraduateImportProgress from '@/components/graduate-import-progress';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

afterEach(cleanup);
const run = {
    status: 'queued',
    phase: 'reading' as const,
    total_rows: 0,
    total_chunks: 0,
    completed_chunks: 0,
};

describe('inline import progress', () => {
    it('shows immediate preparation activity without invented counts or percentages', () => {
        const { container } = render(<GraduateImportProgress run={run} />);
        expect(screen.getByRole('status').textContent).toContain(
            'Preparing your spreadsheet',
        );
        expect(
            screen.getByRole('progressbar').hasAttribute('aria-valuenow'),
        ).toBe(false);
        expect(screen.queryByText(/worksheet rows|% processed/)).toBeNull();
        expect(container.querySelector('.animate-spin')).not.toBeNull();
        expect(
            container.querySelector('.motion-reduce\\:animate-none'),
        ).not.toBeNull();
    });
    it('shows both phases and reserves 100 percent for server completion', () => {
        const { rerender } = render(
            <GraduateImportProgress
                run={{
                    ...run,
                    status: 'processing',
                    total_rows: 1000,
                    total_chunks: 2,
                    completed_chunks: 1,
                }}
            />,
        );
        expect(screen.getByRole('status').textContent).toContain(
            'Validating rows',
        );
        expect(
            screen.getByRole('progressbar').getAttribute('aria-valuenow'),
        ).toBe('25');
        rerender(
            <GraduateImportProgress
                run={{
                    ...run,
                    status: 'processing',
                    phase: 'writing',
                    total_chunks: 2,
                    completed_chunks: 2,
                }}
            />,
        );
        expect(screen.getByRole('status').textContent).toContain(
            'Saving student records',
        );
        expect(
            screen.getByRole('progressbar').getAttribute('aria-valuenow'),
        ).toBe('99');
        rerender(
            <GraduateImportProgress
                run={{
                    ...run,
                    status: 'completed_with_issues',
                    phase: 'writing',
                    total_chunks: 2,
                    completed_chunks: 2,
                }}
            />,
        );
        expect(
            screen.getByRole('progressbar').getAttribute('aria-valuenow'),
        ).toBe('100');
        expect(screen.getByRole('status').textContent).toBe('Import finished');
    });
    it('stops animation on interruption and failure and resumes after reconnection', () => {
        const { container, rerender } = render(
            <GraduateImportProgress run={run} interrupted />,
        );
        expect(screen.getByRole('status').textContent).toContain(
            'Connection interrupted',
        );
        expect(
            container.querySelector('.animate-spin, .animate-pulse'),
        ).toBeNull();
        rerender(<GraduateImportProgress run={run} />);
        expect(container.querySelector('.animate-spin')).not.toBeNull();
        rerender(<GraduateImportProgress run={{ ...run, status: 'failed' }} />);
        expect(screen.getByRole('status').textContent).toContain(
            'Processing stopped',
        );
        expect(
            container.querySelector('.animate-spin, .animate-pulse'),
        ).toBeNull();
    });
    it('keeps historical completion visible even when another import loses its connection', () => {
        const { container } = render(
            <GraduateImportProgress
                run={{ ...run, status: 'completed' }}
                interrupted
            />,
        );
        expect(screen.getByRole('status').textContent).toBe('Import finished');
        expect(
            screen.getByRole('progressbar').getAttribute('aria-valuenow'),
        ).toBe('100');
        expect(container.querySelector('.animate-spin')).toBeNull();
    });
});
