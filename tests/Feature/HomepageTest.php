<?php

namespace Tests\Feature;

use App\Models\CompanySetting;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class HomepageTest extends TestCase
{
    use RefreshDatabase;

    public function test_both_homepage_urls_are_public_and_use_company_settings(): void
    {
        CompanySetting::current()->update(['company_name' => 'Test Crewing Company', 'email' => 'crew@example.com', 'logo' => 'company-logos/configured.png']);

        foreach (['/', '/homepage'] as $url) {
            $this->get($url)->assertOk()->assertInertia(fn (Assert $page) => $page
                ->component('Homepage')
                ->where('companySettings.company_name', 'Test Crewing Company')
                ->where('companySettings.email', 'crew@example.com')
                ->where('companySettings.logo_url', asset('storage/company-logos/configured.png')));
        }
    }

    public function test_homepage_stays_available_during_seafarer_portal_maintenance(): void
    {
        CompanySetting::current()->update(['seafarer_maintenance_enabled' => true]);

        $this->get('/homepage')->assertOk()->assertInertia(fn (Assert $page) => $page->component('Homepage'));
    }
}
