<?php

use App\Support\InquiryIdentity;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('inquiry_identities', function (Blueprint $table) {
            $table->string('identity', 80)->primary();
            $table->foreignId('inquiry_id')->constrained()->cascadeOnDelete();
        });
        DB::table('inquiries')->orderBy('id')->chunkById(200, function ($inquiries) {
            foreach ($inquiries as $inquiry) {
                foreach (InquiryIdentity::keys($inquiry->email, $inquiry->contact_number) as $key) {
                    DB::table('inquiry_identities')->insertOrIgnore(['identity' => $key, 'inquiry_id' => $inquiry->id]);
                }
            }
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inquiry_identities');
    }
};
