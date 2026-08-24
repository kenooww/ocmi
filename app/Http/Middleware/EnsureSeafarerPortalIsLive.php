<?php

namespace App\Http\Middleware;

use App\Models\CompanySetting;
use Closure;
use Illuminate\Http\Request;
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

        return response()->view('seafarers.maintenance', [
            'company' => CompanySetting::current()->publicData(),
        ], 503);
    }
}
