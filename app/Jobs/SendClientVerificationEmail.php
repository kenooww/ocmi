<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;
use App\Models\Client;
use App\Mail\ClientVerificationMail;

class SendClientVerificationEmail implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public Client $client;
    public string $link;

    public function __construct(Client $client, string $link)
    {
        $this->client = $client;
        $this->link = $link;
    }

    public function handle()
    {
        Mail::to($this->client->email)->send(new ClientVerificationMail($this->client, $this->link));
    }
}
