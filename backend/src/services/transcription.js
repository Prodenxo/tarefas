const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

/**
 * Transcreve um arquivo de áudio usando o Whisper localmente via linha de comando.
 * @param {string} audioPath Caminho absoluto do arquivo de áudio
 * @param {string} model Nome do modelo do Whisper (ex: tiny, base, small, medium)
 * @returns {Promise<string>} O texto transcrito
 */
async function transcribeLocal(audioPath, model = "base") {
  return new Promise((resolve, reject) => {
    const outputDir = path.join(__dirname, "../../tmp/transcriptions");

    // Verifica se a pasta de saída existe, se não, cria
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    console.log(
      `[Whisper] Iniciando transcrição de ${audioPath} usando o modelo ${model}...`,
    );

    // Executa o comando whisper (precisa estar instalado no ambiente Docker/EasyPanel)
    const whisper = spawn("whisper", [
      audioPath,
      "--language",
      "pt",
      "--model",
      model,
      "--output_dir",
      outputDir,
      "--output_format",
      "txt",
      "--initial_prompt",
      "criar, tarefa, empresa, data, barra, de, janeiro, fevereiro, março, abril, maio, junho, julho, agosto, setembro, outubro, novembro, dezembro",
    ]);

    let stderr = "";

    whisper.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    whisper.on("close", (code) => {
      if (code !== 0) {
        console.error(`[Whisper Error] Código ${code}:`, stderr);
        return reject(new Error(`O Whisper falhou na transcrição: ${stderr}`));
      }

      // O Whisper gera um arquivo .txt com o mesmo nome do áudio na pasta de saída
      const baseName = path.basename(audioPath, path.extname(audioPath));
      const txtFile = path.join(outputDir, `${baseName}.txt`);

      if (fs.existsSync(txtFile)) {
        const content = fs.readFileSync(txtFile, "utf8");
        console.log(`[Whisper] Transcrição concluída com sucesso.`);
        // Remove os arquivos temporários após ler
        try {
          fs.unlinkSync(txtFile);
        } catch (e) {}
        resolve(content.trim());
      } else {
        reject(
          new Error("Transcrição terminada mas arquivo .txt não encontrado."),
        );
      }
    });

    whisper.on("error", (err) => {
      if (err.code === "ENOENT") {
        reject(
          new Error(
            "Whisper não está instalado no sistema. Verifique a instalação do Python/Whisper.",
          ),
        );
      } else {
        reject(err);
      }
    });
  });
}

module.exports = { transcribeLocal };
