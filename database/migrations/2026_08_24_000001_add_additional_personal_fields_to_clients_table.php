<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('clients', function (Blueprint $table) {
            $table->string('sector_sub_caste')->nullable()->after('religion');
            $table->string('telephone_numbers')->nullable()->after('personal_mobile_no');
            $table->string('wife_name')->nullable()->after('relationship');
            $table->string('wife_ic_no')->nullable()->after('wife_name');
            $table->string('wife_occupation')->nullable()->after('wife_ic_no');
            $table->date('marriage_date')->nullable()->after('wife_occupation');
            $table->string('wife_income_tax_no')->nullable()->after('marriage_date');
            $table->string('epf_no')->nullable()->after('pagibig_no');
            $table->string('socso_no')->nullable()->after('epf_no');
            $table->string('blood')->nullable()->after('socso_no');
            $table->string('expected_salary')->nullable()->after('last_salary');
            $table->string('safety_shoe_size')->nullable()->after('coverall_shoe_size');
            $table->string('boiler_suit_size')->nullable()->after('safety_shoe_size');
        });
    }

    public function down(): void
    {
        Schema::table('clients', function (Blueprint $table) {
            $table->dropColumn([
                'sector_sub_caste',
                'telephone_numbers',
                'wife_name',
                'wife_ic_no',
                'wife_occupation',
                'marriage_date',
                'wife_income_tax_no',
                'epf_no',
                'socso_no',
                'blood',
                'expected_salary',
                'safety_shoe_size',
                'boiler_suit_size',
            ]);
        });
    }
};
