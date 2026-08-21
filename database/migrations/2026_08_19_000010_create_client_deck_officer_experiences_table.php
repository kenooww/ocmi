<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('client_deck_officer_experiences', function (Blueprint $table) {
            $table->id();
            $table->foreignId('client_id')->constrained()->cascadeOnDelete();
            $table->string('vessel_name')->nullable();
            $table->string('charterer')->nullable();
            $table->string('area_of_operation')->nullable();
            $table->string('dp_operation_hours')->nullable();
            $table->string('supply')->nullable();
            $table->string('dsv')->nullable();
            $table->string('survey')->nullable();
            $table->string('anchor_type')->nullable();
            $table->string('anchor_weight')->nullable();
            $table->string('barges')->nullable();
            $table->string('rig_move')->nullable();
            $table->string('propelled')->nullable();
            $table->string('non_propelled')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('client_deck_officer_experiences');
    }
};
