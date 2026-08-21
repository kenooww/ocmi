<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        if (! Schema::hasColumn('clients', 'dependents')) {
            return;
        }

        Schema::table('clients', function (Blueprint $table) {
            $table->dropColumn('dependents');
        });
    }

    public function down(): void
    {
        if (Schema::hasColumn('clients', 'dependents')) {
            return;
        }

        Schema::table('clients', function (Blueprint $table) {
            $table->json('dependents')->nullable()->after('emergency_contact');
        });
    }
};
