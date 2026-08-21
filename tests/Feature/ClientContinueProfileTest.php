<?php

namespace Tests\Feature;

use App\Models\Client;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class ClientContinueProfileTest extends TestCase
{
    use RefreshDatabase;

    public function test_incomplete_client_is_redirected_from_dashboard_to_continue_profile(): void
    {
        $client = $this->createClient();

        $response = $this
            ->actingAs($client, 'client')
            ->get('/seafarers/dashboard');

        $response
            ->assertRedirect(route('seafarers.continue'))
            ->assertSessionHasErrors('profile');
    }

    public function test_complete_client_can_open_dashboard(): void
    {
        $client = $this->createClient($this->completeProfileData());

        $response = $this
            ->actingAs($client, 'client')
            ->get('/seafarers/dashboard');

        $response->assertOk();
    }

    public function test_complete_client_is_redirected_from_continue_profile_to_dashboard(): void
    {
        $client = $this->createClient($this->completeProfileData());

        $response = $this
            ->actingAs($client, 'client')
            ->get('/seafarers/continue');

        $response->assertRedirect(route('seafarers.dashboard', ['section' => 'dashboard']));
    }

    public function test_continue_profile_requires_completion_before_redirecting_to_dashboard(): void
    {
        $client = $this->createClient();

        $response = $this
            ->actingAs($client, 'client')
            ->post('/seafarers/continue', [
                'first_name' => 'Juan',
                'last_name' => 'Dela Cruz',
            ]);

        $response->assertSessionHasErrors([
            'date_applied',
            'place_of_birth',
            'date_of_birth',
            'personal_mobile_no',
            'sss_no',
        ]);
    }

    private function createClient(array $overrides = []): Client
    {
        return Client::create(array_merge([
            'name' => 'Juan Dela Cruz',
            'email' => 'juan@example.com',
            'email_verified_at' => now(),
            'password' => Hash::make('password'),
        ], $overrides));
    }

    private function completeProfileData(): array
    {
        return [
            'first_name' => 'Juan',
            'last_name' => 'Dela Cruz',
            'date_applied' => '2026-08-21',
            'place_of_birth' => 'Manila',
            'date_of_birth' => '1990-01-15',
            'mothers_maiden_name' => 'Maria Santos',
            'fathers_name' => 'Pedro Dela Cruz',
            'nationality' => 'Filipino',
            'current_position' => 'Able Seaman',
            'position_applied_for' => 'Deckhand',
            'educational_attainment' => 'College',
            'body_weight_bmi' => '70 kg / 24',
            'height_cm' => 172,
            'coverall_shoe_size' => 'M / 42',
            'current_home_address' => '123 Harbor Street, Manila',
            'personal_mobile_no' => '09171234567',
            'email_address' => 'juan@example.com',
            'nearest_airport' => 'NAIA',
            'next_of_kin' => 'Maria Dela Cruz',
            'relationship' => 'Mother',
            'emergency_contact' => 'Maria / 09176543210',
            'sss_no' => 'SSS-123',
            'pagibig_no' => 'PAG-123',
            'philhealth_no' => 'PH-123',
        ];
    }
}
