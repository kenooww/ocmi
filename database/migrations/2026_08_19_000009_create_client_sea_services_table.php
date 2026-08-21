<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('client_sea_services', function (Blueprint $table) {
            $table->id();
            $table->foreignId('client_id')->constrained()->cascadeOnDelete();
            $table->date('from_date')->nullable();
            $table->date('to_date')->nullable();
            $table->unsignedInteger('duration_months')->nullable();
            $table->unsignedInteger('duration_days')->nullable();
            $table->string('position')->nullable();
            $table->string('vessel_name')->nullable();
            $table->string('type_imo_number')->nullable();
            $table->string('area_of_operation')->nullable();
            $table->string('flag')->nullable();
            $table->string('oilfield_yn')->nullable();
            $table->string('propulsion_type')->nullable();
            $table->string('grt')->nullable();
            $table->string('bollard_pull')->nullable();
            $table->string('main_engine_type_model')->nullable();
            $table->string('main_engine_kw')->nullable();
            $table->text('ship_owner_manager_contact')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('client_sea_services');
    }
};
