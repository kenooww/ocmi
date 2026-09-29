<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('inquiries', function (Blueprint $table) {
            $table->string('present_rank')->nullable();
            $table->decimal('years_in_present_rank', 5, 2)->nullable();
            $table->string('applied_rank')->nullable();
            $table->string('whatsapp_number')->nullable();
            $table->string('email')->nullable();
            $table->string('facebook_account')->nullable();
            $table->string('last_salary')->nullable();
            $table->string('valid_visa_on_hand')->nullable();
            $table->string('nationality')->nullable();
            $table->text('vessel_information')->nullable();
            $table->string('offshore_vessel_type')->nullable();
            $table->decimal('years_of_experience', 5, 2)->nullable();
            $table->string('place_of_operation')->nullable();
            $table->string('offshore_approval')->nullable();
            $table->string('vessel_system')->nullable();
            $table->text('latest_vessel_experience')->nullable();
            $table->date('latest_sign_off_date')->nullable();
            $table->text('other_vessel_experience')->nullable();
            $table->text('additional_skills')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('inquiries', function (Blueprint $table) {
            $table->dropColumn(['present_rank', 'years_in_present_rank', 'applied_rank', 'whatsapp_number', 'email', 'facebook_account', 'last_salary', 'valid_visa_on_hand', 'nationality', 'vessel_information', 'offshore_vessel_type', 'years_of_experience', 'place_of_operation', 'offshore_approval', 'vessel_system', 'latest_vessel_experience', 'latest_sign_off_date', 'other_vessel_experience', 'additional_skills']);
        });
    }
};
