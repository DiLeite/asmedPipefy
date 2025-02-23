const fs = require("fs-extra");
const AdmZip = require("adm-zip");

const BASE_PATH = "./downloads"; // Diretório base onde as pastas estão localizadas

// Função para verificar se a pasta está vazia
async function isFolderEmpty(folderPath) {
    const files = await fs.readdir(folderPath);
    return files.length === 0; // Retorna true se não houver arquivos na pasta
}

// Função para compactar cada pasta individualmente
async function zipFolders(basePath) {
    try {
        // Verificar se o diretório existe
        if (!fs.existsSync(basePath)) {
            console.error("❌ O diretório especificado não existe.");
            return;
        }

        // Listar todas as pastas dentro do diretório
        const items = await fs.readdir(basePath);
        const folders = items.filter(item => fs.statSync(`${basePath}/${item}`).isDirectory()); // Filtrar apenas diretórios

        if (folders.length === 0) {
            console.log("⚠️ Nenhuma pasta encontrada para processar.");
            return;
        }

        for (const folder of folders) {
            const folderPath = `${basePath}/${folder}`;
            const zipFilePath = `${folderPath}.zip`;

            // Verificar se a pasta está vazia
            if (await isFolderEmpty(folderPath)) {
                console.log(`🗑️ A pasta "${folder}" está vazia e será removida.`);
                await fs.remove(folderPath);
                continue; // Pula para a próxima pasta sem compactar
            }

            console.log(`📦 Compactando: ${folder} → ${zipFilePath} ...`);

            // Criar o arquivo ZIP
            const zip = new AdmZip();
            zip.addLocalFolder(folderPath); // Adiciona a pasta ao ZIP
            zip.writeZip(zipFilePath);

            console.log(`✅ Arquivo ZIP criado: ${zipFilePath}`);

            // (Opcional) Apagar a pasta original após compactação
            await fs.remove(folderPath);
            console.log(`🗑️ Pasta original removida: ${folderPath}`);
        }
    } catch (error) {
        console.error("❌ Erro ao processar pastas:", error.message);
    }
}

// Executar o script
zipFolders(BASE_PATH);
