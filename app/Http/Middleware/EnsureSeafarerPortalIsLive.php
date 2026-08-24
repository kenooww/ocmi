<?php

namespace App\Http\Middleware;

use App\Models\CompanySetting;
use Closure;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

class EnsureSeafarerPortalIsLive
{
    public function handle(Request $request, Closure $next): Response
    {
        if (! CompanySetting::current()->seafarer_maintenance_enabled || $request->routeIs('seafarers.logout')) {
            return $next($request);
        }

        if (! $request->isMethod('GET')) {
            return redirect()->route('seafarers.entry');
        }

        return Inertia::render('Client/Maintenance')->toResponse($request)->setStatusCode(503);
    }
}
