<?php

namespace Tests\Feature;

use App\Models\Client;
use App\Models\User;
use App\Services\FlexFleetSeaServiceExport;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use ZipArchive;

class FlexFleetSeaServiceExportTest extends TestCase
{
    use RefreshDatabase;

    public function test_download_requires_login(): void
    {
        $this->get('/admin/seafarers/1/flex-fleet/sea-service.xlsx')->assertRedirect();
    }

    public function test_export_preserves_template_and_includes_all_records_without_sample_data(): void
    {
        $client = Client::create(['name' => 'Test Officer', 'email' => 'export@example.com', 'password' => 'password']);
        for ($i = 0; $i < 27; $i++) {
            $client->seaServices()->create([
                'vessel_name' => '=Vessel & '.$i, 'type_imo_number' => 'Tug / IMO 1234567',
                'from_date' => '2026-01-01', 'to_date' => '2026-01-03', 'position' => 'Master',
            ]);
        }
        $path = app(FlexFleetSeaServiceExport::class)->generate($client);
        try {
            $zip = new ZipArchive;
            $this->assertTrue($zip->open($path));
            $xml = $zip->getFromName('xl/worksheets/sheet1.xml');
            $sheet = simplexml_load_string($xml);
            $sheet->registerXPathNamespace('s', 'http://schemas.openxmlformats.org/spreadsheetml/2006/main');
            $this->assertSame('=Vessel & 26', (string) $sheet->xpath('//s:c[@r="B9"]/s:is/s:t')[0]);
            $this->assertSame('3', (string) $sheet->xpath('//s:c[@r="N9"]/s:v')[0]);
            $this->assertSame('=Vessel & 0', (string) $sheet->xpath('//s:c[@r="B35"]/s:is/s:t')[0]);
            $this->assertSame('Test Officer', (string) $sheet->xpath('//s:c[@r="G43"]/s:is/s:t')[0]);
            $this->assertStringContainsString('$N$45', $zip->getFromName('xl/workbook.xml'));
            $this->assertStringNotContainsString('ROPERO', $xml);
            $this->assertFalse($zip->locateName('xl/sharedStrings.xml'));
            $this->assertCount(0, $sheet->xpath('//s:f'));
            $zip->close();
        } finally {
            unlink($path);
        }
        $response = $this->actingAs(User::factory()->create())->get(route('admin.seafarers.flex-fleet.sea-service', $client));
        $response->assertOk()->assertDownload('Flex-Fleet-Sea-Service-test-officer.xlsx');
        unlink($response->baseResponse->getFile()->getPathname());
    }

    public function test_empty_export_removes_all_sample_rows(): void
    {
        $client = Client::create(['name' => 'Empty Officer', 'email' => 'empty@example.com', 'password' => 'password']);
        $path = app(FlexFleetSeaServiceExport::class)->generate($client);
        try {
            $zip = new ZipArchive;
            $zip->open($path);
            $xml = $zip->getFromName('xl/worksheets/sheet1.xml');
            $this->assertStringNotContainsString('Jan de Nul', $xml);
            $this->assertStringNotContainsString('1052', $xml);
            $this->assertStringContainsString('Empty Officer', $xml);
            $zip->close();
        } finally {
            unlink($path);
        }
    }
}
