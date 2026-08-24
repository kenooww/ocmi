<?php

namespace App\Http\Middleware;

use App\Models\CompanySetting;
use App\Models\OffshoreTraining;
use App\Models\Rank;
use App\Models\StcwCertificate;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user() ? [
                    'id' => $request->user()->id,
                    'name' => $request->user()->name,
                    'email' => $request->user()->email,
                    'role' => $request->user()->role ?? 'admin',
                    'avatar' => $request->user()->avatar,
                ] : null,
            ],
            'companySettings' => fn () => CompanySetting::current()->publicData(),
            'certificateOptions' => fn () => [
                'stcw' => StcwCertificate::latest()
                    ->get(['id', 'certification_name', 'created_at'])
                    ->map(fn ($certificate) => [
                        'value' => $certificate->certification_name,
                        'label' => $certificate->certification_name,
                        'created_at' => optional($certificate->created_at)->toISOString(),
                    ])
                    ->values(),
                'offshore' => OffshoreTraining::latest()
                    ->get(['id', 'certification_name', 'created_at'])
                    ->map(fn ($certificate) => [
                        'value' => $certificate->certification_name,
                        'label' => $certificate->certification_name,
                        'created_at' => optional($certificate->created_at)->toISOString(),
                    ])
                    ->values(),
            ],
            'rankOptions' => fn () => Schema::hasTable('ranks')
                ? Rank::latest()
                    ->get(['id', 'rank_name', 'created_at'])
                    ->map(fn ($rank) => [
                        'value' => $rank->rank_name,
                        'label' => $rank->rank_name,
                        'created_at' => optional($rank->created_at)->toISOString(),
                    ])
                    ->values()
                : [],
        ];
    }
}
