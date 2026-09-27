<?php

namespace Tests\Feature;

use App\Models\Client;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class SeaServiceEndClientTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_save_and_clear_end_client_and_preview_receives_it(): void
    {
        $client = Client::create(['name' => 'Test Officer', 'email' => 'end-client@example.com', 'password' => 'password']);
        $this->actingAs(User::factory()->create());
        $payload = [
            'status' => 'single', 'type_of_job' => 'No Experience',
            'sea_service' => [['vessel_name' => 'Test Vessel', 'end_client' => 'Example Energy']],
        ];
        $this->put(route('admin.seafarers.update', $client), $payload)->assertSessionHasNoErrors();
        $service = $client->seaServices()->firstOrFail();
        $this->assertSame('Example Energy', $service->end_client);
        $this->get(route('admin.seafarers.print-preview', ['client' => $client, 'form' => 'dynamic']))
            ->assertInertia(fn (Assert $page) => $page->component('Admin/PrintPreview')
                ->where('printForm', 'dynamic')->where('client.sea_service.0.end_client', 'Example Energy'));
        $payload['sea_service'][0]['id'] = $service->id;
        $payload['sea_service'][0]['end_client'] = '';
        $this->put(route('admin.seafarers.update', $client), $payload)->assertSessionHasNoErrors();
        $this->assertEmpty($service->fresh()->end_client);
    }
}
