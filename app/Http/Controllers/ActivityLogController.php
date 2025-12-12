<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ActivityLogController extends Controller
{
    public function index(Request $request)
    {
        $logs = ActivityLog::with('user')
            ->orderByDesc('created_at')
            ->paginate(50)
            ->withQueryString();

        return Inertia::render('logs/index', [
            'logs' => $logs->through(function (ActivityLog $log) {
                return [
                    'id'         => $log->id,
                    'user_name'  => $log->user?->name ?? 'System',
                    'user_email' => $log->user?->email,
                    'action'     => $log->action,
                    'summary'    => $log->summary,
                    'properties' => $log->properties,
                    'created_at' => $log->created_at->toDateTimeString(),
                ];
            }),
        ]);
    }
}
