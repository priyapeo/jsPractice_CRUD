const express = require('express');
const app = express();
const route = express.Router();
const PORT = 3000;

app.use(express.json());

let fruits = [];
let nextId = 1;

route.get("/", (req, res) => {
  console.log("fruits");
  res.json(fruits);
});

route.post("/", (req, res) => {
  console.log("message");

  const { name } = req.body;
  if (!name) return res.status(400).json({ message: "Name is required" });

  const newFruit = { id: nextId++, name };
  fruits.push(newFruit);
  res.status(201).json(newFruit);
});

route.put("/:id", (req, res) => {
  console.log("message");

  const fruitId = parseInt(req.params.id);
  const { name } = req.body;

  const fruit = fruits.find(f => f.id === fruitId);
  if (!fruit) return res.status(404).json({ message: "Fruit not found" });
  if (!name) return res.status(400).json({ message: "Name is required" });

  fruit.name = name;
  res.json(fruit);
});

route.delete("/:id", (req, res) => {
  console.log("message");

  const fruitId = parseInt(req.params.id);
  const index = fruits.findIndex(f => f.id === fruitId);

  if (index === -1) return res.status(404).json({ message: "Fruit not found" });

  fruits.splice(index, 1);
  res.json({ message: `Fruit ID ${fruitId} deleted` });
});

route.use("/fruits", route);
app.use("/api/v1", route)

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
