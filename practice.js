const express = require('express');
const db = require('./db');
const app = express();
const route = express.Router();
const PORT = 3000;

app.use(express.json());

let fruits = [];
let nextId = 1;

route.get("/", async (req, res) => {
  try {
    console.log("fruits",req.query);
    const {name} = req.query;
    const fruits = await db.query(`
      SELECT * 
      FROM 
      fruits
      WHERE name = ($1)
      `,[name])
    res.json(fruits.rows);
  } 
  catch (err) {
    console.log({err:err.message})
    res.status(500).json({ message: "Server error" });
  }
});

route.post("/", async (req, res) => {
  try {
    console.log("POST /fruits - adding...");

    const { name } = req.body;
    if (!name) return res.status(400).json({ message: "Name is required" });

    const newFruit = await db.query("INSERT INTO fruits (name) VALUES ($1)",
      [name]
    );

    res.status(201).json(newFruit.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
});

route.put("/:id", async (req, res) => {
  try {
    console.log("PUT /fruits/:id - updating...");

    const fruitId = parseInt(req.params.id);
    const { name } = req.body;

    if (!name) return res.status(400).json({ message: "Name is required" });

    const fruit = await db.query(
      "UPDATE fruits SET name = $1 WHERE id = $2 RETURNING *",
      [name, fruitId]
    );

    if (fruit.rows.length === 0) {
      return res.status(404).json({ message: "Fruit not found" });
    }

    res.json(fruit.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
});


// route.put("/:id", async (req, res) => {
//   try {
//     console.log("PUT /fruits/:id");
//     console.log("PUT /fruits/:id - updating...");
    
//     setTimeout(()=>{
//       const fruitId = parseInt(req.params.id);
//     const { name } = req.body;

//     const fruit = fruits.find(f => f.id === fruitId);
//     if (!fruit) return res.status(404).json({ message: "Fruit not found" });
//     if (!name) return res.status(400).json({ message: "Name is required" });

//     fruit.name = name;
//     res.json(fruit);
//     },2000)
//   } 
//   catch (err) {
//     res.status(500).json({ message: "Server error" });
//   }
// });


route.delete("/:id", async (req, res) => {
  try {
    console.log("DELETE /fruits/:id - deleting...");

    const fruitId = parseInt(req.params.id);

    const fruit = await db.query(
      "DELETE FROM fruits WHERE id = $1 RETURNING *",
      [fruitId]
    );

    if (fruit.rows.length === 0) {
      return res.status(404).json({ message: "Fruit not found" });
    }

    res.json({ message: `Fruit ID ${fruitId} deleted`});
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// Middleware example (commented out)
// const auth = (req, res, next) => {
//   console.log("JWT dec.. role = admin  This is a middleware");
//   next();
//   // if (!admin) next("Permission Declined!");
// };

app.use("/api/v1/fruits", route);

app.use((err, req, res, next) => {
console.error(err.stack);
res.status(500).send('Something broke!');
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
