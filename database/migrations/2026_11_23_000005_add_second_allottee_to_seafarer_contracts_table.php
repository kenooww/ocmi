<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('seafarer_contracts', function (Blueprint $table) {
            $table->string('allotment_amount_2')->nullable();
            $table->string('allottee_2_name')->nullable();
            $table->string('allottee_2_relationship')->nullable();
            $table->text('allottee_2_address')->nullable();
            $table->string('allottee_2_bank')->nullable();
            $table->string('allottee_2_account_number')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('seafarer_contracts', function (Blueprint $table) {
            $table->dropColumn([
                'allotment_amount_2', 'allottee_2_name', 'allottee_2_relationship',
                'allottee_2_address', 'allottee_2_bank', 'allottee_2_account_number',
            ]);
        });
    }
};
