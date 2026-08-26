<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('applicant_monitoring_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('applicant_monitoring_id')->constrained('applicant_monitorings')->cascadeOnDelete();
            $table->foreignId('client_id')->constrained('clients')->cascadeOnDelete();
            $table->string('country')->nullable();
            $table->string('rank')->nullable();
            $table->string('contact')->nullable();
            $table->string('status')->default('Pending');
            $table->text('remarks')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('applicant_monitoring_items');
    }
};
