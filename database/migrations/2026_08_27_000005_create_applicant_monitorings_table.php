<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('applicant_monitorings', function (Blueprint $table) {
            $table->id();
            $table->date('proposed_date');
            $table->string('proposed_by');
            $table->foreignId('principal_id')->constrained('principals')->cascadeOnDelete();
            $table->string('crewing')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('applicant_monitorings');
    }
};
