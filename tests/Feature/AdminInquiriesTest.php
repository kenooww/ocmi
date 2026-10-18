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
        $this->post(route('admin.inquiries.store'), [])->assertRedirect();
    }

    public function test_admin_can_manually_add_an_inquiry_without_sending_a_receipt_email(): void
    {
        \Illuminate\Support\Facades\Mail::fake();
        \App\Models\Rank::create(['rank_name' => 'Master']);
        $details = [
            'first_name' => 'Maria', 'middle_name' => '', 'last_name' => 'Santos',
            'birthday' => '1990-06-15', 'contact_number' => '+63 917 123 4567',
            'vessel' => 'Supply Vessel', 'document_status' => 'Documents ready',
            'current_location' => 'Manila', 'present_salary' => 'USD 2,000/month',
            'company_type' => 'Principal', 'present_rank' => 'Master',
            'years_of_experience' => '8', 'email' => 'MARIA@example.com',
            'status' => 'Floating',
        ];

        $this->actingAs(User::factory()->create())
            ->from(route('admin.inquiries.index'))
            ->post(route('admin.inquiries.store'), $details)
            ->assertRedirect(route('admin.inquiries.index'))
            ->assertSessionHasNoErrors();

        $this->assertDatabaseHas('inquiries', [
            'first_name' => 'Maria', 'company_type' => 'Principal',
            'present_rank' => 'Master', 'email' => 'maria@example.com', 'status' => 'Floating',
        ]);
        $this->assertDatabaseCount('inquiry_identities', 2);
        \Illuminate\Support\Facades\Mail::assertNothingQueued();

        $this->from(route('admin.inquiries.index'))
            ->post(route('admin.inquiries.store'), $details)
            ->assertSessionHasErrors(['duplicate' => 'Inquiry already submitted.']);
        $this->assertDatabaseCount('inquiries', 1);
    }

    public function test_authenticated_users_can_search_and_receive_details_for_the_modal(): void
    {
        $this->inquiry(['first_name' => 'Maria', 'vessel' => 'Tanker']);
        $match = $this->inquiry(['company_type' => 'Principal']);
        $this->actingAs(User::factory()->create())
            ->get(route('admin.inquiries.index', ['search' => 'Supply']))
            ->assertOk()->assertInertia(fn (Assert $page) => $page->component('Admin/Inquiries')
                ->where('filters.search', 'Supply')->where('inquiries.total', 1)
                ->where('inquiries.data.0.id', $match->id)
                ->where('inquiries.data.0.middle_name', 'Santos')
                ->where('inquiries.data.0.document_status', 'Documents ready')
                ->where('inquiries.data.0.company_type', 'Principal')
                ->where('inquiries.data.0.present_salary', 'USD 2,000/month'));
    }

    public function test_search_matches_requested_inquiry_fields(): void
    {
        $searchCases = [
            ['offshore_vessel_type' => 'Anchor Handler'],
            ['applied_rank' => 'Chief Officer'],
            ['present_rank' => 'Second Engineer'],
            ['valid_visa_on_hand' => 'Schengen visa'],
            ['company_type' => 'Manning Agent'],
            ['current_location' => 'Rotterdam'],
            ['status' => 'Pending'],
        ];

        foreach ($searchCases as $overrides) {
            $inquiry = $this->inquiry($overrides);
            if (isset($overrides['status'])) {
                $inquiry->status = $overrides['status'];
                $inquiry->save();
            }
            $searchValue = reset($overrides);

            $this->actingAs(User::factory()->create())
                ->get(route('admin.inquiries.index', ['search' => $searchValue]))
                ->assertOk()
                ->assertInertia(fn (Assert $page) => $page->where('inquiries.total', 1)
                    ->where('inquiries.data.0.id', $inquiry->id));
        }
    }

    public function test_status_defaults_to_new_and_all_supported_statuses_can_be_saved(): void
    {
        $inquiry = $this->inquiry();
        $this->assertSame('NEW', $inquiry->fresh()->status);
        $this->actingAs(User::factory()->create());
        foreach (array_keys(Inquiry::STATUSES) as $status) {
            $this->from(route('admin.inquiries.index'))
                ->patch(route('admin.inquiries.status.update', $inquiry), ['status' => $status])
                ->assertSessionHasNoErrors()->assertRedirect(route('admin.inquiries.index'));
            $this->assertSame($status, $inquiry->fresh()->status);
        }
        $this->patch(route('admin.inquiries.status.update', $inquiry), ['status' => 'Invalid'])
            ->assertSessionHasErrors('status');
        $this->assertSame('For application processing', $inquiry->fresh()->status);
    }

    public function test_guests_cannot_update_status(): void
    {
        $inquiry = $this->inquiry();
        $this->patch(route('admin.inquiries.status.update', $inquiry), ['status' => 'Failed'])->assertRedirect();
        $this->assertSame('NEW', $inquiry->fresh()->status);
    }

    public function test_updates_record_remarks_and_actor_in_history(): void
    {
        $inquiry = $this->inquiry();
        $user = User::factory()->create();
        $this->actingAs($user)->patch(route('admin.inquiries.status.update', $inquiry), [
            'status' => 'Pending', 'remarks' => 'Awaiting documents',
        ])->assertSessionHasNoErrors();
        $this->assertDatabaseHas('inquiry_status_logs', [
            'inquiry_id' => $inquiry->id, 'user_id' => $user->id, 'updated_by' => $user->name,
            'from_status' => 'NEW', 'to_status' => 'Pending', 'remarks' => 'Awaiting documents',
        ]);
        $this->patch(route('admin.inquiries.status.update', $inquiry), [
            'status' => 'Pending', 'remarks' => 'Follow-up received',
        ])->assertSessionHasNoErrors();
        $this->get(route('admin.inquiries.index'))->assertInertia(fn (Assert $page) => $page
            ->has('inquiries.data.0.status_logs', 2)
            ->where('inquiries.data.0.status_logs.0.remarks', 'Follow-up received')
            ->where('inquiries.data.0.status_logs.1.remarks', 'Awaiting documents'));
        $this->patch(route('admin.inquiries.status.update', $inquiry), [
            'status' => 'Failed', 'remarks' => str_repeat('x', 5001),
        ])->assertSessionHasErrors('remarks');
        $this->assertSame('Pending', $inquiry->fresh()->status);
        $this->assertDatabaseCount('inquiry_status_logs', 2);
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
