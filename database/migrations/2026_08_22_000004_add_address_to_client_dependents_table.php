<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddAddressToClientDependentsTable extends Migration
{
    public function up()
    {
        Schema::table('client_dependents', function (Blueprint $table) {
            $table->string('address')->nullable()->after('beneficiary');
        });
    }

    public function down()
    {
        Schema::table('client_dependents', function (Blueprint $table) {
            $table->dropColumn('address');
        });
    }
}
