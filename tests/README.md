# Tester

Webbläsartester med Playwright mot en låtsas-Supabase (`fake-supabase.js`).

1. Starta en webbserver i mappen med appen: `python3 -m http.server 8766`
2. Kör ett test: `node tests/reg.js`

Skripten pekar på `/tmp/vagtest/fake-supabase.js`; kopiera dit filen eller ändra sökvägen.
Läge väljs med URL-parametrar: `?m=admin|styr|medlem|login|new|wait|no`, `&super=1`, `&vag=1`, `&img=1`.
