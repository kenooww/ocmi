<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('applicant_monitoring_items', function (Blueprint $table) {
            if (!Schema::hasColumn('applicant_monitoring_items', 'country')) {
                $table->string('country')->nullable()->after('client_id');
            }
        });
    }

    public function down(): void
    {
        Schema::table('applicant_monitoring_items', function (Blueprint $table) {
            if (Schema::hasColumn('applicant_monitoring_items', 'country')) {
                $table->dropColumn('country');
            }
        });
    }
};
