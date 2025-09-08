const express = require('express');
const { DataTypes } = require("sequelize");
const Sequelize = require("sequelize");
const Fruit = require('./models/fruit');
const Color = require('./models/color');
const db = require('./db');
const app = express();
const route = express.Router();
const PORT = 3000;

app.use(express.json());

let fruits = [];
let nextId = 1;

(
  async()=>{                           //(this is a iife) 
  try {
  await db.authenticate();
  console.log('Connection has been established successfully.');
} catch (error) {
  console.error('Unable to connect to the database:', error);
}}
)()


// route.get("/", async (req, res) => {
//   try {
//     console.log("fruits",req.query);
//     const {name} = req.query;
//     const fruits = await db.query(`
//       SELECT f.id, f.name, c.color
//       FROM fruits f
//       JOIN colors c ON f.id = c.fruit_id
//       ORDER BY f.id;
//     `);
//     res.json(fruits.rows);
//   } 
//   catch (err) {
//     console.log({err:err.message})
//     res.status(500).json({ message: "Server error" });
//   }
// });


route.get("/", async (req, res) => {
  try {
    console.log("fruits",req.query);
    const fruits = await Fruit.findAll({
      include: {
        model: Color,
        attributes: ['color'],
      },
      order: [['id', 'ASC']],
    });
    res.json(fruits);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
});


// route.post("/", async (req, res) => {
//   try {
//     console.log("POST /fruits - adding...");

//     const { name } = req.body;
//     if (!name) return res.status(400).json({ message: "Name is required" });

//     const newFruit = await db.query("INSERT INTO fruits (name) VALUES ($1)",
//       [name]
//     );

//     res.status(201).json(newFruit.rows[0]);
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).json({ message: "Server error" });
//   }
// });

route.post("/", async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: "Name is required" });

    const newFruit = await Fruit.create({ name });
    res.status(201).json(newFruit);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// route.put("/:id", async (req, res) => {
//   try {
//     console.log("PUT /fruits/:id - updating...");

//     const fruitId = parseInt(req.params.id);
//     const { name } = req.body;

//     if (!name) return res.status(400).json({ message: "Name is required" });

//     const fruit = await db.query(
//       "UPDATE fruits SET name = $1 WHERE id = $2 RETURNING *",
//       [name, fruitId]
//     );

//     if (fruit.rows.length === 0) {
//       return res.status(404).json({ message: "Fruit not found" });
//     }

//     res.json(fruit.rows[0]);
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).json({ message: "Server error" });
//   }
// });

route.put("/:id", async (req, res) => {
  try {
    const fruitId = parseInt(req.params.id);
    const { name } = req.body;

    if (!name) return res.status(400).json({ message: "Name is required" });

    const fruit = await Fruit.findByPk(fruitId);
    if (!fruit) return res.status(404).json({ message: "Fruit not found" });

    fruit.name = name;
    await fruit.save();

    res.json(fruit);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
});

route.delete("/:id", async (req, res) => {
  try {
    const fruitId = parseInt(req.params.id);

    const fruit = await Fruit.findByPk(fruitId);
    if (!fruit) return res.status(404).json({ message: "Fruit not found" });

    await fruit.destroy();

     res.json({ message: `Fruit ID ${fruitId} deleted` });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
});


app.use("/api/v1/fruits", route);

app.use((err, req, res, next) => {
console.error(err.stack);
res.status(500).send('Something broke!');
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
