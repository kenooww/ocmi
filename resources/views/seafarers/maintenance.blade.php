<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>System Under Maintenance</title>
    <style>
        body {
            min-height: 100vh;
            margin: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #eef2f0;
            color: #16222b;
            font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        }

        main {
            width: min(100% - 32px, 560px);
            text-align: center;
        }

        .brand {
            display: inline-flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 28px;
            text-align: left;
        }

        .brand-mark {
            width: 48px;
            height: 48px;
            border-radius: 4px;
            background: #ffffff;
            box-shadow: 0 1px 3px rgb(15 23 42 / 0.12);
            object-fit: contain;
            padding: 4px;
            box-sizing: border-box;
        }

        .brand-fallback {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            color: #0f3049;
            font-size: 24px;
            font-weight: 700;
        }

        .portal {
            margin: 0;
            font-size: 20px;
            line-height: 1.15;
            font-weight: 700;
        }

        .tagline {
            margin: 4px 0 0;
            color: #5b6b70;
            font-size: 12px;
        }

        section {
            border: 1px solid #dce3df;
            border-radius: 4px;
            background: #ffffff;
            padding: 40px 28px;
            box-shadow: 0 1px 3px rgb(15 23 42 / 0.08);
        }

        .icon {
            display: inline-flex;
            width: 64px;
            height: 64px;
            align-items: center;
            justify-content: center;
            border-radius: 999px;
            background: #f5ebda;
            color: #b8863b;
            font-size: 30px;
            font-weight: 700;
        }

        h1 {
            margin: 24px 0 0;
            font-size: 32px;
            line-height: 1.2;
        }

        p.message {
            max-width: 420px;
            margin: 12px auto 0;
            color: #5b6b70;
            font-size: 14px;
            line-height: 1.7;
        }
    </style>
</head>
<body>
    @php
        $companyName = $company['company_name'] ?? 'Alpha Omega Crewing';
        $portalName = $company['portal_name'] ?? 'Anchor Point';
        $tagline = $company['tagline'] ?? 'Seafarer portal';
        $logo = $company['logo'] ?? null;
    @endphp

    <main>
        <div class="brand">
            @if ($logo)
                <img class="brand-mark" src="{{ asset('storage/' . $logo) }}" alt="{{ $companyName }}">
            @else
                <span class="brand-mark brand-fallback">A</span>
            @endif
            <div>
                <p class="portal">{{ $portalName }}</p>
                <p class="tagline">{{ $tagline }}</p>
            </div>
        </div>

        <section>
            <div class="icon">!</div>
            <h1>System Under Maintenance</h1>
            <p class="message">
                The seafarer portal is temporarily unavailable while maintenance is active. Please check back later.
            </p>
        </section>
    </main>
</body>
</html>
