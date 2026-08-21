<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('client_travel_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('client_id')->constrained()->cascadeOnDelete();
            $table->string('document_type');
            $table->string('number')->nullable();
            $table->string('place_of_issue')->nullable();
            $table->date('date_of_issue')->nullable();
            $table->date('date_of_expiry')->nullable();
            $table->string('attachment')->nullable();
            $table->timestamps();

            $table->unique(['client_id', 'document_type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('client_travel_documents');
    }
};
