<?php

namespace Tests\Feature;

use App\Models\Client;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AdminSeafarerStatusTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_set_floating_and_to_report_to_office_statuses(): void
    {
        $client = Client::create([
            'name' => 'Juan Dela Cruz',
            'email' => 'juan@example.com',
            'password' => Hash::make('password'),
        ]);

        $this->actingAs(User::factory()->create());

        foreach (['FLOATING', 'TO REPORT TO OFFICE'] as $status) {
            $this->from(route('admin.seafarers.index'))
                ->put(route('admin.seafarers.application-status.update', $client), [
                    'application_status' => $status,
                ])
                ->assertRedirect(route('admin.seafarers.index'))
                ->assertSessionHas('success', 'Application status updated successfully.')
                ->assertSessionHasNoErrors();

            $this->assertDatabaseHas('clients', [
                'id' => $client->id,
                'application_status' => $status,
            ]);
        }
    }
}