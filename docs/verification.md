# Verification
Tested on Linux with Node 24.22.3 and Chromium. npm run build succeeded. CHROME_PATH=/usr/bin/chromium npm test executed one integrated workflow with one pass and zero failures.

The workflow checked required fields, malformed and oversized images, registration, duplicate rejection and orphan cleanup, restart persistence, image retrieval, search, detail retrieval, missing records, and health through the host interface. Chromium opened the compiled application, captured desktop and 390px mobile screenshots, checked mobile document width, opened a record, rejected an empty form and submitted a valid form. Screenshots contain a temporary test record.

Windows firewall configuration and access from a separate physical LAN device were not tested. The interface-address check ran on the server itself.
