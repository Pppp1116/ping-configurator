@echo off
setlocal enabledelayedexpansion

echo Otimizador de Rede Windows 11 para Epic Games - Instalador
echo =====================================================
echo.

:: Verificar se está rodando como administrador
net session >nul 2>&1
if %errorLevel% == 0 (
    echo [OK] Executando como administrador
) else (
    echo [ERRO] Este script precisa ser executado como administrador!
    echo Por favor, clique com o botão direito e selecione "Executar como administrador"
    pause
    exit /b 1
)

:: Verificar instalação do Node.js em locais comuns
set "NODE_PATHS=C:\Program Files\nodejs\node.exe;C:\Program Files (x86)\nodejs\node.exe;%PROGRAMFILES%\nodejs\node.exe;%PROGRAMFILES(X86)%\nodejs\node.exe"
set "NODE_FOUND=false"

for %%i in (%NODE_PATHS%) do (
    if exist "%%i" (
        set "NODE_FOUND=true"
        echo [OK] Node.js encontrado em: %%i
        goto :node_found
    )
)

:node_not_found
echo [INFO] Node.js não encontrado. Iniciando download...

:: Criar pasta temporária
set "TEMP_DIR=%TEMP%\nodejs_installer"
mkdir "%TEMP_DIR%" 2>nul

:: Download do Node.js usando bitsadmin (mais confiável que PowerShell para downloads)
echo [INFO] Baixando Node.js...
bitsadmin /transfer "NodeJSDownload" /download /priority normal ^
    "https://nodejs.org/dist/v20.11.1/node-v20.11.1-x64.msi" ^
    "%TEMP_DIR%\node_installer.msi"

if not exist "%TEMP_DIR%\node_installer.msi" (
    echo [ERRO] Falha no download do Node.js
    echo Por favor, faça o download manualmente de https://nodejs.org/
    start https://nodejs.org/
    pause
    exit /b 1
)

echo [INFO] Instalando Node.js...
msiexec /i "%TEMP_DIR%\node_installer.msi" /qn /norestart

:: Aguardar instalação e verificar
timeout /t 30 /nobreak
echo [INFO] Verificando instalação...

:: Atualizar variáveis de ambiente
call refreshenv.cmd 2>nul
if %ERRORLEVEL% neq 0 (
    :: Se refreshenv não estiver disponível, atualizar PATH manualmente
    set "PATH=%PATH%;C:\Program Files\nodejs"
)

:node_found
:: Verificar versão do Node.js
node --version >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERRO] Instalação do Node.js falhou
    echo Por favor, instale manualmente de https://nodejs.org/
    start https://nodejs.org/
    pause
    exit /b 1
)

echo [INFO] Instalando dependências...
call npm install
if %ERRORLEVEL% neq 0 (
    echo [ERRO] Falha ao instalar dependências
    pause
    exit /b 1
)

:: Criar atalho na área de trabalho
echo [INFO] Criando atalho na área de trabalho...
powershell -Command ^
    "$WshShell = New-Object -comObject WScript.Shell; ^
    $Shortcut = $WshShell.CreateShortcut([Environment]::GetFolderPath('Desktop') + '\Otimizador de Rede Epic Games.lnk'); ^
    $Shortcut.TargetPath = '%CD%\start.bat'; ^
    $Shortcut.WorkingDirectory = '%CD%'; ^
    $Shortcut.Save()"

:: Criar arquivo start.bat
echo [INFO] Criando arquivo de inicialização...
(
    echo @echo off
    echo cd /d "%%~dp0"
    echo echo Iniciando Otimizador de Rede Epic Games...
    echo echo ======================================
    echo echo.
    echo call npm run dev
    echo if %%ERRORLEVEL%% neq 0 ^(
    echo     echo [ERRO] Falha ao iniciar a aplicação
    echo     pause
    echo     exit /b 1
    echo ^)
) > start.bat

:: Limpar arquivos temporários
if exist "%TEMP_DIR%" (
    rd /s /q "%TEMP_DIR%" >nul 2>&1
)

echo.
echo [OK] Instalação concluída com sucesso!
echo.
echo Para iniciar o aplicativo, você pode:
echo 1. Dar duplo clique no atalho "Otimizador de Rede Epic Games" na área de trabalho
echo 2. Executar o arquivo start.bat nesta pasta
echo.
echo Pressione qualquer tecla para sair...
pause >nul
exit /b 0