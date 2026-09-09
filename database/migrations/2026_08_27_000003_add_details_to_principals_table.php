<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('principals', function (Blueprint $table) {
            if (!Schema::hasColumn('principals', 'principal_code')) {
                $table->string('principal_code', 100)->nullable()->unique()->after('principal_name');
            }

            if (!Schema::hasColumn('principals', 'address')) {
                $table->text('address')->nullable()->after('principal_code');
            }

            if (!Schema::hasColumn('principals', 'contact')) {
                $table->string('contact')->nullable()->after('address');
            }

            if (!Schema::hasColumn('principals', 'email_address')) {
                $table->string('email_address')->nullable()->after('contact');
            }
        });
    }

    public function down(): void
    {
        Schema::table('principals', function (Blueprint $table) {
            if (Schema::hasColumn('principals', 'email_address')) {
                $table->dropColumn('email_address');
            }

            if (Schema::hasColumn('principals', 'contact')) {
                $table->dropColumn('contact');
            }

            if (Schema::hasColumn('principals', 'address')) {
                $table->dropColumn('address');
            }

            if (Schema::hasColumn('principals', 'principal_code')) {
                $table->dropColumn('principal_code');
            }
        });
    }
};
