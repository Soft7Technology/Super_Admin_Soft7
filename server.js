const express = require("express");

const app = express();

app.get("/", (req, res) => {
  res.send("Super Admin Backend Running");
});

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});