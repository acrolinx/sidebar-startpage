mkdir upstream_artifacts || goto error
move /Y dist upstream_artifacts || goto error
mkdir build  dist                                                  || goto error

REM Create the DLL bundle:
echo %PATH%
python tools\generate-reshacker-script.py -b %CD%\tools\data\empty.dll -t HTML -o build\script.txt -L %CD%\build\script.log %CD%\build\Acrolinx.Startpage.dll.bundle %CD%\upstream_artifacts\dist\dist-offline                                                  || goto error
resourcehacker -script build\script.txt                             || goto error
type build\script.log

REM Extract the application version:
for /f "usebackq delims=" %%v IN (`python -c "import json; print(json.load(open('./package.json'))['version'])"`) DO set VERSION=%%v

REM The full version number also includes the build number:
set FULLVERSION=%VERSION%.%COPYARTIFACT_BUILD_NUMBER_STARTPAGE%

REM Set version information in the DLL:
python tools\generate-version-header.py build\version.h -y 2017 -n Acrolinx.Startpage.dll -v %FULLVERSION% || goto error

CALL "C:\Program Files (x86)\Microsoft Visual Studio 14.0\VC\vcvarsall.bat" x86 || goto error
ECHO ON

rc /fo build\dll_version.res /I.\build /v dll_version.rc || goto error
resourcehacker -open build\Acrolinx.Startpage.dll.bundle -save dist\Acrolinx.Startpage.dll -resource build\dll_version.res -action addoverwrite -log CONSOLE || goto error


REM Sign start page dll
set binName=dist\Acrolinx.Startpage.dll
set CertPath=.\certificate\codesigning.p12
echo %CertPath%
set ProgramFiles=%ProgramFiles(x86)%
echo %ProgramFiles%
set binName=dist\Acrolinx.Startpage.dll
set SignTool=%ProgramFiles%\windows kits\10\bin\x64\signtool.exe
echo %SignTool%
echo %SIGNINGPWD%

CALL "%SignTool%" sign /p %SIGNINGPWD% /f %CertPath% /t http://timestamp.comodoca.com/authenticode %binName% || goto error
CALL "%SignTool%" sign /as /p %SIGNINGPWD% /f %CertPath% /fd sha256 /tr http://timestamp.comodoca.com /td sha256 %binName% || goto error

REM Dll signed


REM Build the NuGet package:
.\nuget.exe pack -NonInteractive -OutputDirectory dist -Version %FULLVERSION% || goto error

REM Publish it locally and on the NuGet gallery:
FOR %%P IN (dist\*.nupkg) DO (
  IF /i %PUBLISH_INTERNAL%==true (
    REM Add the NuGet package registry for internal use:
    .\nuget.exe source Add "https://gitlab.com/api/v4/projects/22486890/packages/nuget/index.json" -Name Gitlab -UserName gitlab-ci-token -Password %CI_JOB_TOKEN%
    .\nuget.exe push -NonInteractive -Source Gitlab %%P      || goto error
  )

@REM   IF /i %PUBLISH_PUBLIC%==true (
@REM     nuget push -NonInteractive -Source nuget.org %%P -ApiKey %NUGET_API_KEY%    || goto error
@REM   )
)


exit /b 0


:error
set r=%ERRORLEVEL%

echo ERROR (%r%), aborting.
echo.
echo Resource Hacker log:
echo --------------------
type build\script.log
echo --------------------

exit /b %r%