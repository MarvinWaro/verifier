<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserCan
{
    /**
     * Handle an incoming request.
     *
     * @param  string  $ability  The Gate ability to check
     */
    public function handle(Request $request, Closure $next, string $ability): Response
    {
        if (! Gate::allows($ability)) {
            abort(403, 'You do not have permission to access this resource.');
        }

        return $next($request);
    }
}
