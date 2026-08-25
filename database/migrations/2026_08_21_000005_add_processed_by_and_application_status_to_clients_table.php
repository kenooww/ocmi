<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('clients', function (Blueprint $table) {
            $table->string('processed_by')->nullable()->after('type_of_job');
            $table->string('application_status')->nullable()->default('NEW APPLICANT')->after('processed_by');
        });
    }

    public function down(): void
    {
        Schema::table('clients', function (Blueprint $table) {
            $table->dropColumn(['processed_by', 'application_status']);
        });
    }
};
