# Zee Links Warehouse Asset Management
A local asset register for warehouse staff. Register equipment with a photograph, search identification numbers, and open a record to inspect its photograph and registration time. React and Vite render the responsive dashboard with Tailwind CSS. Express serves both the compiled client and the REST API. Node's SQLite driver stores records on disk.

## Install and start
Install Node.js 24 LTS with npm. Extract the project and open a terminal in the directory containing package.json. Run these commands from that directory.

    npm ci
    npm run build
    npm start

Open http://localhost:3000 on the server. Installation needs internet access to fetch dependencies. Normal operation uses local files. Copy .env.example to .env to override PORT, HOST or DATA_DIR. Restart after changing settings.

For development, run npm start in one terminal and npm run dev in another. Open the Vite URL printed in the terminal. Its API and image proxy expects Express on port 3000.

## LAN access
The production server binds to 0.0.0.0 by default. On Windows use ipconfig to find the warehouse computer's active Wi-Fi or Ethernet IPv4 address. From a device on the same private network, open http://192.168.1.20:3000 replacing the example address with that IPv4 address. Keep the server process running and disable sleep during operation.

On a trusted Windows Private network, an administrator can allow inbound access from the local subnet using PowerShell:

    New-NetFirewallRule -DisplayName "Zee Links Warehouse" -Direction Inbound -Protocol TCP -LocalPort 3000 -Profile Private -RemoteAddress LocalSubnet -Action Allow

If access fails, check /api/health on localhost first, then through the LAN IP. Verify the port, network profile, firewall rule, and guest Wi-Fi client isolation. This assessment assumes a trusted LAN where every client can read and register assets. Avoid router port forwarding.

## Layout and storage
- client/ — React dashboard, registration form, record details and responsive styles
- server/index.js — routing, Multer limits, image serving and error handling
- server/controllers.js — HTTP request and response handling
- server/service.js — image decoding, storage and failed-insert cleanup
- server/validation.js — field constraints
- server/db.js — schema initialization and parameterized queries
- tests/system.js — isolated production workflow test
- docs/ — verification results and screenshots

Startup creates storage/assets.sqlite and storage/images. The assets table contains id, asset_id (unique with SQLite NOCASE), category, image_path and created_at (UTC). The browser formats timestamps in the viewer's local timezone. Stop the server before copying the entire storage directory for backup. Ensure the server account can write there. A missing dashboard usually means npm run build has yet to run.

## REST API
Successful responses wrap the result in a data property. Errors contain an error message. List returns an array, while create and detail return one record.

    curl http://localhost:3000/api/health
    curl http://localhost:3000/api/assets
    curl "http://localhost:3000/api/assets?search=FLT"
    curl http://localhost:3000/api/assets/1
    curl -F "asset_id=FLT-001" -F "category=Forklift" -F "photo=@forklift.jpg" http://localhost:3000/api/assets

Use curl.exe on Windows. GET detail uses the numeric primary key. Search matches an ID substring. POST uses multipart/form-data with asset_id (1–80 characters), category (1–100), and photo (JPEG, PNG or WebP, maximum 5 MiB and 40 megapixels). The server decodes the image and writes WebP under a generated filename. Fetch the returned image_path from the same server.

Creation returns 201. Reads return 200. Invalid input returns 400, a missing record returns 404, duplicate IDs return 409, and oversized uploads return 413.

## Automation and tests
A scanner acting as a keyboard can fill the ID field. An automated station can submit the same multipart request with its captured image and category. Record the numeric id from the 201 response. After a timeout, search and check the exact identification number before retrying. Duplicate submissions cannot overwrite existing records.

Run npm test for API and restart checks. For browser checks, build first and set CHROME_PATH to a local Chromium executable before running npm test. Tests use temporary storage and port 39188. Browser checks write desktop and mobile screenshots in docs/.
