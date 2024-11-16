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

:: Verificar Node.js no caminho padrão de instalação
if exist "C:\Program Files\nodejs\node.exe" (
    echo [OK] Node.js encontrado
    goto :dependencies
)

echo [INFO] Node.js nao encontrado. Iniciando download...

:: Download do Node.js
mkdir "%TEMP%\nodejs_install" 2>nul
powershell -Command "& {Invoke-WebRequest 'https://nodejs.org/dist/v20.11.1/node-v20.11.1-x64.msi' -OutFile '%TEMP%\nodejs_install\node_installer.msi'}"

if not exist "%TEMP%\nodejs_install\node_installer.msi" (
    echo [ERRO] Falha no download do Node.js
    pause
    exit /b 1
)

:: Instalar Node.js silenciosamente
echo [INFO] Instalando Node.js...
msiexec /i "%TEMP%\nodejs_install\node_installer.msi" /qn
if %ERRORLEVEL% neq 0 (
    echo [ERRO] Falha na instalacao do Node.js
    pause
    exit /b 1
)

timeout /t 10 /nobreak
rd /s /q "%TEMP%\nodejs_install" 2>nul

:dependencies
:: Instalar dependências
echo [INFO] Instalando dependencias...
call npm install
if %ERRORLEVEL% neq 0 (
    echo [ERRO] Falha ao instalar dependencias
    pause
    exit /b 1
)

:: Compilar e criar executável
echo [INFO] Criando executavel...
call npm run build
call npx electron-builder

echo [OK] Instalacao concluida!
echo O executavel foi criado na pasta dist
pause