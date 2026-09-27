<?php

namespace App\Services;

use App\Models\Client;
use Carbon\Carbon;
use DOMDocument;
use DOMElement;
use DOMXPath;
use RuntimeException;
use ZipArchive;

class FlexFleetSeaServiceExport
{
    private const NS = 'http://schemas.openxmlformats.org/spreadsheetml/2006/main';

    public function generate(Client $client): string
    {
        $path = tempnam(sys_get_temp_dir(), 'flex-fleet-');
        try {
            copy(resource_path('templates/flex-fleet-sea-service.xlsx'), $path);
            $zip = new ZipArchive;
            if ($zip->open($path) !== true) {
                throw new RuntimeException('Unable to open the Flex Fleet template.');
            }
            $doc = new DOMDocument;
            $doc->loadXML($zip->getFromName('xl/worksheets/sheet1.xml'));
            $xpath = new DOMXPath($doc);
            $xpath->registerNamespace('s', self::NS);
            $services = $client->seaServices()->orderByDesc('to_date')->orderByDesc('id')->get();
            $extra = max(0, $services->count() - 25);
            // Extend the service table and move the signature/footer without losing formatting.
            if ($extra) {
                foreach ($xpath->query('//s:row') as $row) {
                    $number = (int) $row->getAttribute('r');
                    if ($number >= 34) {
                        $row->setAttribute('r', $number + $extra);
                        foreach ($xpath->query('s:c', $row) as $cell) {
                            $cell->setAttribute('r', preg_replace('/\d+/', (string) ($number + $extra), $cell->getAttribute('r')));
                        }
                    }
                }
                $prototype = $xpath->query('//s:row[@r="33"]')->item(0);
                $next = $prototype->nextSibling;
                for ($number = 34; $number <= 33 + $extra; $number++) {
                    $row = $prototype->cloneNode(true);
                    $row->setAttribute('r', $number);
                    foreach ($xpath->query('s:c', $row) as $cell) {
                        $cell->setAttribute('r', preg_replace('/\d+/', (string) $number, $cell->getAttribute('r')));
                    }
                    $prototype->parentNode->insertBefore($row, $next);
                }
                foreach ($xpath->query('//s:mergeCell | //s:dimension') as $element) {
                    $element->setAttribute('ref', preg_replace_callback('/\d+/', fn ($m) => $m[0] >= 34 ? $m[0] + $extra : $m[0], $element->getAttribute('ref')));
                }
            }
            $set = function (string $ref, mixed $value, bool $numeric = false) use ($doc, $xpath): void {
                $cell = $xpath->query('//s:c[@r="'.$ref.'"]')->item(0);
                if (! $cell instanceof DOMElement) {
                    throw new RuntimeException('Missing template cell: '.$ref);
                }
                while ($cell->firstChild) {
                    $cell->removeChild($cell->firstChild);
                }
                $cell->removeAttribute('t');
                if ($value === null || $value === '') {
                    return;
                }
                if ($numeric) {
                    $cell->appendChild($doc->createElementNS(self::NS, 'v', (string) $value));
                } else {
                    $cell->setAttribute('t', 'inlineStr');
                    $text = $doc->createElementNS(self::NS, 't');
                    $text->appendChild($doc->createTextNode((string) $value));
                    $cell->appendChild($doc->createElementNS(self::NS, 'is'))->appendChild($text);
                }
            };
            $serial = fn ($date) => $date ? (int) Carbon::parse('1899-12-30')->diffInDays(Carbon::parse($date)->startOfDay()) : null;
            $name = trim(implode(' ', array_filter([$client->first_name, $client->middle_name, $client->last_name]))) ?: $client->name;
            $set('B3', $serial(today()), true);
            $set('B4', $name);
            $set('B5', $client->certificateCompetencies()->value('name'));
            $set('B6', $client->position_applied_for);
            $set('G'.(41 + $extra), $name);
            foreach ($services as $index => $service) {
                $type = trim($service->type_imo_number ?? '');
                preg_match('/\b\d{7}\b/', $type, $imo);
                $vesselType = $imo ? trim(str_replace($imo[0], '', $type), " /-,:\t\n\r") : $type;
                $vesselType = trim(preg_replace('/\bIMO\s*#?\s*:?/i', '', $vesselType), " /-,:\t\n\r");
                $days = $service->from_date && $service->to_date && $service->to_date->gte($service->from_date)
                    ? (int) $service->from_date->diffInDays($service->to_date) + 1 : null;
                $values = [
                    'A' => $service->ship_owner_manager_contact, 'B' => $service->vessel_name,
                    'C' => $vesselType, 'D' => $imo[0] ?? '', 'E' => $service->position,
                    'G' => $service->grt, 'H' => $service->main_engine_kw, 'J' => $service->area_of_operation,
                    'L' => $serial($service->from_date), 'M' => $serial($service->to_date), 'N' => $days,
                ];
                foreach ($values as $column => $value) {
                    $set($column.($index + 9), $value, in_array($column, ['L', 'M', 'N'], true));
                }
            }
            $zip->addFromString('xl/worksheets/sheet1.xml', $doc->saveXML());
            if ($extra) {
                $workbook = str_replace('$N$43', '$N$'.(43 + $extra), $zip->getFromName('xl/workbook.xml'));
                $zip->addFromString('xl/workbook.xml', $workbook);
            }
            $zip->close();

            return $path;
        } catch (\Throwable $exception) {
            @unlink($path);
            throw $exception;
        }
    }
}
