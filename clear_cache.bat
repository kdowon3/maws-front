@echo off
echo Clearing Next.js cache and build files...

REM 관리자 권한 확인
net session >nul 2>&1
if %errorLevel% == 0 (
    echo Running with administrator privileges
) else (
    echo Requesting administrator privileges...
    powershell -Command "Start-Process cmd -ArgumentList '/c %~s0' -Verb RunAs"
    exit
)

REM .next 폴더 삭제
if exist ".next" (
    echo Removing .next folder...
    rmdir /s /q .next
    echo .next folder removed successfully
) else (
    echo .next folder not found
)

REM node_modules/.cache 삭제
if exist "node_modules\.cache" (
    echo Removing node_modules cache...
    rmdir /s /q "node_modules\.cache"
    echo Cache removed successfully
) else (
    echo Cache folder not found
)

REM TypeScript 빌드 정보 삭제
if exist ".tsbuildinfo" (
    del /f /q .tsbuildinfo
    echo TypeScript build info cleared
)

echo.
echo Cache cleanup completed!
echo Press any key to continue...
pause >nul