<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('seafarer_contracts', function (Blueprint $table) {
            $table->string('allotment_amount_3')->nullable();
            $table->string('allottee_3_name')->nullable();
            $table->string('allottee_3_relationship')->nullable();
            $table->text('allottee_3_address')->nullable();
            $table->string('allottee_3_bank')->nullable();
            $table->string('allottee_3_account_number')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('seafarer_contracts', function (Blueprint $table) {
            $table->dropColumn([
                'allotment_amount_3', 'allottee_3_name', 'allottee_3_relationship',
                'allottee_3_address', 'allottee_3_bank', 'allottee_3_account_number',
            ]);
        });
    }
};
