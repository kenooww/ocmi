<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Inquiry received</title></head>
<body style="margin:0;background:#f3f4f6;font-family:Arial,Helvetica,sans-serif;color:#303030;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td align="center" style="padding:24px 12px;">
<table role="presentation" width="600" cellspacing="0" cellpadding="0" style="width:100%;max-width:600px;background:white;border:1px solid #e2e2e2;border-top:12px solid #bc0000;">
<tr><td style="padding:30px;">
@if(!empty($company['logo_url']))<img src="{{ $company['logo_url'] }}" alt="{{ $company['company_name'] }}" width="64" style="max-height:64px;object-fit:contain;margin-bottom:16px;">@endif
<p style="font-size:13px;color:#777;">{{ $company['company_name'] }}</p>
<h1 style="font-size:21px;margin:24px 0;">Hi {{ $inquiry->first_name }},</h1>
<p style="font-size:16px;line-height:1.8;">We have received your inquiry and it is now in our system. Our team will carefully review your submission and be in touch about next steps.</p>
<p style="font-size:16px;line-height:1.8;">In the meantime, here is a summary of what you submitted:</p>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#faf9f7;border:1px solid #e2e0dc;border-radius:12px;margin:28px 0;">
<tr><td style="padding:24px;"><p style="font-size:12px;letter-spacing:2px;color:#888;margin:0 0 16px;">INQUIRY SUMMARY</p>
@foreach(['Applicant' => trim(implode(' ', array_filter([$inquiry->first_name, $inquiry->middle_name, $inquiry->last_name]))), 'Submitted on' => $inquiry->created_at->format('F j, Y'), 'Position applied for' => $inquiry->applied_rank ?: 'Not provided', 'Present rank' => $inquiry->present_rank, 'Years of experience' => $inquiry->years_of_experience] as $label => $value)
<div style="padding:14px 0;border-bottom:1px solid #e5e5e5;"><div style="font-size:12px;letter-spacing:1px;color:#888;">{{ $label }}</div><div style="font-size:16px;margin-top:5px;color:#171717;">{{ $value }}</div></div>
@endforeach
</td></tr></table>
<p style="font-size:12px;letter-spacing:2px;color:#888;">WHAT HAPPENS NEXT</p>
@foreach(['Review' => 'Our crewing team will review your experience, qualifications, and documents.', 'Screening' => 'Shortlisted candidates will be contacted about the next screening steps.', 'Next steps' => 'Please keep your contact details available so our team can reach you if more information is needed.'] as $heading => $text)
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:20px;"><tr><td width="32" valign="top"><span style="display:inline-block;background:#bc0000;color:white;border-radius:50%;width:24px;height:24px;line-height:24px;text-align:center;font-size:13px;">{{ $loop->iteration }}</span></td><td style="font-size:15px;line-height:1.8;"><strong>{{ $heading }}</strong> — {{ $text }}</td></tr></table>
@endforeach
<p style="margin-top:30px;font-size:13px;color:#777;line-height:1.7;">Thank you for your interest in {{ $company['company_name'] }}.</p>
</td></tr></table></td></tr></table></body></html>
