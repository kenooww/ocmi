<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddPrivacyActConsentToClientsTable extends Migration
{
    public function up()
    {
        Schema::table('clients', function (Blueprint $table) {
            $table->boolean('privacy_act_accepted')->default(false)->after('resume_attachment');
            $table->timestamp('privacy_act_accepted_at')->nullable()->after('privacy_act_accepted');
        });
    }

    public function down()
    {
        Schema::table('clients', function (Blueprint $table) {
            $table->dropColumn(['privacy_act_accepted', 'privacy_act_accepted_at']);
        });
    }
}
