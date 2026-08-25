<?php

namespace App\Services;

use App\Models\Client;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ClientAttachmentArchiveService
{
    private const FOLDERS = [
        'resume' => [
            'title' => 'Resume',
            'folder' => 'resume-attachments',
            'field' => 'resume_attachment',
        ],
        'dependents' => [
            'title' => 'Dependents',
            'folder' => 'dependent-attachments',
            'relation' => 'dependents',
        ],
        'travel-documents' => [
            'title' => 'Travel Documents',
            'folder' => 'travel-document-attachments',
            'relation' => 'travelDocuments',
        ],
        'certificate-of-competency' => [
            'title' => 'Certificate Of Competency',
            'folder' => 'competency-attachments',
            'relation' => 'certificateCompetencies',
        ],
        'certificate-of-proficiency' => [
            'title' => 'Certificate Of Proficiency',
            'folder' => 'proficiency-attachments',
            'relation' => 'certificateProficiencies',
        ],
        'gmdss-certificates' => [
            'title' => 'GMDSS Certificates',
            'folder' => 'gmdss-certificate-attachments',
            'relation' => 'gmdssCertificates',
        ],
        'vaccinations' => [
            'title' => 'Vaccinations',
            'folder' => 'vaccination-attachments',
            'relation' => 'vaccinations',
        ],
        'flag-documents' => [
            'title' => 'Flag Documents',
            'folder' => 'flag-document-attachments',
            'relation' => 'flagDocuments',
        ],
        'additional-stcw-certificates' => [
            'title' => 'Additional STCW Certificates',
            'folder' => 'additional-stcw-certificate-attachments',
            'relation' => 'additionalStcwCertificates',
        ],
        'offshore-training-certificates' => [
            'title' => 'Offshore Training Certificates',
            'folder' => 'offshore-training-certificate-attachments',
            'relation' => 'offshoreTrainingCertificates',
        ],
        'other-certificates' => [
            'title' => 'Other Certificates',
            'folder' => 'other-certificate-attachments',
            'relation' => 'otherCertificates',
        ],
        'employment-history' => [
            'title' => 'Employment History',
            'folder' => 'employment-history-attachments',
            'relation' => 'employmentHistories',
        ],
    ];

    public function download(Client $client, string $folder)
    {
        abort_unless($folder === 'all' || isset(self::FOLDERS[$folder]), 404);

        $files = $folder === 'all'
            ? $this->allFilesFor($client)
            : $this->filesFor($client, self::FOLDERS[$folder]);

        abort_if(empty($files), 404, 'No attachments found for this download.');

        Storage::disk('local')->makeDirectory('temp-attachment-downloads');

        $zipFileName = 'temp-attachment-downloads/' . $folder . '-' . $client->id . '-' . Str::random(10) . '.zip';
        $zipPath = Storage::disk('local')->path($zipFileName);
        $this->createZip($zipPath, $files);

        $clientName = Str::slug($client->name ?: trim(($client->first_name ?? '') . ' ' . ($client->last_name ?? ''))) ?: 'seafarer';
        $title = $folder === 'all' ? 'All' : self::FOLDERS[$folder]['title'];
        $downloadName = $clientName . '-' . Str::slug($title) . '-attachments.zip';

        return response()->download($zipPath, $downloadName)->deleteFileAfterSend(true);
    }

    private function allFilesFor(Client $client): array
    {
        return collect(self::FOLDERS)
            ->flatMap(function (array $config, string $folder) use ($client) {
                return collect($this->filesFor($client, $config))
                    ->map(fn (array $file) => $file + [
                        'section' => Str::slug($config['title']) ?: $folder,
                    ]);
            })
            ->values()
            ->all();
    }

    private function filesFor(Client $client, array $config): array
    {
        if (isset($config['field'])) {
            $file = $this->publicFile($client->{$config['field']} ?? null, $config);

            return $file ? [$file] : [];
        }

        $client->loadMissing($config['relation']);

        return $client->{$config['relation']}
            ->map(function ($row) use ($config) {
                return $this->publicFile($row->attachment ?? null, $config);
            })
            ->filter()
            ->values()
            ->all();
    }

    private function publicFile(?string $storedPath, array $config): ?array
    {
        if (! $storedPath || strpos($storedPath, $config['folder'] . '/') !== 0) {
            return null;
        }

        if (! Storage::disk('public')->exists($storedPath)) {
            return null;
        }

        return [
            'path' => Storage::disk('public')->path($storedPath),
            'name' => basename($storedPath),
        ];
    }

    private function zipEntryName(array $file, int $index): string
    {
        $name = sprintf('%02d-%s', $index + 1, $file['name']);

        return isset($file['section']) ? $file['section'] . '/' . $name : $name;
    }

    private function createZip(string $zipPath, array $files): void
    {
        if (! is_dir(dirname($zipPath))) {
            mkdir(dirname($zipPath), 0777, true);
        }

        $zip = fopen($zipPath, 'wb');
        abort_unless($zip !== false, 500, 'Unable to create attachment archive.');

        $centralDirectory = '';
        $entries = 0;

        foreach ($files as $index => $file) {
            $entryName = $this->zipEntryName($file, $index);
            $path = $file['path'];
            $data = file_get_contents($path);

            if ($data === false) {
                continue;
            }

            $offset = ftell($zip);
            $size = strlen($data);
            $crc = hexdec(hash('crc32b', $data));
            [$dosTime, $dosDate] = $this->dosDateTime(filemtime($path) ?: time());

            fwrite($zip, pack(
                'VvvvvvVVVvv',
                0x04034b50,
                20,
                0,
                0,
                $dosTime,
                $dosDate,
                $crc,
                $size,
                $size,
                strlen($entryName),
                0
            ));
            fwrite($zip, $entryName);
            fwrite($zip, $data);

            $centralDirectory .= pack(
                'VvvvvvvVVVvvvvvVV',
                0x02014b50,
                20,
                20,
                0,
                0,
                $dosTime,
                $dosDate,
                $crc,
                $size,
                $size,
                strlen($entryName),
                0,
                0,
                0,
                0,
                0,
                $offset
            ) . $entryName;

            $entries++;
        }

        if ($entries === 0) {
            fclose($zip);
            @unlink($zipPath);
            abort(500, 'Unable to add attachments to the archive.');
        }

        $centralDirectoryOffset = ftell($zip);
        fwrite($zip, $centralDirectory);
        fwrite($zip, pack(
            'VvvvvVVv',
            0x06054b50,
            0,
            0,
            $entries,
            $entries,
            strlen($centralDirectory),
            $centralDirectoryOffset,
            0
        ));

        fclose($zip);
    }

    private function dosDateTime(int $timestamp): array
    {
        $parts = getdate($timestamp);

        $time = ($parts['hours'] << 11) | ($parts['minutes'] << 5) | (int) floor($parts['seconds'] / 2);
        $date = (($parts['year'] - 1980) << 9) | ($parts['mon'] << 5) | $parts['mday'];

        return [$time, $date];
    }
}
