<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        {{-- Theme initializer: prefer explicit client-saved preference; default = light --}}
        <script>
            (function () {
                try {
                    // Try client-saved preference first (localStorage)
                    var saved = null;
                    try { saved = localStorage.getItem('appearance'); } catch (e) { saved = null; }

                    // If user explicitly saved 'dark', apply dark.
                    if (saved === 'dark') {
                        document.documentElement.classList.add('dark');
                        document.documentElement.style.colorScheme = 'dark';
                        return;
                    }

                    // If user explicitly saved 'light', ensure dark is removed.
                    if (saved === 'light') {
                        document.documentElement.classList.remove('dark');
                        document.documentElement.style.colorScheme = 'light';
                        return;
                    }

                    // If no saved preference, default to LIGHT (do not follow system).
                    // If you later want to respect system preference when there's no saved value,
                    // replace the next lines with the "system" behavior.
                    document.documentElement.classList.remove('dark');
                    document.documentElement.style.colorScheme = 'light';
                } catch (err) {
                    // Fail silently — default light
                }
            })();
        </script>

        {{-- Inline style to set the HTML background color based on our theme in app.css --}}
        <style>
            html {
                background-color: oklch(1 0 0);
            }

            html.dark {
                background-color: oklch(0.145 0 0);
            }
        </style>

        <title inertia>{{ config('app.name', 'Laravel') }}</title>

        <link rel="icon" href="/assets/img/ched-logo.png" type="image/png">
        <link rel="apple-touch-icon" href="/assets/img/ched-logo.png">

        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />

        @viteReactRefresh
        @vite(['resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        @inertia
    </body>
</html>
