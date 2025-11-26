<?php

namespace App\Console\Commands;

use App\Models\ProgramCatalog;
use App\Services\PortalService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class SyncProgramCatalog extends Command
{
    /**
     * The name and signature of the console command.
     *
     * Example usage:
     *  php artisan ched:sync-program-catalog
     */
    protected $signature = 'ched:sync-program-catalog';

    /**
     * The console command description.
     */
    protected $description = 'Fetch all unique program names from CHED Portal (Region XII) and sync them into program_catalogs table';

    /**
     * Execute the console command.
     */
    public function handle(PortalService $portal): int
    {
        $this->info('Starting sync of program catalog from CHED portal...');

        // 1) Get all HEIs from portal
        $hei = $portal->fetchAllHEI();

        if (empty($hei)) {
            $this->error('No HEIs returned from PortalService. Check PORTAL_API or connectivity.');
            return self::FAILURE;
        }

        $totalHei = count($hei);
        $this->info("Found {$totalHei} HEIs.");

        $allPrograms = collect();

        // 2) For each HEI, fetch its program records and collect programName
        foreach ($hei as $index => $item) {
            $instCode = $item['instCode'] ?? null;
            $instName = $item['instName'] ?? 'Unknown';

            if (!$instCode) {
                continue;
            }

            $this->line('['.($index + 1)."/{$totalHei}] {$instCode} - {$instName}");

            try {
                $records = $portal->fetchProgramRecords($instCode);
            } catch (\Throwable $e) {
                $this->warn("  -> Failed to fetch programs for {$instCode}: ".$e->getMessage());
                Log::error('Failed to fetch programs in ched:sync-program-catalog', [
                    'instCode' => $instCode,
                    'err'      => $e->getMessage(),
                ]);
                continue;
            }

            $programNames = collect($records)
                ->pluck('programName')
                ->filter(fn ($name) => filled($name))
                ->map(fn ($name) => trim((string) $name))
                ->unique()
                ->values();

            $allPrograms = $allPrograms->merge($programNames);
        }

        // 3) Deduplicate across all HEIs
        $allPrograms = $allPrograms
            ->filter(fn ($name) => $name !== '')
            ->unique()
            ->values();

        $this->info('Total unique program names found: '.$allPrograms->count());

        // 4) Sync into program_catalogs table
        $created = 0;
        $updated = 0;

        $allPrograms->each(function (string $programName) use (&$created, &$updated) {
            $normalized = ProgramCatalog::normalizeName($programName);

            $existing = ProgramCatalog::where('normalized_name', $normalized)->first();

            if ($existing) {
                // If you ever want to refresh display name, you can uncomment this:
                // $existing->update(['program_name' => $programName]);
                $updated++;
                return;
            }

            ProgramCatalog::create([
                'program_name'   => $programName,
                'normalized_name'=> $normalized,
                'program_type'   => 'Unknown', // admin will set Board / Non-Board later
                'notes'          => null,
            ]);

            $created++;
        });

        $this->info("Program catalog sync complete. Created: {$created}, existing: {$updated}.");

        return self::SUCCESS;
    }
}
