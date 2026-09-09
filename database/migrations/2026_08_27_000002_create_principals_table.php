<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('principals', function (Blueprint $table) {
            $table->id();
            $table->string('principal_name')->unique();
            $table->string('principal_code', 100)->nullable()->unique();
            $table->text('address')->nullable();
            $table->string('contact')->nullable();
            $table->string('email_address')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('principals');
    }
};
