const express = require('express');
const { DataTypes } = require("sequelize");
const Sequelize = require("sequelize");
const Fruit = require('./models/fruit');
const Color = require('./models/color');
const User = require('./models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const db = require('./db');
const app = express();
const route = express.Router();
const PORT = 3000;

app.use(express.json());

(async () => {
  try {
    await db.authenticate();
    console.log('Connection has been established successfully.');

    await db.sync({ alter: true });
    console.log('All models synced successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
})();


const Secret = process.env.JWT_SECRET;

function processName(username, callback) {
  const processedName = username.trim().toUpperCase();
  callback(processedName);
}

route.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password)
    return res.status(400).json({ message: "Username and password required" });

  processName(username, async (processedUsername) => {
    try {
      const existingUser = await User.findOne({ where: { username: processedUsername } });
      if (existingUser)
        return res.status(400).json({ message: "That username is taken. Try another" });

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await User.create({ username: processedUsername, password: hashedPassword });

      res.status(201).json({ message: `Hello ${user.username}, you registered successfully` });
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ message: "Server error" });
    }
  });
});

route.post("/login", async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password)
    return res.status(400).json({ message: "Username and password required" });

    try {
    const user = await User.findOne({ where: { username } });
    if (!user)
      return res.status(401).json({ message: "Invalide username" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalide password" });

     const token = jwt.sign({ userId: user.id }, Secret, { expiresIn: '1h' });
     res.json({ token });
  }catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
});

const authenticate = (req, res, next) => {
  const token = req.headers['authorization'];

  if (!token)
    return res.status(401).json({ message: 'Unauthorized' });

  try {
  const payload = jwt.verify(token, Secret);
  req.user = payload;
  next();
} catch (err) {
  return res.status(403).json({ message: 'Invalid or expired token' });
}

};

// route.use(authenticate);

route.get("/",authenticate, async (req, res) => {
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

//   if (!name) return callback(new Error("Name is required"));

//   Fruit.create({ name })
//     .then(fruit => callback(null, fruit))
//     .catch(err => callback(err));
//  }

// route.post("/",authenticate, (req, res) => {
//   const { name } = req.body;
//   createFruit(name, (err, fruit) => {
//     if (err) {
//       console.error(err.message);
//       return res.status(500).json({ message: "Server error" });
//     }
//     res.status(201).json(fruit);
//   });
// });

// route.post("/", authenticate, async (req, res) => {
//   try {
//     const { name } = req.body;

//     if (!name) {
//       return res.status(400).json({ message: "Name is required" });
//     }
//     const newFruit = await Fruit.create({ name: name.trim() });

//     res.status(201).json(newFruit);
//   } catch (err) {
//     console.error("Error creating fruit:", err.message);
//     res.status(500).json({ message: "Server error" });
//   }
// });


// route.post("/:id/color", async (req, res) => {                 //add color api
//   try {
//     const fruitId = parseInt(req.params.id);
//     const { color } = req.body;

//     if (!color) return res.status(400).json({ message: "Color is required" });
   
//     const fruit = await Fruit.findByPk(fruitId);
//     if (!fruit) return res.status(404).json({ message: "Fruit not found" });

//     const newColor = await Color.create({
//       color,
//       fruit_id: fruitId
//     });

//     res.status(201).json(newColor);
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).json({ message: "Server error" });
//   }
// });

function createRecord(model, data, callback, requiredFields = []) {
  if (!data || Object.keys(data).length === 0) {
    return callback(new Error("Data is missing"));
  }
if(!Array.isArray(requiredFields)) return callback(new Error(`Invalid format`));
  for (const field of requiredFields) {
    const value = data[field];

    if (value === undefined || value === null || value.toString().trim() === "") {
      return callback(new Error(`${field} is required`));
    }
  }

  model.create(data)
    .then(record => callback(null, record))
    .catch(err => callback(err));
}

route.post("/", (req, res) => {
  createRecord(Fruit, req.body, (err, fruit) => {
    if (err) {
      console.error(err.message);
      const status = err.message.includes("missing") || err.message.includes("required") 
        ? 400 
        : 500;

      return res.status(status).json({ message: err.message });
    }

    res.status(201).json(fruit);
  }, ['name']); 
});


route.post("/:id/color", async (req, res) => {
  const fruitId = parseInt(req.params.id);

  const fruit = await Fruit.findByPk(fruitId);
    if (!fruit) return res.status(404).json({ message: "Invalide FruitID" });
    
  const data = { ...req.body, fruit_id: fruitId };

  createRecord(Color, data, (err, newColor) => {
    if (err) {
      console.error(err.message);

      const status = err.message.includes("missing")  || err.message.includes("required")
      ? 400
      : 500;
      return res.status(status).json({ message: err.message });
    }

    res.status(201).json(newColor);
  }, ['color', 'fruit_id']);
});


route.put("/:id", async (req, res) => {             //update fruit api
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


// const app_ ={
//   use:(url,...functions)=> {
//     if( typeof url === "string" ) throw new Error("");

//     functions (req,res,next)
//   }
// }

app.use((err, req, res, next) => {
console.error(err.stack);
res.status(500).send('Something broke!');
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
