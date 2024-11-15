# Otimizador de Rede Windows 11 para Epic Games

## Como instalar

### Método 1: Download Direto (Mais Fácil)
1. Clique no botão verde "Code" acima
2. Selecione "Download ZIP"
3. Extraia o arquivo ZIP para uma pasta
4. Execute o arquivo `install.bat` como administrador (clique com botão direito -> Executar como administrador)

### Método 2: Usando Git
Se você já tem experiência com Git:
```sh
git clone <URL_DO_REPOSITÓRIO>
cd <NOME_DA_PASTA>
npm install
npm run dev
```

## ⚠️ Importante
- Esta aplicação precisa ser executada como administrador para poder modificar as configurações de rede
- Recomendamos fazer um backup das suas configurações atuais antes de começar (botão "Use Backup" na aplicação)
- Se algo der errado, você pode sempre reverter para as configurações padrão usando o botão "Revert to Default"

## Como Usar
1. Abra a aplicação
2. Selecione o servidor da Epic Games mais próximo de você
3. Clique em "Iniciar Testes"
4. Aguarde o processo terminar (o tempo estimado será mostrado)
5. Ao finalizar, você verá os 3 melhores resultados
6. Clique em "Apply" na configuração que desejar usar

## O que a aplicação faz?
- Testa todas as combinações possíveis de configurações de rede
- Mede o ping para o servidor da Epic Games
- Mostra as melhores configurações encontradas
- Permite aplicar facilmente as configurações desejadas
- Oferece opções de backup e restauração

## Requisitos
- Windows 11
- Direitos de administrador
- Conexão com a internet

## Suporte
Se encontrar algum problema, por favor abra uma issue no GitHub.