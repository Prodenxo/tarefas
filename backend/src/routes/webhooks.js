const express = require("express");
const router = express.Router();
const pool = require("../config/database");
const axios = require("axios");

// Função auxiliar para enviar resposta via WhatsApp
const sendReply = async (instance, number, text) => {
  try {
    const apiUrl = process.env.EVOLUTION_API_URL || "http://localhost:8080";
    const apiKey = process.env.EVOLUTION_API_KEY || "96185328";

    // Limpar o número (remover prefixo se houver @s.whatsapp.net)
    const cleanNumber = number.split("@")[0].replace(/\D/g, "");

    await axios.post(
      `${apiUrl}/message/sendText/${instance}`,
      {
        number: cleanNumber,
        text: text,
        linkPreview: true,
      },
      { headers: { apikey: apiKey } },
    );
  } catch (err) {
    console.error(`[Webhook Reply Error]`, err.response?.data || err.message);
  }
};

const handleWebhook = async (req, res) => {
  try {
    const payload = req.body;
    const event = (payload.event || "").toLowerCase().replace("_", ".");
    const instanceRaw = payload.instance || "ofc";
    const instanceName = instanceRaw.split(":")[0];

    // Ignorar eventos irrelevantes para economizar log
    if (event === "presence.update" || event === "messages.update") {
      return res.sendStatus(200);
    }

    console.log(
      `[Webhook] RECEBIDO: "${event}" na instância: "${instanceName}"`,
    );

    if (event === "messages.upsert") {
      const data = payload.data || {};
      const key = data.key || {};
      const message = data.message || {};
      const remoteJid = key.remoteJid || "";

      // Capturar texto de diversas formas
      let text =
        message.conversation ||
        message.extendedTextMessage?.text ||
        message.imageMessage?.caption ||
        message.videoMessage?.caption ||
        "";

      if (!text && data.message && typeof data.message === "string")
        text = data.message;

      console.log(
        `[Webhook] Texto: "${text}" de: ${remoteJid} (fromMe: ${key.fromMe})`,
      );

      // --- INÍCIO DO FLUXO CONVERSACIONAL ---
      const [users] = await pool.query(
        "SELECT u.id, u.name, u.role, uc.company_id FROM users u LEFT JOIN user_companies uc ON u.id = uc.user_id WHERE LOWER(u.wa_instance) = LOWER(?) OR (u.wa_instance IS NULL AND u.id = 1) LIMIT 1",
        [instanceName],
      );

      if (users.length === 0) {
        return res.sendStatus(200);
      }

      const user = users[0];
      const userId = user.id;

      // Buscar sessão atual
      const [sessions] = await pool.query(
        "SELECT step, data FROM user_whatsapp_sessions WHERE user_id = ?",
        [userId],
      );
      const session = sessions[0] || { step: "NONE", data: {} };
      const sessionData =
        typeof session.data === "string"
          ? JSON.parse(session.data)
          : session.data || {};

      // 1. INICIAR COMANDO (create)
      const createMatch = text.trim().match(/^create\s*(.*)$/i);
      if (createMatch) {
        const title = createMatch[1].trim() || "Nova tarefa";

        let companies = [];
        if (user.role === "superadmin") {
          [companies] = await pool.query(
            "SELECT id, name FROM companies WHERE active = 1",
          );
        } else {
          [companies] = await pool.query(
            "SELECT c.id, c.name FROM companies c JOIN user_companies uc ON c.id = uc.company_id WHERE uc.user_id = ? AND c.active = 1",
            [userId],
          );
        }

        if (companies.length === 0) {
          await sendReply(
            instanceName,
            remoteJid,
            "❌ Você não tem acesso a nenhuma empresa ativa.",
          );
          return res.sendStatus(200);
        }

        // Armazenar título e empresas na sessão
        const newSessionData = {
          title,
          companies: companies.map((c) => ({ id: c.id, name: c.name })),
        };
        await pool.query(
          "INSERT INTO user_whatsapp_sessions (user_id, step, data) VALUES (?, 'AWAITING_COMPANY', ?) ON DUPLICATE KEY UPDATE step = 'AWAITING_COMPANY', data = ?",
          [
            userId,
            JSON.stringify(newSessionData),
            JSON.stringify(newSessionData),
          ],
        );

        let companyList = "🏢 *Para qual empresa deseja criar a tarefa?*\n\n";
        companies.forEach((c, idx) => {
          companyList += `${idx + 1}. ${c.name}\n`;
        });
        companyList += "\n_Responda apenas com o número._";

        await sendReply(instanceName, remoteJid, companyList);
        return res.sendStatus(200);
      }

      // 2. PROCESSAR RESPOSTAS DO FLUXO
      if (session.step === "AWAITING_COMPANY") {
        const index = parseInt(text.trim()) - 1;
        const companies = sessionData.companies || [];

        if (isNaN(index) || !companies[index]) {
          await sendReply(
            instanceName,
            remoteJid,
            "⚠️ Opção inválida. Escolha um número da lista acima.",
          );
          return res.sendStatus(200);
        }

        const selectedCompany = companies[index];
        sessionData.company_id = selectedCompany.id;
        sessionData.company_name = selectedCompany.name;

        // Validar Perfil na Empresa Escolhida
        let canManage = user.role === "superadmin";
        if (!canManage) {
          const [roleCheck] = await pool.query(
            "SELECT role FROM user_companies WHERE user_id = ? AND company_id = ? LIMIT 1",
            [userId, selectedCompany.id],
          );
          if (
            roleCheck.length > 0 &&
            (roleCheck[0].role === "admin" || roleCheck[0].role === "gestor")
          ) {
            canManage = true;
          }
        }

        if (canManage) {
          sessionData.can_manage = true;
          await pool.query(
            "UPDATE user_whatsapp_sessions SET step = 'AWAITING_ASSIGNEE', data = ? WHERE user_id = ?",
            [JSON.stringify(sessionData), userId],
          );
          await sendReply(
            instanceName,
            remoteJid,
            `👤 *Para quem você deseja delegar a tarefa na empresa ${selectedCompany.name}?*\n\nDigite o nome da pessoa ou mande "eu" para você mesmo.`,
          );
        } else {
          sessionData.can_manage = false;
          sessionData.assigned_to_id = userId;
          sessionData.assigned_to_name = user.name;
          await pool.query(
            "UPDATE user_whatsapp_sessions SET step = 'AWAITING_DUE_DATE', data = ? WHERE user_id = ?",
            [JSON.stringify(sessionData), userId],
          );
          await sendReply(
            instanceName,
            remoteJid,
            `📅 *Qual a data de conclusão?*\n\nExemplo: 25/12 ou 05/03.\nDigite "não" se não tiver data.`,
          );
        }
        return res.sendStatus(200);
      }

      if (session.step === "AWAITING_ASSIGNEE") {
        const input = text.trim();
        let targetId = null;
        let targetName = null;

        if (input.toLowerCase() === "eu") {
          targetId = userId;
          targetName = user.name;
        } else {
          // Buscar usuários da mesma empresa
          const [possibleUsers] = await pool.query(
            "SELECT u.id, u.name FROM users u JOIN user_companies uc ON u.id = uc.user_id WHERE uc.company_id = ? AND u.name LIKE ? LIMIT 1",
            [sessionData.company_id, `%${input}%`],
          );

          if (possibleUsers.length > 0) {
            targetId = possibleUsers[0].id;
            targetName = possibleUsers[0].name;
          }
        }

        if (!targetId) {
          await sendReply(
            instanceName,
            remoteJid,
            `❌ Usuário "${input}" não encontrado nesta empresa. Tente o nome novamente ou digite "eu".`,
          );
          return res.sendStatus(200);
        }

        sessionData.assigned_to_id = targetId;
        sessionData.assigned_to_name = targetName;
        await pool.query(
          "UPDATE user_whatsapp_sessions SET step = 'AWAITING_DUE_DATE', data = ? WHERE user_id = ?",
          [JSON.stringify(sessionData), userId],
        );
        await sendReply(
          instanceName,
          remoteJid,
          `📅 *Qual a data de conclusão para ${targetName}?*\n\nExemplo: 25/12. Digite "não" para sem data.`,
        );
        return res.sendStatus(200);
      }

      if (session.step === "AWAITING_DUE_DATE") {
        const input = text.trim();
        let dueDate = null;
        let dueDateFormatted = "Sem data";

        if (input.toLowerCase() !== "não" && input.toLowerCase() !== "nao") {
          const dateMatch = input.match(
            /(\d{1,2})[\/\-](\d{1,2})(?:[\/\-](\d{2,4}))?/,
          );
          if (dateMatch) {
            const day = dateMatch[1].padStart(2, "0");
            const month = dateMatch[2].padStart(2, "0");
            const year = dateMatch[3] || new Date().getFullYear();
            dueDate = `${year}-${month}-${day}`;
            dueDateFormatted = `${day}/${month}`;
          } else {
            await sendReply(
              instanceName,
              remoteJid,
              "⚠️ Formato de data inválido. Use DD/MM ou digite 'não'.",
            );
            return res.sendStatus(200);
          }
        }

        // FINALIZAR E CRIAR TAREFA
        const [result] = await pool.query(
          "INSERT INTO tasks (company_id, created_by_user_id, assigned_to_user_id, title, status, due_date) VALUES (?, ?, ?, ?, 'Iniciada', ?)",
          [
            sessionData.company_id,
            userId,
            sessionData.assigned_to_id,
            `[Zap] ${sessionData.title}`,
            dueDate,
          ],
        );

        // Limpar sessão
        await pool.query(
          "DELETE FROM user_whatsapp_sessions WHERE user_id = ?",
          [userId],
        );

        let successMsg = `✅ *Tarefa Criada com Sucesso!*\n\n`;
        successMsg += `🏢 *Empresa:* ${sessionData.company_name}\n`;
        successMsg += `📌 *ID:* ${result.insertId}\n`;
        successMsg += `📌 *Título:* ${sessionData.title}\n`;
        successMsg += `👤 *Responsável:* ${sessionData.assigned_to_name}\n`;
        successMsg += `📅 *Prazo:* ${dueDateFormatted}`;

        await sendReply(instanceName, remoteJid, successMsg);
        return res.sendStatus(200);
      }
    }

    res.sendStatus(200);
  } catch (error) {
    console.error("[Webhook] ERRO CRÍTICO:", error);
    res.status(500).json({ error: error.message });
  }
};

// Usar r* para capturar qualquer sub-rota (ex: /whatsapp/connection-update)
// Rota simples para evitar erros de sintaxe na Vercel
// Usar .all ou .post sem parâmetros complexos para evitar erros na Vercel
router.post("/whatsapp", handleWebhook);
router.post("/whatsapp/messages-upsert", handleWebhook);
module.exports = router;
