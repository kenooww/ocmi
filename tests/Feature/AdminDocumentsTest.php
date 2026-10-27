<?php

namespace Tests\Feature;

use App\Models\Client;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AdminDocumentsTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_browse_view_and_download_seafarer_documents(): void
    {
        Storage::fake('public');
        Storage::disk('public')->put('resume-attachments/juan-resume.pdf', '%PDF-1.4 test');
        $client = Client::create([
            'name' => 'Juan Dela Cruz',
            'email' => 'juan@example.com',
            'password' => Hash::make('password'),
            'resume_attachment' => 'resume-attachments/juan-resume.pdf',
        ]);
        $this->actingAs(User::factory()->create());

        $this->get(route('admin.documents.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->component('Admin/Documents')
                ->where('clients.data.0.name', 'Juan Dela Cruz')
                ->where('clients.data.0.documents.0.category', 'Resume')
                ->where('clients.data.0.documents.0.name', 'juan-resume.pdf')
                ->where('clients.data.0.documents.0.previewable', true));

        $this->get(route('admin.documents.view', [$client, 'resume', 'resume']))->assertOk();
        $this->get(route('admin.documents.download', [$client, 'resume', 'resume']))->assertOk();
    }

    public function test_document_routes_cannot_access_another_seafarers_file(): void
    {
        Storage::fake('public');
        Storage::disk('public')->put('resume-attachments/juan-resume.pdf', '%PDF-1.4 test');
        $owner = Client::create([
            'name' => 'Juan Dela Cruz',
            'email' => 'juan@example.com',
            'password' => Hash::make('password'),
            'resume_attachment' => 'resume-attachments/juan-resume.pdf',
        ]);
        $other = Client::create([
            'name' => 'Maria Santos',
            'email' => 'maria@example.com',
            'password' => Hash::make('password'),
        ]);

        $this->actingAs(User::factory()->create())
            ->get(route('admin.documents.download', [$other, 'resume', 'resume']))
            ->assertNotFound();
    }
}