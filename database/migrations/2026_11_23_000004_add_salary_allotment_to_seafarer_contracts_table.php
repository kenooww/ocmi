<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('seafarer_contracts', function (Blueprint $table) {
            $table->string('allotment_seafarer_name')->nullable()->after('approved_date');
            $table->string('allotment_position')->nullable();
            $table->string('allotment_vessel_name')->nullable();
            $table->string('allotment_monthly_salary')->nullable();
            $table->string('allotment_amount')->nullable();
            $table->string('allottee_name')->nullable();
            $table->string('allottee_relationship')->nullable();
            $table->text('allottee_address')->nullable();
            $table->string('allottee_bank')->nullable();
            $table->string('allottee_account_number')->nullable();
            $table->date('allotment_date')->nullable();
            $table->string('allotment_place')->nullable();
            $table->string('allotment_seafarer_signature')->nullable();
            $table->string('allotment_employer_signature')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('seafarer_contracts', function (Blueprint $table) {
            $table->dropColumn([
                'allotment_seafarer_name', 'allotment_position', 'allotment_vessel_name',
                'allotment_monthly_salary', 'allotment_amount', 'allottee_name',
                'allottee_relationship', 'allottee_address', 'allottee_bank',
                'allottee_account_number', 'allotment_date', 'allotment_place',
                'allotment_seafarer_signature', 'allotment_employer_signature',
            ]);
        });
    }
};
