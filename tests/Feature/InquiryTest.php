<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class InquiryTest extends TestCase
{
    use RefreshDatabase;

    private function details(): array
    {
        return [
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
        $this->assertDatabaseHas('inquiries', ['first_name' => 'Juan', 'middle_name' => null, 'present_salary' => 'USD 2,000/month']);
        $this->get(route('inquiry.create'))->assertInertia(fn (Assert $page) => $page->component('Inquiry')->where('submitted', true));
        $this->get(route('inquiry.create'))->assertInertia(fn (Assert $page) => $page->where('submitted', false));
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
