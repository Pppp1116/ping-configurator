@echo off
setlocal enabledelayedexpansion

echo Otimizador de Rede Windows 11 para Epic Games - Instalador
echo =====================================================
echo.

:: Verificar se está rodando como administrador
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo [ERRO] Este script precisa ser executado como administrador!
    echo Por favor, clique com o botao direito e selecione "Executar como administrador"
    pause
    exit /b 1
)

:: Mudar para o diretório do script
cd /d "%~dp0"

:: Verificar Node.js
where node >nul 2>&1
if %errorLevel% neq 0 (
    echo [INFO] Node.js nao encontrado. Iniciando download...
    
    :: Download do Node.js usando PowerShell
    powershell -Command "& {[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-WebRequest 'https://nodejs.org/dist/v20.11.1/node-v20.11.1-x64.msi' -OutFile '%TEMP%\node_installer.msi'}"
    
    if not exist "%TEMP%\node_installer.msi" (
        echo [ERRO] Falha no download do Node.js
        pause
        exit /b 1
    )
    
    :: Instalar Node.js silenciosamente
    echo [INFO] Instalando Node.js...
    start /wait msiexec /i "%TEMP%\node_installer.msi" /qn
    if %ERRORLEVEL% neq 0 (
        echo [ERRO] Falha na instalacao do Node.js
        del "%TEMP%\node_installer.msi"
        pause
        exit /b 1
    )
    
    del "%TEMP%\node_installer.msi"
    
    :: Atualizar PATH
    refreshenv >nul 2>&1
    if %ERRORLEVEL% neq 0 (
        echo [INFO] Por favor, reinicie o computador e execute este script novamente
        pause
        exit /b 0
    )
)

:: Verificar npm
where npm >nul 2>&1
if %errorLevel% neq 0 (
    echo [ERRO] npm nao encontrado
    echo Por favor, reinicie o computador e execute o script novamente
    pause
    exit /b 1
)

:: Instalar dependências
echo [INFO] Instalando dependencias...
call npm install --no-audit
if %ERRORLEVEL% neq 0 (
    echo [ERRO] Falha ao instalar dependencias
    pause
    exit /b 1
)

:: Compilar
echo [INFO] Compilando aplicacao...
call npm run build
if %ERRORLEVEL% neq 0 (
    echo [ERRO] Falha ao compilar aplicacao
    pause
    exit /b 1
)

:: Criar executável
echo [INFO] Criando executavel...
call npx electron-builder --win portable
if %ERRORLEVEL% neq 0 (
    echo [ERRO] Falha ao criar executavel
    pause
    exit /b 1
)

echo.
echo [OK] Instalacao concluida com sucesso!
echo O executavel foi criado na pasta dist
echo.
pause