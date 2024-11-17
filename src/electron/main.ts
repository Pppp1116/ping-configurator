import { app, BrowserWindow, ipcMain } from 'electron';
import { exec } from 'child_process';
import { promisify } from 'util';
import { NetworkConfig } from '../types/network';
import path from 'path';

const execAsync = promisify(exec);

async function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  if (process.env.NODE_ENV === 'development') {
    win.loadURL('http://localhost:5173');
    win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(__dirname, '../index.html'));
  }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Verificar se está rodando como administrador
async function checkAdmin(): Promise<boolean> {
  try {
    await execAsync('net session');
    return true;
  } catch {
    return false;
  }
}

// Obter nome do adaptador de rede ativo
async function getActiveAdapter(): Promise<string> {
  try {
    const { stdout } = await execAsync('powershell -Command "Get-NetAdapter | Where-Object {$_.Status -eq \'Up\'} | Select-Object -First 1 -ExpandProperty Name"');
    return stdout.trim();
  } catch (error) {
    console.error('Erro ao obter adaptador:', error);
    throw new Error('Não foi possível encontrar um adaptador de rede ativo');
  }
}

// IPC Handlers
ipcMain.handle('ping-server', async (_, url: string) => {
  try {
    const { stdout } = await execAsync(`powershell -Command "Test-Connection -ComputerName ${url} -Count 1 -TimeoutSeconds 2 | Select-Object -ExpandProperty ResponseTime"`);
    const latency = parseInt(stdout.trim());
    return isNaN(latency) ? -1 : latency;
  } catch (error) {
    console.error('Erro ao fazer ping:', error);
    return -1;
  }
});

ipcMain.handle('get-current-settings', async () => {
  const isAdmin = await checkAdmin();
  if (!isAdmin) {
    throw new Error('Necessário privilégios de administrador');
  }

  const adapter = await getActiveAdapter();
  
  try {
    const { stdout: dnsOutput } = await execAsync('powershell -Command "Get-DnsClientServerAddress -AddressFamily IPv4 | Select-Object -ExpandProperty ServerAddresses | Select-Object -First 1"');
    const { stdout: mtuOutput } = await execAsync(`powershell -Command "Get-NetIPInterface -InterfaceAlias '${adapter}' -AddressFamily IPv4 | Select-Object -ExpandProperty NlMtu"`);
    const { stdout: tcpOutput } = await execAsync('powershell -Command "Get-NetTCPSetting -SettingName InternetCustom | ConvertTo-Json"');
    const { stdout: qosOutput } = await execAsync('powershell -Command "Get-NetQosPolicy | Where-Object {$_.Name -eq \'DefaultPolicy\'} | Select-Object -ExpandProperty Enabled"');

    const tcpSettings = JSON.parse(tcpOutput);

    return {
      dns: dnsOutput.trim(),
      mtu: parseInt(mtuOutput.trim()),
      bufferSize: tcpSettings.ReceiveBufferSize,
      tcpNoDelay: !tcpSettings.DelayedAckTimeout,
      tcpWindowSize: tcpSettings.WindowSize,
      nagleAlgorithm: tcpSettings.NagleAlgorithm,
      qosEnabled: qosOutput.trim().toLowerCase() === 'true'
    };
  } catch (error) {
    console.error('Erro ao obter configurações:', error);
    throw error;
  }
});

ipcMain.handle('apply-settings', async (_, config: NetworkConfig) => {
  const isAdmin = await checkAdmin();
  if (!isAdmin) {
    throw new Error('Necessário privilégios de administrador');
  }

  const adapter = await getActiveAdapter();

  const commands = [
    `Set-DnsClientServerAddress -InterfaceAlias '${adapter}' -ServerAddresses ${config.dns}`,
    `Set-NetIPInterface -InterfaceAlias '${adapter}' -NlMtuBytes ${config.mtu}`,
    `Set-NetTCPSetting -SettingName InternetCustom -ReceiveBufferSize ${config.bufferSize}`,
    `Set-NetTCPSetting -SettingName InternetCustom -WindowSize ${config.tcpWindowSize}`,
    `Set-NetTCPSetting -SettingName InternetCustom -DelayedAckTimeout ${config.tcpNoDelay ? 0 : 1}`,
    `Set-NetTCPSetting -SettingName InternetCustom -NagleAlgorithm ${config.nagleAlgorithm}`,
    `${config.qosEnabled ? 'Enable' : 'Disable'}-NetQosPolicy -Name 'DefaultPolicy' -ErrorAction SilentlyContinue`
  ];

  for (const command of commands) {
    try {
      await execAsync(`powershell -Command "${command}"`);
    } catch (error) {
      console.error(`Erro ao executar comando: ${command}`, error);
      throw error;
    }
  }
});