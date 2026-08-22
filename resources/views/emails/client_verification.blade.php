<div style="font-family: Arial, sans-serif; line-height:1.5; color:#333;">
    <h2>Hello {{ $client->name ?? 'Seafarer' }},</h2>
    <p>Thanks for your application on {{ $company['company_name'] ?? 'Alpha Omega Crewing' }}. Click the link below to verify your email and continue registration:</p>
    <p><a href="{{ $link }}">Verify my email</a></p>
    @if (! empty($temporaryPassword))
        <p>You may also sign in using these temporary credentials:</p>
        <p>
            <strong>Email:</strong> {{ $client->email }}<br/>
            <strong>Temporary password:</strong> {{ $temporaryPassword }}
        </p>
        <p>For security, you will be required to change this password the first time you sign in with these credentials.</p>
    @endif
    <p>If the link doesn't work, copy and paste the URL into your browser:</p>
    <p>{{ $link }}</p>
    <p>Thanks,<br/>{{ $company['portal_name'] ?? 'The Team' }}</p>
</div>
