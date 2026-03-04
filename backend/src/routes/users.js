const express = require("express");
const router = express.Router();
const pool = require("../config/database");

// Listar todos os usuários (Apenas superadmin ou admin?)
// Vamos permitir que superadmin veja tudo
router.get("/", async (req, res) => {
  try {
    const isSuper = req.user.is_superadmin;
    // Busca se o usuário logado tem cargo de gestor/admin em alguma empresa
    const [userRoles] = await pool.query(
      "SELECT DISTINCT role FROM user_companies WHERE user_id = ?",
      [req.user.id],
    );
    const isGestor = userRoles.some(
      (r) =>
        r.role &&
        (r.role.toLowerCase() === "gestor" || r.role.toLowerCase() === "admin"),
    );

    if (!isSuper && !isGestor) {
      return res.status(403).json({ message: "Acesso negado." });
    }

    // Query base para buscar usuários e suas empresas vinculadas
    let query = "";
    let params = [];

    if (!isSuper && isGestor) {
      // Gestor só vê usuários que estão vinculados a PELO MENOS UMA empresa que ele também está vinculado
      query = `
        SELECT 
          u.id, u.name, u.email, u.is_superadmin, u.active, u.wa_instance, u.whatsapp_number, u.created_at,
          JSON_ARRAYAGG(
            JSON_OBJECT('id', c.id, 'name', c.name, 'role', uc.role)
          ) as linked_companies
        FROM users u
        INNER JOIN user_companies uc_filter ON u.id = uc_filter.user_id
        LEFT JOIN user_companies uc ON u.id = uc.user_id
        LEFT JOIN companies c ON uc.company_id = c.id
        WHERE uc_filter.company_id IN (
          SELECT company_id FROM user_companies WHERE user_id = ?
        )
        GROUP BY u.id
      `;
      params.push(req.user.id);
    } else {
      // Superadmin/Admin vê tudo
      query = `
        SELECT 
          u.id, u.name, u.email, u.is_superadmin, u.active, u.wa_instance, u.whatsapp_number, u.created_at,
          JSON_ARRAYAGG(
            JSON_OBJECT('id', c.id, 'name', c.name, 'role', uc.role)
          ) as linked_companies
        FROM users u
        LEFT JOIN user_companies uc ON u.id = uc.user_id
        LEFT JOIN companies c ON uc.company_id = c.id
        GROUP BY u.id
      `;
    }

    const [rows] = await pool.query(query, params);

    // Buscar empresas que o gestor logado gerencia para filtrar os resultados (caso queira ocultar vínculos com outras empresas)
    let managedCompanyIds = [];
    if (!isSuper && isGestor) {
      const [userLinks] = await pool.query(
        "SELECT company_id FROM user_companies WHERE user_id = ?",
        [req.user.id],
      );
      managedCompanyIds = userLinks.map((l) => l.company_id);
    }

    // Limpar o array e filtrar se for gestor
    const cleanedRows = rows.map((u) => {
      let links = [];
      try {
        // Lidando com o retorno do JSON_ARRAYAGG que pode vir como string ou objeto dependendo do driver/config
        const rawLinks =
          typeof u.linked_companies === "string"
            ? JSON.parse(u.linked_companies)
            : u.linked_companies;
        links =
          rawLinks && rawLinks[0] && rawLinks[0].id !== null ? rawLinks : [];
      } catch (e) {
        links = [];
      }

      // Se for gestor, ele só vê o vínculo com as empresas que ELE também gerencia
      if (!isSuper && isGestor) {
        links = links.filter((link) => managedCompanyIds.includes(link.id));
      }

      return {
        ...u,
        linked_companies: links,
      };
    });

    res.json(cleanedRows);
  } catch (error) {
    console.error("Error in GET /users:", error);
    res.status(500).json({ error: error.message });
  }
});

// Buscar usuário por ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Usuário pode ver a si mesmo ou superadmin vê qualquer um
    if (req.user.id != id && !req.user.is_superadmin) {
      return res.status(403).json({ message: "Acesso negado." });
    }

    const [rows] = await pool.query(
      "SELECT id, name, email, is_superadmin, active, wa_instance, whatsapp_number, created_at FROM users WHERE id = ?",
      [id],
    );
    if (rows.length === 0)
      return res.status(404).json({ message: "Usuário não encontrado" });
    res.json(rows[0]);
  } catch (error) {
    console.error(`Error in GET /users/${req.params.id}:`, error);
    res.status(500).json({ error: error.message });
  }
});

// Atualizar usuário
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, active, role, wa_instance, whatsapp_number } =
      req.body;

    let updateQuery =
      "UPDATE users SET name = ?, email = ?, active = ?, wa_instance = ?, whatsapp_number = ? WHERE id = ?";
    let params = [
      name,
      email,
      active !== undefined ? active : 1,
      wa_instance || null,
      whatsapp_number || null,
      id,
    ];

    // Permite que o próprio usuário se edite, ou que Superadmins editem outros
    const isSuper = req.user.is_superadmin;
    if (req.user.id != id && !isSuper) {
      // Se não for super admin, talvez seja gestor?
      // Por enquanto, vamos manter apenas superadmin podendo editar outros usuários globais.
      return res.status(403).json({ message: "Acesso negado." });
    }

    const { is_superadmin } = req.body;

    if (is_superadmin !== undefined && is_superadmin !== null) {
      if (isSuper) {
        updateQuery =
          "UPDATE users SET name = ?, email = ?, active = ?, is_superadmin = ?, wa_instance = ?, whatsapp_number = ? WHERE id = ?";
        params = [
          name,
          email,
          active !== undefined ? active : 1,
          is_superadmin,
          wa_instance || null,
          whatsapp_number || null,
          id,
        ];
      } else {
        return res.status(403).json({
          message: "Apenas Super Admins podem alterar o status de Super Admin.",
        });
      }
    }

    await pool.query(updateQuery, params);
    res.json({ message: "Usuário atualizado com sucesso" });
  } catch (error) {
    console.error(`Error in PUT /users/${req.params.id}:`, error);
    res.status(500).json({ error: error.message });
  }
});

// Deletar usuário
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!req.user.is_superadmin) {
      return res
        .status(403)
        .json({ message: "Apenas Superadmins podem deletar usuários." });
    }
    await pool.query("DELETE FROM users WHERE id = ?", [id]);
    res.json({ message: "Usuário deletado com sucesso" });
  } catch (error) {
    console.error(`Error in DELETE /users/${req.params.id}:`, error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
