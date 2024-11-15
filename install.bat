@echo off
echo Instalando o Otimizador de Rede Windows 11 para Epic Games...
echo.

:: Verificar se está rodando como administrador
net session >nul 2>&1
if %errorLevel% == 0 (
    echo Executando como administrador - OK
) else (
    echo Este script precisa ser executado como administrador!
    echo Por favor, clique com o botão direito e selecione "Executar como administrador"
    pause
    exit
)

:: Verificar se o Node.js está instalado
where node >nul 2>&1
if %errorLevel% == 0 (
    echo Node.js encontrado - OK
) else (
    echo Node.js não encontrado! Baixando e instalando...
    :: Download do Node.js
    powershell -Command "& {Invoke-WebRequest -Uri 'https://nodejs.org/dist/v20.11.1/node-v20.11.1-x64.msi' -OutFile 'node_installer.msi'}"
    :: Instalar Node.js silenciosamente
    msiexec /i node_installer.msi /qn
    :: Aguardar instalação
    timeout /t 30
    :: Limpar arquivo de instalação
    del node_installer.msi
)

:: Instalar dependências
echo Instalando dependências...
call npm install

:: Criar atalho na área de trabalho
echo Criando atalho na área de trabalho...
powershell "$WshShell = New-Object -comObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut('%USERPROFILE%\Desktop\Otimizador de Rede Epic Games.lnk'); $Shortcut.TargetPath = 'npm.cmd'; $Shortcut.Arguments = 'run dev'; $Shortcut.WorkingDirectory = '%CD%'; $Shortcut.Save()"

:: Criar arquivo start.bat para facilitar execução futura
echo @echo off > start.bat
echo cd /d "%%~dp0" >> start.bat
echo npm run dev >> start.bat

echo.
echo Instalação concluída!
echo Para iniciar o aplicativo, você pode:
echo 1. Dar duplo clique no atalho criado na área de trabalho
echo 2. Executar o arquivo start.bat nesta pasta
pause