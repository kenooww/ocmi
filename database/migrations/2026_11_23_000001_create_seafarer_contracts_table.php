<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('seafarer_contracts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('client_id')->nullable()->constrained('clients')->nullOnDelete();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('contract_number')->nullable()->index();
            $table->string('status')->default('Draft');

            $table->string('seafarer_name')->nullable();
            $table->date('date_of_birth')->nullable();
            $table->string('place_of_birth')->nullable();
            $table->text('permanent_address')->nullable();
            $table->string('sid_no')->nullable();

            $table->string('agency_name')->nullable();
            $table->text('agency_address')->nullable();
            $table->string('dmw_agency_principal')->nullable();
            $table->string('principal_name')->nullable();
            $table->text('principal_address')->nullable();
            $table->string('shipper_name')->nullable();
            $table->text('shipper_address')->nullable();

            $table->string('vessel_name')->nullable();
            $table->string('imo_number')->nullable();
            $table->string('gross_registered_tonnage')->nullable();
            $table->string('year_built')->nullable();
            $table->string('flag')->nullable();
            $table->string('vessel_type')->nullable();
            $table->string('classification_society')->nullable();

            $table->string('duration')->nullable();
            $table->string('position')->nullable();
            $table->string('basic_monthly_salary')->nullable();
            $table->string('hours_of_work')->nullable();
            $table->string('overtime')->nullable();
            $table->string('leave_pay')->nullable();
            $table->string('collective_bargaining_agreement')->nullable();
            $table->date('contract_date')->nullable();
            $table->string('contract_place')->nullable();

            $table->string('seafarer_signature_name')->nullable();
            $table->string('employer_name')->nullable();
            $table->string('employer_designation')->nullable();
            $table->string('approved_by_name')->nullable();
            $table->string('approved_by_designation')->nullable();
            $table->string('dmw_place')->nullable();
            $table->date('approved_date')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('seafarer_contracts');
    }
};
