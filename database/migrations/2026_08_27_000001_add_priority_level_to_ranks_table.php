<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('ranks', function (Blueprint $table) {
            $table->unsignedInteger('priority_level')->default(0)->after('rank_name');
        });
    }

    public function down(): void
    {
        Schema::table('ranks', function (Blueprint $table) {
            $table->dropColumn('priority_level');
        });
    }
};
