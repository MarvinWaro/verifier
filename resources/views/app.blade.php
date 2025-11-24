<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">


        <link rel="icon" type="image/png" href="/assets/img/ched-logo.png">


        {{-- Theme initializer: ALWAYS default to light mode --}}
        <script>
            (function () {
                try {
                    // Get saved preference from localStorage
                    var saved = null;
                    try {
                        saved = localStorage.getItem('appearance');
                    } catch (e) {
                        saved = null;
                    }

                    // Function to apply theme
                    function applyTheme(isDark) {
                        if (isDark) {
                            document.documentElement.classList.add('dark');
                            document.documentElement.style.colorScheme = 'dark';
                        } else {
                            document.documentElement.classList.remove('dark');
                            document.documentElement.style.colorScheme = 'light';
                        }
                    }

                    // If user explicitly saved 'dark', apply dark
                    if (saved === 'dark') {
                        applyTheme(true);
                        return;
                    }

                    // If user explicitly saved 'system', check system preference
                    if (saved === 'system') {
                        var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
                        applyTheme(prefersDark);
                        return;
                    }

                    // Default to LIGHT (includes when saved === 'light' or saved === null)
                    applyTheme(false);
                } catch (err) {
                    // Fail silently — default to light
                    document.documentElement.classList.remove('dark');
                    document.documentElement.style.colorScheme = 'light';
                }
            })();
        </script>

        {{-- Inline style to set the HTML background color based on theme --}}
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
