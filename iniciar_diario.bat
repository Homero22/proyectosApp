@echo off
echo Iniciando el Diario de Actividades...
cd /d "%~dp0"

REM Iniciar el servidor de desarrollo en una nueva ventana
start "Servidor del Diario" cmd /c "npm run dev"

REM Esperar 2 segundos para darle tiempo al servidor de iniciar
timeout /t 2 /nobreak > nul

REM Abrir el navegador por defecto
start "" "http://localhost:5173/"

exit
