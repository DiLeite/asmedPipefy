require("dotenv").config(); // Carrega as variáveis do .env
const fs = require("fs-extra");
const axios = require("axios");
const { exec } = require("child_process");
const path = require("path");

const PIPEFY_COOKIES = "_pipefy_session=cTNMRGNDL3RPSCtqekJLVzQxRUJHY3d3YlNkTkc2TjBZZDVQK1Q0SVNFS3RlbitjVVZ4OSs2aDZKOHNib3lkNGR1dEpDb2IreUthZmo2NTlqMnJSTHg0UEZpV3RySnA1TFlzbXpCU2hEbklaSFIwU2NsV1RvNFludU5BUWZDaERXMXpBOUdlQ1czRkMvT240TTJVeE1UMzRSenlVUWRpcnhWNjF1U2RKWWJEWVJiT25Dbm5xNFcrZkZYSGVGWGlVWnlKVmI4MU1JdDgzb1U2YVdXS0o2OWxSUXRNUXhaVGJVZjlpclgrR3BrTVRUZzJCNHJCL0VCT3p5ZzUwbXlSbStSbDRaTEVqalRUaDV0bFZzYzFzajFuYW92YS84MW93b1YxQXovZ1pIZjRmRy9IaXFEK2lYSWcrdVpmdUdCckNReklDZUVqbGt2UG5Jb1BOYnkrYWNuWnBGMlNiUmpqN29aMnVHQ1lWeUNrTWZROXRxOFlNUjd3b2Q5NE1IZ3JEMUh5NEdTdW1IaGFLRTNrWkhRYlZ2VW8yUTBKR0IrOTBZVE1xcUhLbGJOdEtUVnJPMUxSVGpVR05UQ1NDUDVXeWJYODdLS1FRb2VEUWZDSVpzeXdsdkE9PS0tbmtqZ25pZ1NBMnZoYi9hSWkyTnZLUT09--d4937ac466298982185798312573387de9bc2ee6; id_token=eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJnaDIwNzE5d1NvRS0yQ0hndFpiX2RCVERpZUtrZW05dU03NnJuVjZDYUI0In0.eyJleHAiOjE3NDA0NDc0MTYsImlhdCI6MTc0MDE4ODIxNiwiYXV0aF90aW1lIjoxNzQwMTc1Nzk2LCJqdGkiOiI0Y2U0Y2ViOS05YTAwLTQ5NzYtOWZmOS1jNTlhODE2OGVhZjIiLCJpc3MiOiJodHRwczovL3NpZ25pbi5waXBlZnkuY29tL3JlYWxtcy9waXBlZnkiLCJhdWQiOiJwaXBlZnktYXV0aCIsInN1YiI6ImY6MzI2MjE2MzYtNGE1Ny00MDExLTliMWYtZTgwYzc3ZjIxYTZmOjMwNTkxNzM1MiIsInR5cCI6IklEIiwiYXpwIjoicGlwZWZ5LWF1dGgiLCJzZXNzaW9uX3N0YXRlIjoiODFmZjEwYzYtNTBmOC00OTc5LWI4MDQtMWU5ODJkMTczMzIzIiwiYXRfaGFzaCI6IlV6YzlhaVdTUUJGNEdHX003dFllMVEiLCJhY3IiOiIwIiwic2lkIjoiODFmZjEwYzYtNTBmOC00OTc5LWI4MDQtMWU5ODJkMTczMzIzIiwiaWRlbnRpdHlfcHJvdmlkZXIiOiJnb29nbGUiLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiaHR0cHM6Ly9waXBlZnkuY29tL3VzZXJfdXVpZCI6IjRjZmJiZGViLWJiZWQtNGViMC05ZDY5LTJkY2NlNjk3YzhkZiIsImh0dHBzOi8vcGlwZWZ5LmNvbS91c2VyX2lkIjoiMzA1OTE3MzUyIiwibmFtZSI6ImRpZWdvLXBpcmVzLWxlaXRlIiwicHJlZmVycmVkX3VzZXJuYW1lIjoiZGllZ28tcGlyZXMtbGVpdGUiLCJlbWFpbCI6ImRpZWdvLnBpcmVzLmxlaXRlQGdtYWlsLmNvbSJ9.c91mR3A35VUWzR3LCskYB1-2UeF0hBX65YH2lTEryDoBGdeYLMAq-zI7E90c4W_chgDsOoLyfJZuH0JX1b1Vzue_0xX4b4hLeoT3vLlibdOkMFxTxwuSh4eAbPT8g72ycJnYNInmfIWD1H8VZjr4qgblWdbUFzk6BSnV2yLVK0-o-624B1HWUXlCxyK5wO_fa277ZQgcusXaNvCxwAobq6Cu2Yb-mBSLSC_ckBW-YWFlWsKHD3BcG3UY51_UfNZSzl8WVl4LnFFGY9nA_ZrlHh_svCyss7F4oFoBMR4Hn5tqhOFcLi7A3xPiPJC-CmHjfUKx4i1MFe-doIwxBx7tuQ";;
const BASE_PATH = process.env.BASE_PATH || "./downloads";
const JSON_DIR = process.env.JSON_DIR || "./DataList";

// Obtém automaticamente todos os arquivos .json da pasta
const JSON_FILES = fs.readdirSync(JSON_DIR).filter(file => file.endsWith(".json")).map(file => path.join(JSON_DIR, file));

if (JSON_FILES.length === 0) {
    console.error("❌ Nenhum arquivo JSON encontrado na pasta.");
    process.exit(1);
}

// Função para baixar arquivos com autenticação
async function downloadFile(url, filename, outputPath) {
    const filePath = path.join(outputPath, filename);
    try {
        const response = await axios({
            url,
            method: "GET",
            responseType: "stream",
            headers: {
                "Cookie": PIPEFY_COOKIES,
                "User-Agent": "Mozilla/5.0",
                "Referer": "https://app.pipefy.com/"
            }
        });

        await fs.ensureDir(outputPath);
        const writer = fs.createWriteStream(filePath);
        response.data.pipe(writer);

        return new Promise((resolve, reject) => {
            writer.on("finish", () => resolve(filePath));
            writer.on("error", reject);
        });
    } catch (error) {
        console.error(`❌ Erro ao baixar ${url}:`, error.response ? error.response.statusText : error.message);
        if (error.response && error.response.status === 401) {
            console.error("🔒 Verifique os cookies.");
        }
    }
}

// Função para processar um único JSON
async function processJson(jsonFile) {
    try {
        const jsonFileName = path.basename(jsonFile, ".json"); // Nome do arquivo sem extensão
        const jsonFolderPath = path.join(BASE_PATH, jsonFileName); // Criar pasta para o JSON
        await fs.ensureDir(jsonFolderPath);

        console.log(`📂 Criando pasta base: ${jsonFolderPath}`);

        const data = JSON.parse(fs.readFileSync(jsonFile, "utf-8"));
        // let countAttachments = 0;

        for (const item of data) {
            const folderName = `${item.title}_${item.id}`.replace(/\s+/g, "_");
            const localFolderPath = path.join(jsonFolderPath, folderName);
            await fs.ensureDir(localFolderPath);
                console.log(`📂 Criando subpasta: ${localFolderPath}`);

            for (const attachment of item.attachments) {
                const url = attachment.url;
                if (!url) {
                    // countAttachments++;
                    continue;
                }
                const filename = url.split("/").pop();

                // console.log(`📥 Baixando: ${filename}...`);
                const filePath = await downloadFile(url, filename, localFolderPath);

                if (filePath) {
                    // console.log(`✔ Download concluído: ${filePath}`);
                }
            }
        }

        // console.log(`📁 Pastas vazias: ${countAttachments}`);

        // Após baixar os arquivos, compactar a pasta antes de continuar
        await zipFolder(jsonFolderPath);

    } catch (error) {
        console.error(`❌ Erro ao processar ${jsonFile}:`, error.message);
    }
}

// Função para compactar a pasta antes de processar o próximo JSON
function zipFolder(folderPath) {
    return new Promise((resolve, reject) => {
        console.log(`📦 Compactando ${folderPath}...`);
        exec(`node zip.js "${folderPath}"`, (error, stdout, stderr) => {
            if (error) {
                console.error(`❌ Erro ao compactar ${folderPath}: ${error.message}`);
                reject(error);
                return;
            }
            if (stderr) {
                console.error(`⚠ Erro no zip.js: ${stderr}`);
            }
            console.log(`✅ Compactação concluída para ${folderPath}:\n${stdout}`);
            resolve();
        });
    });
}

// Função principal para processar os JSONs um por um
async function processAllJsonFiles() {
    for (const jsonFile of JSON_FILES) {
        await processJson(jsonFile); // Espera o download e a compactação antes de continuar
    }
    console.log("🎉 Todos os arquivos foram processados!");
}

// Iniciar o processamento
processAllJsonFiles();