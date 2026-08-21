<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('clients', function (Blueprint $table) {
            // Identity
            $table->string('first_name')->nullable()->after('name');
            $table->string('middle_name')->nullable()->after('first_name');
            $table->string('last_name')->nullable()->after('middle_name');
            $table->date('date_applied')->nullable()->after('last_name');

            // Birth & family
            $table->string('place_of_birth')->nullable()->after('date_applied');
            $table->date('date_of_birth')->nullable()->after('place_of_birth');
            $table->string('mothers_maiden_name')->nullable()->after('date_of_birth');
            $table->string('fathers_name')->nullable()->after('mothers_maiden_name');
            $table->string('nationality')->nullable()->after('fathers_name');
            $table->string('religion')->nullable()->after('nationality');

            // Position & background
            $table->string('current_position')->nullable()->after('religion');
            $table->string('position_applied_for')->nullable()->after('current_position');
            $table->string('educational_attainment')->nullable()->after('position_applied_for');
            $table->string('last_salary')->nullable()->after('educational_attainment');
            $table->string('e_registration_number')->nullable()->after('last_salary');

            // Physical details
            $table->string('body_weight_bmi')->nullable()->after('e_registration_number');
            $table->integer('height_cm')->nullable()->after('body_weight_bmi');
            $table->string('coverall_shoe_size')->nullable()->after('height_cm');

            // Contact & address
            $table->text('current_home_address')->nullable()->after('coverall_shoe_size');
            $table->string('personal_mobile_no')->nullable()->after('current_home_address');
            $table->string('fax_no')->nullable()->after('personal_mobile_no');
            $table->string('email_address')->nullable()->after('fax_no');
            $table->string('nearest_airport')->nullable()->after('email_address');

            // Next of kin / emergency
            $table->string('next_of_kin')->nullable()->after('nearest_airport');
            $table->string('relationship')->nullable()->after('next_of_kin');
            $table->string('emergency_contact')->nullable()->after('relationship');

            // Government IDs
            $table->string('sss_no')->nullable()->after('emergency_contact');
            $table->string('pagibig_no')->nullable()->after('sss_no');
            $table->string('philhealth_no')->nullable()->after('pagibig_no');
        });
    }

    public function down(): void
    {
        Schema::table('clients', function (Blueprint $table) {
            $table->dropColumn([
                'first_name','middle_name','last_name','date_applied',
                'place_of_birth','date_of_birth','mothers_maiden_name','fathers_name','nationality','religion',
                'current_position','position_applied_for','educational_attainment','last_salary','e_registration_number',
                'body_weight_bmi','height_cm','coverall_shoe_size',
                'current_home_address','personal_mobile_no','fax_no','email_address','nearest_airport',
                'next_of_kin','relationship','emergency_contact',
                'sss_no','pagibig_no','philhealth_no'
            ]);
        });
    }
};
