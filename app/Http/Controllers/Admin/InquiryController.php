<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Inquiry;
use Illuminate\Http\Request;
use Inertia\Inertia;

class InquiryController extends Controller
{
    public function index(Request $request)
    {
        $request->validate(['search' => ['nullable', 'string', 'max:255']]);
        $search = trim((string) $request->query('search', ''));
        $inquiries = Inquiry::query()->with('statusLogs')
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($query) use ($search) {
                    foreach (['first_name', 'middle_name', 'last_name', 'contact_number', 'vessel', 'current_location'] as $field) {
                        $query->orWhere($field, 'like', '%'.$search.'%');
                    }
                });
            })
            ->latest()->orderByDesc('id')->paginate(15)->withQueryString();

        return Inertia::render('Admin/Inquiries', [
            'inquiries' => $inquiries,
            'filters' => ['search' => $search],
            'statusOptions' => Inquiry::STATUSES,
        ]);
    }

    public function updateStatus(Request $request, Inquiry $inquiry)
    {
        $data = $request->validate([
            'status' => ['required', 'string', \Illuminate\Validation\Rule::in(array_keys(Inquiry::STATUSES))],
            'remarks' => ['nullable', 'string', 'max:5000'],
        ]);
        \Illuminate\Support\Facades\DB::transaction(function () use ($inquiry, $data, $request) {
            $locked = Inquiry::query()->lockForUpdate()->findOrFail($inquiry->id);
            $locked->statusLogs()->create([
                'user_id' => $request->user()->id,
                'updated_by' => $request->user()->name,
                'from_status' => $locked->status,
                'to_status' => $data['status'],
                'remarks' => isset($data['remarks']) ? \Illuminate\Support\Str::ucfirst(mb_strtolower($data['remarks'], 'UTF-8')) : null,
            ]);
            $locked->status = $data['status'];
            $locked->save();
        });

        return back();
    }

}
