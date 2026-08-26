<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('principals', function (Blueprint $table) {
            if (!Schema::hasColumn('principals', 'email_address')) {
                $table->string('email_address')->nullable()->after('contact');
            }
        });
    }

    public function down(): void
    {
        Schema::table('principals', function (Blueprint $table) {
            if (Schema::hasColumn('principals', 'email_address')) {
                $table->dropColumn('email_address');
            }
        });
    }
};
