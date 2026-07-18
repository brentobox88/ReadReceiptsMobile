@echo off
echo ?? Getting your IP address...
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr "IPv4 Address"') do set IP=%%a
set IP=%IP: =%
echo ?? Your IP is: %IP%

echo ?? Updating API URLs...
powershell -Command "Get-ChildItem -Path 'src\screens\*.tsx' | ForEach-Object {  = Get-Content .FullName -Raw;  =  -replace '10\.\d+\.\d+\.\d+', '%IP%';  | Out-File -FilePath .FullName -Encoding UTF8 -Force }"

echo ? API URL updated to: %IP%:8000
echo ?? Starting the app...
npx expo start --clear



