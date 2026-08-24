<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use App\Models\Client;
use App\Models\CompanySetting;

class ClientVerificationMail extends Mailable
{
    use Queueable, SerializesModels;

    public $client;
    public $link;

    public function __construct(Client $client, $link)
    {
        $this->client = $client;
        $this->link = $link;
    }

    public function build()
    {
        $company = CompanySetting::current()->publicData();

        return $this->subject(($company['company_name'] ?? 'Alpha Omega Crewing') . ' - Email Verification')
                    ->view('emails.client_verification')
                    ->with([
                        'link' => $this->link,
                        'client' => $this->client,
                        'company' => $company,
                    ]);
    }
}
