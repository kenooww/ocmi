<?php

namespace App\Mail;

use App\Models\Inquiry;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class InquiryReceivedMail extends Mailable
{
    use Queueable, SerializesModels;

    public $tries = 3;

    public function __construct(public Inquiry $inquiry, public array $company)
    {
    }

    public function build()
    {
        return $this->subject('We have received your inquiry')->view('emails.inquiry-received');
    }
}
