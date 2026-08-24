<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('client_certificate_competencies', function (Blueprint $table) {
            $table->string('stcw_regulation')->nullable()->after('certificate_number');
            $table->string('endorsement_number')->nullable()->after('stcw_regulation');
            $table->date('revalidation_date')->nullable()->after('place_of_issue');
            $table->date('endorsement_expiry_date')->nullable()->after('date_of_expiry');
        });
    }

    public function down(): void
    {
        Schema::table('client_certificate_competencies', function (Blueprint $table) {
            $table->dropColumn([
                'stcw_regulation',
                'endorsement_number',
                'revalidation_date',
                'endorsement_expiry_date',
            ]);
        });
    }
};
