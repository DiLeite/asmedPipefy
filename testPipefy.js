const fs = require("fs");
const path = require("path");
const { google } = require("googleapis");
const readlineSync = require("readline-sync");

// Configuração das credenciais OAuth2
const CLIENT_ID = "SEU_CLIENT_ID";
const CLIENT_SECRET = "SEU_CLIENT_SECRET";
const REDIRECT_URI = "https://developers.google.com/oauthplayground";
const REFRESH_TOKEN = "SEU_REFRESH_TOKEN";

// Pasta do Windows para escanear arquivos
const LOCAL_FOLDER_PATH = "C:\\Users\\SEU_USUARIO\\Documents\\Uploads"; // Altere para sua pasta local

// Autenticação OAuth2
const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

// Instância da API do Google Drive
const drive = google.drive({ version: "v3", auth: oauth2Client });

// Função para obter todos os arquivos da pasta local
function getLocalFiles(directory) {
    return fs.readdirSync(directory).map((file) => path.join(directory, file));
}

// Função para upload de um arquivo
async function uploadFile(filePath) {
    try {
        const fileMetadata = {
            name: path.basename(filePath),
            parents: ["SEU_FOLDER_ID_NO_DRIVE"], // ID da pasta no Google Drive (ou remova para enviar na raiz)
        };

        const media = {
            mimeType: "application/octet-stream",
            body: fs.createReadStream(filePath),
        };

        const response = await drive.files.create({
            requestBody: fileMetadata,
            media: media,
            fields: "id, name",
        });

        console.log(`✅ Upload concluído: ${response.data.name} (ID: ${response.data.id})`);
    } catch (error) {
        console.error("❌ Erro no upload:", error.message);
    }
}

// Função para processar todos os arquivos da pasta
async function uploadAllFiles() {
    console.log("📂 Buscando arquivos na pasta:", LOCAL_FOLDER_PATH);
    const files = getLocalFiles(LOCAL_FOLDER_PATH);

    if (files.length === 0) {
        console.log("⚠️ Nenhum arquivo encontrado.");
        return;
    }

    console.log(`🔼 Iniciando upload de ${files.length} arquivos...`);
    for (const file of files) {
        await uploadFile(file);
    }
    console.log("✅ Todos os arquivos foram enviados!");
}

// Executar
uploadAllFiles();
