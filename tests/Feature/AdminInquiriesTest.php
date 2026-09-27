<?php

namespace Tests\Feature;

use App\Models\Inquiry;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AdminInquiriesTest extends TestCase
{
    use RefreshDatabase;

    private function inquiry(array $overrides = []): Inquiry
    {
        return Inquiry::create(array_merge([
            'first_name' => 'Juan', 'middle_name' => 'Santos', 'last_name' => 'Cruz',
            'birthday' => '1990-06-15', 'contact_number' => '+63 917 123 4567',
            'vessel' => 'Supply Vessel', 'document_status' => 'Documents ready',
            'current_location' => 'Manila', 'present_salary' => 'USD 2,000/month',
        ], $overrides));
    }

    public function test_guests_cannot_access_inquiries(): void
    {
        $this->get(route('admin.inquiries.index'))->assertRedirect();
    }

    public function test_authenticated_users_can_search_and_receive_details_for_the_modal(): void
    {
        $this->inquiry(['first_name' => 'Maria', 'vessel' => 'Tanker']);
        $match = $this->inquiry();
        $this->actingAs(User::factory()->create())
            ->get(route('admin.inquiries.index', ['search' => 'Supply']))
            ->assertOk()->assertInertia(fn (Assert $page) => $page->component('Admin/Inquiries')
                ->where('filters.search', 'Supply')->where('inquiries.total', 1)
                ->where('inquiries.data.0.id', $match->id)
                ->where('inquiries.data.0.middle_name', 'Santos')
                ->where('inquiries.data.0.document_status', 'Documents ready')
                ->where('inquiries.data.0.present_salary', 'USD 2,000/month'));
    }

    public function test_records_are_paginated_newest_first(): void
    {
        for ($i = 0; $i < 16; $i++) {
            $last = $this->inquiry();
        }
        $this->actingAs(User::factory()->create())->get(route('admin.inquiries.index'))
            ->assertInertia(fn (Assert $page) => $page->component('Admin/Inquiries')
                ->has('inquiries.data', 15)->where('inquiries.total', 16)
                ->where('inquiries.data.0.id', $last->id)->where('inquiries.last_page', 2));
        $this->get(route('admin.inquiries.index', ['page' => 2]))
            ->assertInertia(fn (Assert $page) => $page->has('inquiries.data', 1));
    }
}
