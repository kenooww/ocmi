<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('seafarer_contracts', function (Blueprint $table) {
            $table->string('coverage_of_cba')->nullable()->after('overtime');
        });
    }

    public function down(): void
    {
        Schema::table('seafarer_contracts', function (Blueprint $table) {
            $table->dropColumn('coverage_of_cba');
        });
    }
};
