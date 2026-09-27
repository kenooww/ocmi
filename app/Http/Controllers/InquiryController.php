<?php

namespace App\Http\Controllers;

use App\Models\Inquiry;
use Illuminate\Http\Request;
use Inertia\Inertia;

class InquiryController extends Controller
{
    public function create(Request $request)
    {
        return Inertia::render('Inquiry', [
            'submitted' => (bool) $request->session()->get('inquiry_submitted', false),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'first_name' => ['required', 'string', 'max:255'],
            'middle_name' => ['nullable', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'birthday' => ['required', 'date_format:Y-m-d', 'before_or_equal:today'],
            'contact_number' => ['required', 'string', 'max:50', 'regex:/^\+?[0-9\s().-]{7,50}$/'],
            'vessel' => ['required', 'string', 'max:255'],
            'document_status' => ['required', 'string', 'max:2000'],
            'current_location' => ['required', 'string', 'max:255'],
            'present_salary' => ['required', 'string', 'max:100'],
        ]);

        Inquiry::create($data);

        return to_route('inquiry.create')->with('inquiry_submitted', true);
    }
}
