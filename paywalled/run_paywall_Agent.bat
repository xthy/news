@echo off
:: [Batch Robustness Check]
:: 1. chcp 65001 ensures the console handles Korean characters (UTF-8).
:: 2. cd /d "%~dp0" is CRITICAL for Task Scheduler. It ensures the script 
::    runs in the folder where this .bat file is located, preventing 
::    "File Not Found" errors for paywalled_pdf.py or config.json.
chcp 65001 >nul

:: Set Environment Variables
set PYTHONIOENCODING=utf-8
set PYTHONUTF8=1
set LC_ALL=en_US.UTF-8
set LANG=en_US.UTF-8

:: Move to the directory where this script lives
cd /d "%~dp0"

:: [Robust Date Handling] 
:: OS-dependent %date% can fail if locale changes. 
:: We attempt to use the current format but add a fallback check.
set YYYY=%date:~0,4%
set MM=%date:~5,2%
set DD=%date:~8,2%
set LOG_FILE=execution_log_%YYYY%-%MM%-%DD%.txt

echo ================================================== >> "%LOG_FILE%" 2>&1
echo [Paywall Agent] Start Time: %date% %time% >> "%LOG_FILE%" 2>&1
echo [Paywall Agent] Current Dir: %cd% >> "%LOG_FILE%" 2>&1
echo ================================================== >> "%LOG_FILE%" 2>&1

:: Check if the Python script actually exists before running
if not exist "paywalled_pdf.py" (
    echo [CRITICAL ERROR] paywalled_pdf.py not found in %cd% >> "%LOG_FILE%" 2>&1
    exit /b 1
)

:: Check for config.json
if not exist "config.json" (
    echo [WARNING] config.json not found. Script may use defaults or fail. >> "%LOG_FILE%" 2>&1
)

:: Run the script
:: Using 'py' (Python Launcher) is standard for Windows. 
echo [Running] py paywalled_pdf.py ... >> "%LOG_FILE%" 2>&1
py paywalled_pdf.py >> "%LOG_FILE%" 2>&1

:: Capture original error level
set EXIT_CODE=%errorlevel%

if %EXIT_CODE% neq 0 (
    echo [ERROR] Script failed with exit code %EXIT_CODE% >> "%LOG_FILE%" 2>&1
) else (
    echo [SUCCESS] paywalled_pdf.py completed successfully. >> "%LOG_FILE%" 2>&1
)

:: Final Log Wrap-up
echo [End Time] %date% %time% >> "%LOG_FILE%" 2>&1
echo ================================================== >> "%LOG_FILE%" 2>&1
echo. >> "%LOG_FILE%" 2>&1

exit /b %EXIT_CODE%
