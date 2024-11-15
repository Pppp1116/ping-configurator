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
    echo Node.js não encontrado! 
    echo Por favor, instale o Node.js de https://nodejs.org/
    echo Selecione a versão LTS (Recomendada)
    start https://nodejs.org/
    pause
    exit
)

:: Instalar dependências
echo Instalando dependências...
call npm install

:: Criar atalho na área de trabalho
echo Criando atalho na área de trabalho...
powershell "$WshShell = New-Object -comObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut('%USERPROFILE%\Desktop\Otimizador de Rede Epic Games.lnk'); $Shortcut.TargetPath = 'npm.cmd'; $Shortcut.Arguments = 'run dev'; $Shortcut.WorkingDirectory = '%CD%'; $Shortcut.Save()"

echo.
echo Instalação concluída!
echo Para iniciar o aplicativo, dê duplo clique no atalho criado na área de trabalho
echo ou execute 'npm run dev' nesta pasta
pause