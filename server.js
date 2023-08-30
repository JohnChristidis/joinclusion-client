const mysql = require("mysql2/promise");
const express = require("express");
const bodyParser = require('body-parser')
const cors = require("cors");
require('dotenv').config();


const app = express();
app.use(express.json());
app.use(bodyParser.urlencoded({extended: true}))
// Configure CORS to allow requests from a specific origin
const corsOptions = {
  origin: 'http://localhost:5173'
};

// Apply CORS middleware with specific options
app.use(cors(corsOptions));
const PORT = 3000;

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    port: process.env.DB_PORT,
});
app.post('/login', async (req, res) => {
    try {
        const { username, pwd } = req.body;

        const connection = await pool.getConnection();

        const [rows] = await connection.execute(
            "SELECT * FROM teachers WHERE username = ? AND pwd = ?",
            [username, pwd]
        );

        connection.release();

        if (rows.length === 0) {
            return res.status(401).json({ error: "Invalid username or password" });
        }

        res.status(200).json({ message: "Login successful", teacher: rows[0] });
    } catch (error) {
        console.error("Error executing query:", error);
        res.status(500).send("Internal Server Error");
    }
});

app.get('/teachers', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        const [rows, fields] = await connection.execute("SELECT * FROM teachers"); // Replace with your table name
        connection.release();
        res.status(200).json(rows); // Return status 200 for successful response
    } catch (error) {
        console.error("Error executing query:", error);
        res.status(500).send("Internal Server Error");
    }
});

app.post('/add-teacher', async (req, res) => {
    try {
        const { username, pwd } = req.body;

        if (!username || !pwd) {
            return res.status(400).json({ error: "Username and password are required" });
        }

        const connection = await pool.getConnection();

        // Insert the new teacher into the database
        const [result] = await connection.execute(
            "INSERT INTO teachers (username, pwd) VALUES (?, ?)",
            [username, pwd]
        );

        connection.release();

        res.status(201).json({ message: "Teacher created successfully", insertedId: result.insertId }); // Return status 201 for resource created
    } catch (error) {
        console.error("Error executing query:", error);
        res.status(500).send("Internal Server Error");
    }
});

app.get('/mods/:teacher_id', async (req, res) => {
    try {
        const { teacher_id } = req.params; // Get the ID from the request parameters
        const connection = await pool.getConnection();
        const [rows, fields] = await connection.execute("SELECT id, mod_name, published FROM mods WHERE teachers_id = ?", [teacher_id]); // Specify the desired columns and the condition
        connection.release();
        res.status(200).json(rows); // Return status 200 for successful response
    } catch (error) {
        console.error("Error executing query:", error);
        res.status(500).send("Internal Server Error");
    }
});

app.post('/add-mod', async (req, res) => {
    try {
        const {teachers_id, mod_name, number_of_players, mod_timer_active, mod_timer_time, mode_code, mod_json, published} = req.body;

        if (!teachers_id || !mod_name) {
            return res.status(400).json({ error: "teachers_id and mod_name are required" });
        }

        const connection = await pool.getConnection();

        // Insert the new mod into the database
        const [result] = await connection.execute(
            "INSERT INTO mods (teachers_id, mod_name, number_of_players, mod_timer_active, mod_timer_time, mode_code, mod_json, published) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            [teachers_id, mod_name, number_of_players, mod_timer_active, mod_timer_time, mode_code, mod_json, published]
        );

        connection.release();

        res.status(201).json({ message: "Mod created successfully", insertedId: result.insertId });
    } catch (error) {
        console.error("Error executing query:", error);
        res.status(500).send("Internal Server Error");
    }
});

app.get('/mod/:id', async (req, res) => {
    try {
        const { id } = req.params; // Get the ID from the request parameters
        const connection = await pool.getConnection();
        const [rows, fields] = await connection.execute("SELECT * FROM mods WHERE id = ?", [id]); // Specify the desired columns and the condition
        connection.release();
        res.status(200).json(rows); // Return status 200 for successful response
    } catch (error) {
        console.error("Error executing query:", error);
        res.status(500).send("Internal Server Error");
    }
});

app.put('/update-mod/:id', async (req, res) => {
    try {
        const idToUpdate = req.params.id;
        const { teachers_id, mod_name, number_of_players, mod_timer_active, mod_timer_time, mode_code, mod_json, published } = req.body;

        const connection = await pool.getConnection();

        const updateQuery = `
            UPDATE mods
            SET teachers_id = ?, mod_name = ?, number_of_players = ?,
                mod_timer_active = ?, mod_timer_time = ?, mode_code = ?, mod_json = ?, published = ?
            WHERE id = ?
        `;

        const [result] = await connection.execute(updateQuery, [
            teachers_id, mod_name, number_of_players, mod_timer_active, mod_timer_time, mode_code, mod_json, published, idToUpdate
        ]);

        connection.release();

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Mod not found" });
        }

        res.status(200).json({ message: "Mod updated successfully" });
    } catch (error) {
        console.error("Error executing query:", error);
        res.status(500).send("Internal Server Error");
    }
});

app.put('/publish-mod/:id', async (req, res) => {
    try {
        const idToUpdate = req.params.id;
        const { published } = req.body;

        const connection = await pool.getConnection();

        const updateQuery = `
            UPDATE mods
            SET published = ?
            WHERE id = ?
        `;

        const [result] = await connection.execute(updateQuery, [
            published, idToUpdate
        ]);

        connection.release();

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Mod not found" });
        }

        res.status(200).json({ message: "Mod updated successfully" });
    } catch (error) {
        console.error("Error executing query:", error);
        res.status(500).send("Internal Server Error");
    }
});

app.put('/unpublish-mod/:id', async (req, res) => {
    try {
        const idToUpdate = req.params.id;
        const { published } = req.body;

        const connection = await pool.getConnection();

        const updateQuery = `
            UPDATE mods
            SET published = ?
            WHERE id = ?
        `;

        const [result] = await connection.execute(updateQuery, [
            published, idToUpdate
        ]);

        connection.release();

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Mod not found" });
        }

        res.status(200).json({ message: "Mod updated successfully" });
    } catch (error) {
        console.error("Error executing query:", error);
        res.status(500).send("Internal Server Error");
    }
});

app.delete('/delete-mod/:id', async (req, res) => {
    try {
        const idToDelete = req.params.id;

        const connection = await pool.getConnection();

        const deleteQuery = `
            DELETE FROM mods
            WHERE id = ?
        `;

        const [result] = await connection.execute(deleteQuery, [idToDelete]);

        connection.release();

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Mod not found" });
        }

        res.status(200).json({ message: "Mod deleted successfully" });
    } catch (error) {
        console.error("Error executing query:", error);
        res.status(500).send("Internal Server Error");
    }
});
//
//
// const mysql = require("mysql2/promise");
// const express = require("express");
// const bodyParser = require('body-parser')
// const cors = require("cors");
// const jwt = require('jsonwebtoken');
// const bcrypt = require('bcrypt');
//
//
// const app = express();
// app.use(express.json());
// app.use(bodyParser.urlencoded({extended: true}))
// // Configure CORS to allow requests from a specific origin
// const corsOptions = {
//   origin: ['http://localhost:5173', 'http://localhost:5174']
// };
//
// // Apply CORS middleware with specific options
// app.use(cors(corsOptions));
//
// const PORT = 3000;
//
// const pool =  mysql.createPool({
//     host: "localhost",
//     user : "joinclusion",
//     password: "joinclusion",
//     database: "joinclusion_authoring_tool",
//     port: 3306,
// });
//
// const authenticateJWT = (req, res, next) => {
//     const token = req.header('Authorization');
//
//     if (!token) {
//         return res.status(401).json({ error: "Missing token" });
//     }
//
//     jwt.verify(token, 'your-secret-key', (err, decoded) => {
//         if (err) {
//             return res.status(403).json({ error: "Invalid token" });
//         }
//         req.user = decoded;
//         next();
//     });
// };
//
//
// app.post('/admin/login', async (req, res) => {
//     try {
//         const { username, pwd } = req.body;
//
//         const connection = await pool.getConnection();
//
//         const [rows] = await connection.execute(
//             "SELECT * FROM admin WHERE username = ?",
//             [username]
//         );
//
//         connection.release();
//
//         if (rows.length === 0) {
//             return res.status(401).json({ error: "Invalid username or password 1" });
//         }
//
//         const storedPassword = rows[0].pwd; // Assuming you store plain passwords
//
//         if (pwd !== storedPassword) {
//             return res.status(401).json({ error: "Invalid username or password 2" });
//         }
//
//         const payload = {
//             adminId: rows[0].id,
//             username: rows[0].username,
//             isAdmin: true,
//         };
//
//         const token = jwt.sign(payload, 'your-secret-key', { expiresIn: '1h' });
//
//         res.status(200).json({ message: "Admin login successful", token });
//     } catch (error) {
//         console.error("Error executing query:", error);
//         res.status(500).send("Internal Server Error");
//     }
// });
//
//
// app.post('/admin/register-teacher', async (req, res) => {
//     try {
//         const { username, pwd } = req.body;
//
//         const connection = await pool.getConnection();
//
//         const [existingRows] = await connection.execute(
//             "SELECT * FROM teachers WHERE username = ?",
//             [username]
//         );
//
//         if (existingRows.length > 0) {
//             connection.release();
//             return res.status(409).json({ error: "Username already exists" });
//         }
//
//         const hashedPassword = await bcrypt.hash(pwd, 10);
//
//         const [result] = await connection.execute(
//             "INSERT INTO teachers (username, pwd) VALUES (?, ?)",
//             [username, hashedPassword]
//         );
//
//         connection.release();
//
//         const insertedId = result.insertId;
//
//         const payload = {
//             teacherId: insertedId,
//             username: username,
//         };
//
//         const token = jwt.sign(payload, 'your-secret-key', { expiresIn: '1h' });
//
//         res.status(201).json({ message: "Registration successful", token });
//     } catch (error) {
//         console.error("Error executing query:", error);
//         res.status(500).send("Internal Server Error");
//     }
// });
//
// app.post('/login', async (req, res) => {
//     try {
//         const { username, pwd } = req.body;
//
//         const connection = await pool.getConnection();
//
//         const [rows] = await connection.execute(
//             "SELECT * FROM teachers WHERE username = ?",
//             [username]
//         );
//
//         connection.release();
//
//         if (rows.length === 0) {
//             return res.status(401).json({ error: "Invalid username or password" });
//         }
//
//         const storedHashedPassword = rows[0].pwd;
//
//         const passwordMatch = await bcrypt.compare(pwd, storedHashedPassword);
//
//         if (!passwordMatch) {
//             return res.status(401).json({ error: "Invalid username or password" });
//         }
//
//         const payload = {
//             teacherId: rows[0].id,
//             username: rows[0].username,
//         };
//
//         const token = jwt.sign(payload, 'your-secret-key', { expiresIn: '1h' });
//
//         res.status(200).json({
//     message: "Login successful",
//     token,
//     teacher: {
//         id: rows[0].id,
//         username: rows[0].username
//         // ... other properties you want to include
//     }
// });
//     } catch (error) {
//         console.error("Error executing query:", error);
//         res.status(500).send("Internal Server Error");
//     }
// });
//
// app.get('/teachers', authenticateJWT, async (req, res) => {
//     try {
//         const connection = await pool.getConnection();
//         const [rows, fields] = await connection.execute("SELECT * FROM teachers"); // Replace with your table name
//         connection.release();
//         res.status(200).json(rows); // Return status 200 for successful response
//     } catch (error) {
//         console.error("Error executing query:", error);
//         res.status(500).send("Internal Server Error");
//     }
// });
//
// app.get('/mods/:teacher_id', authenticateJWT, async (req, res) => {
//     try {
//         const { teacher_id } = req.params; // Get the ID from the request parameters
//         const connection = await pool.getConnection();
//         const [rows, fields] = await connection.execute("SELECT id, mod_name, published FROM mods WHERE teachers_id = ?", [teacher_id]); // Specify the desired columns and the condition
//         connection.release();
//         res.status(200).json(rows); // Return status 200 for successful response
//     } catch (error) {
//         console.error("Error executing query:", error);
//         res.status(500).send("Internal Server Error");
//     }
// });
//
// app.post('/add-mod', async (req, res) => {
//     try {
//         const {teachers_id, mod_name, number_of_players, mod_timer_active, mod_timer_time, mode_code, mod_json, published} = req.body;
//
//         if (!teachers_id || !mod_name) {
//             return res.status(400).json({ error: "teachers_id and mod_name are required" });
//         }
//
//         const connection = await pool.getConnection();
//
//         // Insert the new mod into the database
//         const [result] = await connection.execute(
//             "INSERT INTO mods (teachers_id, mod_name, number_of_players, mod_timer_active, mod_timer_time, mode_code, mod_json, published) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
//             [teachers_id, mod_name, number_of_players, mod_timer_active, mod_timer_time, mode_code, mod_json, published]
//         );
//
//         connection.release();
//
//         res.status(201).json({ message: "Mod created successfully", insertedId: result.insertId });
//     } catch (error) {
//         console.error("Error executing query:", error);
//         res.status(500).send("Internal Server Error");
//     }
// });
//
// app.get('/mod/:id', authenticateJWT, async (req, res) => {
//     try {
//         const { id } = req.params; // Get the ID from the request parameters
//         const connection = await pool.getConnection();
//         const [rows, fields] = await connection.execute("SELECT * FROM mods WHERE id = ?", [id]); // Specify the desired columns and the condition
//         connection.release();
//         res.status(200).json(rows); // Return status 200 for successful response
//     } catch (error) {
//         console.error("Error executing query:", error);
//         res.status(500).send("Internal Server Error");
//     }
// });
//
// app.put('/update-mod/:id', authenticateJWT, async (req, res) => {
//     try {
//         const idToUpdate = req.params.id;
//         const { teachers_id, mod_name, number_of_players, mod_timer_active, mod_timer_time, mode_code, mod_json, published } = req.body;
//
//         const connection = await pool.getConnection();
//
//         const updateQuery = `
//             UPDATE mods
//             SET teachers_id = ?, mod_name = ?, number_of_players = ?,
//                 mod_timer_active = ?, mod_timer_time = ?, mode_code = ?, mod_json = ?, published = ?
//             WHERE id = ?
//         `;
//
//         const [result] = await connection.execute(updateQuery, [
//             teachers_id, mod_name, number_of_players, mod_timer_active, mod_timer_time, mode_code, mod_json, published, idToUpdate
//         ]);
//
//         connection.release();
//
//         if (result.affectedRows === 0) {
//             return res.status(404).json({ error: "Mod not found" });
//         }
//
//         res.status(200).json({ message: "Mod updated successfully" });
//     } catch (error) {
//         console.error("Error executing query:", error);
//         res.status(500).send("Internal Server Error");
//     }
// });
//
// app.put('/publish-mod/:id', authenticateJWT, async (req, res) => {
//     try {
//         const idToUpdate = req.params.id;
//         const { published } = req.body;
//
//         const connection = await pool.getConnection();
//
//         const updateQuery = `
//             UPDATE mods
//             SET published = ?
//             WHERE id = ?
//         `;
//
//         const [result] = await connection.execute(updateQuery, [
//             published, idToUpdate
//         ]);
//
//         connection.release();
//
//         if (result.affectedRows === 0) {
//             return res.status(404).json({ error: "Mod not found" });
//         }
//
//         res.status(200).json({ message: "Mod updated successfully" });
//     } catch (error) {
//         console.error("Error executing query:", error);
//         res.status(500).send("Internal Server Error");
//     }
// });
//
// app.put('/unpublish-mod/:id', authenticateJWT, async (req, res) => {
//     try {
//         const idToUpdate = req.params.id;
//         const { published } = req.body;
//
//         const connection = await pool.getConnection();
//
//         const updateQuery = `
//             UPDATE mods
//             SET published = ?
//             WHERE id = ?
//         `;
//
//         const [result] = await connection.execute(updateQuery, [
//             published, idToUpdate
//         ]);
//
//         connection.release();
//
//         if (result.affectedRows === 0) {
//             return res.status(404).json({ error: "Mod not found" });
//         }
//
//         res.status(200).json({ message: "Mod updated successfully" });
//     } catch (error) {
//         console.error("Error executing query:", error);
//         res.status(500).send("Internal Server Error");
//     }
// });
//
// app.delete('/delete-mod/:id', authenticateJWT, async (req, res) => {
//     try {
//         const idToDelete = req.params.id;
//
//         const connection = await pool.getConnection();
//
//         const deleteQuery = `
//             DELETE FROM mods
//             WHERE id = ?
//         `;
//
//         const [result] = await connection.execute(deleteQuery, [idToDelete]);
//
//         connection.release();
//
//         if (result.affectedRows === 0) {
//             return res.status(404).json({ error: "Mod not found" });
//         }
//
//         res.status(200).json({ message: "Mod deleted successfully" });
//     } catch (error) {
//         console.error("Error executing query:", error);
//         res.status(500).send("Internal Server Error");
//     }
// });
//


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
