<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('seafarer_contracts', function (Blueprint $table) {
            $table->string('contract_status')->nullable()->after('contract_date');
            $table->date('end_contract_date')->nullable()->after('contract_status');
        });
    }

    public function down(): void
    {
        Schema::table('seafarer_contracts', function (Blueprint $table) {
            $table->dropColumn(['contract_status', 'end_contract_date']);
        });
    }
};
