<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class InquiryTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        \Illuminate\Support\Facades\Mail::fake();
    }

    private function details(): array
    {
        return [
            'present_rank' => 'Master', 'years_of_experience' => 0, 'email' => 'juan@example.com',
            'first_name' => 'Juan', 'middle_name' => '', 'last_name' => 'Cruz',
            'birthday' => '1990-06-15', 'contact_number' => '+63 917 123 4567',
            'vessel' => 'Supply Vessel', 'document_status' => 'Ready',
            'current_location' => 'Manila, Philippines', 'present_salary' => 'USD 2,000/month',
        ];
    }

    public function test_guest_can_submit_an_inquiry_and_see_confirmation(): void
    {
        $this->get(route('inquiry.create'))->assertOk()->assertInertia(fn (Assert $page) => $page->component('Inquiry')->where('submitted', false));
        $this->post(route('inquiry.store'), $this->details())->assertRedirect(route('inquiry.create'))->assertSessionHasNoErrors();
        $this->assertDatabaseHas('inquiries', ['first_name' => 'Juan', 'middle_name' => null, 'present_salary' => 'Usd 2,000/month']);
        $this->get(route('inquiry.create'))->assertInertia(fn (Assert $page) => $page->component('Inquiry')->where('submitted', true));
        $this->get(route('inquiry.create'))->assertInertia(fn (Assert $page) => $page->where('submitted', false));
    }

    public function test_additional_details_are_saved(): void
    {
        $details = array_merge($this->details(), [
            'present_rank' => 'Master', 'years_in_present_rank' => '2.5',
            'applied_rank' => 'Master', 'whatsapp_number' => '+63 917 123 4567',
            'email' => 'officer@example.com', 'facebook_account' => 'Officer Profile',
            'last_salary' => 'USD 2500', 'valid_visa_on_hand' => 'US visa',
            'nationality' => 'Filipino', 'vessel_information' => 'Supply vessel',
            'offshore_vessel_type' => 'AHTS', 'years_of_experience' => '10',
            'place_of_operation' => 'UAE', 'offshore_approval' => 'ARAMCO',
            'vessel_system' => 'DP', 'latest_vessel_experience' => 'Master on AHTS',
            'latest_sign_off_date' => '2025-01-01', 'other_vessel_experience' => 'Tanker',
            'additional_skills' => 'Welding',
        ]);
        $this->post(route('inquiry.store'), $details)->assertSessionHasNoErrors();
        $saved = \App\Models\Inquiry::firstOrFail();
        $this->assertSame($details['birthday'], $saved->birthday->format('Y-m-d'));
        $this->assertSame($details['latest_sign_off_date'], $saved->latest_sign_off_date->format('Y-m-d'));
        unset($details['middle_name'], $details['birthday'], $details['latest_sign_off_date']);
        foreach ($details as $field => $value) {
            if (is_string($value) && ! in_array($field, ['vessel_system', 'offshore_approval', 'email', 'facebook_account'], true)) {
                $details[$field] = \Illuminate\Support\Str::ucfirst(mb_strtolower($value, 'UTF-8'));
            }
        }
        $this->assertDatabaseHas('inquiries', $details);
    }

    public function test_invalid_additional_details_are_rejected(): void
    {
        $this->post(route('inquiry.store'), array_merge($this->details(), [
            'offshore_approval' => 'Invalid', 'vessel_system' => 'Invalid',
            'years_in_present_rank' => -1, 'years_of_experience' => 'invalid',
            'email' => 'invalid', 'latest_sign_off_date' => now()->addDay()->format('Y-m-d'),
        ]))->assertSessionHasErrors(['offshore_approval', 'vessel_system', 'years_in_present_rank', 'years_of_experience', 'email', 'latest_sign_off_date']);
        $this->assertDatabaseCount('inquiries', 0);
    }

    public function test_duplicates_are_rejected_and_only_one_email_is_queued(): void
    {
        $this->post(route('inquiry.store'), $this->details())->assertSessionHasNoErrors();
        foreach ([['email' => 'JUAN@EXAMPLE.COM', 'contact_number' => '09181111111'], ['email' => 'different@example.com', 'contact_number' => '09171234567']] as $duplicate) {
            $this->post(route('inquiry.store'), array_merge($this->details(), $duplicate))
                ->assertSessionHasErrors(['duplicate' => 'Inquiry already submitted.']);
        }
        $this->assertDatabaseCount('inquiries', 1);
        \Illuminate\Support\Facades\Mail::assertQueued(\App\Mail\InquiryReceivedMail::class, fn ($mail) => $mail->hasTo('juan@example.com') && $mail->connection === null && $mail->afterCommit === true);
        \Illuminate\Support\Facades\Mail::assertQueuedCount(1);
        $mail = new \App\Mail\InquiryReceivedMail(\App\Models\Inquiry::firstOrFail(), \App\Models\CompanySetting::defaults());
        $this->assertStringContainsString('Hi Juan', $mail->render());
        $this->assertStringContainsString('INQUIRY SUMMARY', $mail->render());
    }

    public function test_rank_experience_and_email_are_required(): void
    {
        $this->post(route('inquiry.store'), array_merge($this->details(), [
            'present_rank' => '', 'years_of_experience' => '', 'email' => '',
        ]))->assertSessionHasErrors(['present_rank', 'years_of_experience', 'email']);
        $this->assertDatabaseCount('inquiries', 0);
        \Illuminate\Support\Facades\Mail::assertNothingQueued();
    }

    public function test_required_fields_are_validated_without_saving(): void
    {
        $this->post(route('inquiry.store'), [])->assertSessionHasErrors([
            'first_name', 'last_name', 'birthday', 'contact_number', 'vessel',
            'document_status', 'current_location', 'present_salary',
        ]);
        $this->assertDatabaseCount('inquiries', 0);
    }

    public function test_invalid_values_are_rejected(): void
    {
        $this->post(route('inquiry.store'), array_merge($this->details(), [
            'birthday' => now()->addDay()->format('Y-m-d'), 'contact_number' => 'not a phone',
            'document_status' => str_repeat('x', 2001), 'present_salary' => str_repeat('x', 101),
        ]))->assertSessionHasErrors(['birthday', 'contact_number', 'document_status', 'present_salary']);
        $this->assertDatabaseCount('inquiries', 0);
    }
}
