<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('clients')->where('application_status', 'TO REPORT TO OFFICE')->update(['application_status' => 'DONE REPORTING']);
        DB::table('application_status_logs')->where('previous_status', 'TO REPORT TO OFFICE')->update(['previous_status' => 'DONE REPORTING']);
        DB::table('application_status_logs')->where('status', 'TO REPORT TO OFFICE')->update(['status' => 'DONE REPORTING']);

        DB::table('inquiries')->where('status', 'To Report to Office')->update(['status' => 'Done Reporting']);
        DB::table('inquiry_status_logs')->where('from_status', 'To Report to Office')->update(['from_status' => 'Done Reporting']);
        DB::table('inquiry_status_logs')->where('to_status', 'To Report to Office')->update(['to_status' => 'Done Reporting']);
    }

    public function down(): void
    {
        DB::table('clients')->where('application_status', 'DONE REPORTING')->update(['application_status' => 'TO REPORT TO OFFICE']);
        DB::table('application_status_logs')->where('previous_status', 'DONE REPORTING')->update(['previous_status' => 'TO REPORT TO OFFICE']);
        DB::table('application_status_logs')->where('status', 'DONE REPORTING')->update(['status' => 'TO REPORT TO OFFICE']);

        DB::table('inquiries')->where('status', 'Done Reporting')->update(['status' => 'To Report to Office']);
        DB::table('inquiry_status_logs')->where('from_status', 'Done Reporting')->update(['from_status' => 'To Report to Office']);
        DB::table('inquiry_status_logs')->where('to_status', 'Done Reporting')->update(['to_status' => 'To Report to Office']);
    }
};
