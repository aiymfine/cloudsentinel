@REM Maven Wrapper for Windows
@REM ----------------------------------------------------------------------------
@REM Licensed to the Apache Software Foundation (ASF) under one
@REM or more contributor license agreements.
@REM ----------------------------------------------------------------------------

@if "%__MVNW_ARG0_NAME__%"=="" (set __MVNW_ARG0_NAME__=%~nx0)
@set __MVNW_CMD__=
@set __MVNW_ERROR__=
@set __MVNW_PSMODULEP_SAVE=%PSModulePath%
@set PSModulePath=
@for /f "usebackq tokens=1* delims==" %%a in (`powershell -noprofile "& {$scriptDir='%~dp0'; $proxy=''; [Net.WebRequest]::DefaultWebProxy.Credentials=[Net.CredentialCache]::DefaultCredentials; try{Invoke-WebRequest -Headers @{'User-Agent'='Mozilla/5.0'} -Proxy $proxy -ProxyUseDefaultCredentials -OutFile $scriptDir'.mvn/wrapper/maven-wrapper.jar' 'https://repo.maven.apache.org/maven2/org/apache/maven/wrapper/maven-wrapper/3.2.0/maven-wrapper-3.2.0.jar'} catch {Write-Error $_.Exception.Message; exit 1}}" 2>&1`) do @(
    if "%%a"=="EXITCODE" (
        set __MVNW_ERROR__=%%b
    )
)
@set PSModulePath=%__MVNW_PSMODULEP_SAVE%

@if "%__MVNW_ERROR__%"=="" (
    @rem Execute Maven
    "%JAVA_HOME%\bin\java.exe" ^
        %JVM_CONFIG_MAVEN_PROPS% ^
        %MAVEN_OPTS% ^
        %MAVEN_DEBUG_OPTS% ^
        -classpath "%~dp0.mvn\wrapper\maven-wrapper.jar" ^
        "-Dmaven.multiModuleProjectDirectory=%~dp0.." ^
        org.apache.maven.wrapper.MavenWrapperMain %*
) else (
    @echo Failed to download maven-wrapper.jar
    exit /b 1
)
@set __MVNW_CMD__=
@set __MVNW_ERROR__=
@set __MVNW_PSMODULEP_SAVE=
