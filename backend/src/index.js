const app = require("./config/server");
require("dotenv").config();

const port = process.env.PORT || 3000;
const auth = require("./middleware/auth");

// Routes
app.use("/webhooks", require("./routes/webhooks"));
app.use("/auth", require("./routes/auth"));
app.use("/companies", auth, require("./routes/companies"));
app.use("/users", auth, require("./routes/users"));
app.use("/tasks", auth, require("./routes/tasks"));

app.get("/", (req, res) => {
  res.send("Gestor de Tarefas API is running");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
