<?php
// app/Http/Controllers/PermitPdfProxyController.php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PermitPdfProxyController extends Controller
{
    /**
     * Proxy PDF requests to hide the actual URL
     */
    public function proxy(Request $request)
    {
        $request->validate([
            'url' => 'required|url',
        ]);

        $pdfUrl = $request->input('url');

        try {
            // Fetch the PDF from the portal
            $response = Http::timeout(30)->get($pdfUrl);

            if (!$response->successful()) {
                Log::error('Failed to fetch PDF', [
                    'url' => $pdfUrl,
                    'status' => $response->status(),
                ]);
                return response()->json([
                    'error' => 'Failed to fetch PDF document'
                ], 500);
            }

            // Return the PDF with appropriate headers
            return response($response->body())
                ->header('Content-Type', 'application/pdf')
                ->header('Content-Disposition', 'inline; filename="permit.pdf"')
                ->header('Cache-Control', 'no-cache, no-store, must-revalidate')
                ->header('Pragma', 'no-cache')
                ->header('Expires', '0');

        } catch (\Exception $e) {
            Log::error('Error proxying PDF', [
                'url' => $pdfUrl,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'error' => 'An error occurred while fetching the PDF'
            ], 500);
        }
    }
}
