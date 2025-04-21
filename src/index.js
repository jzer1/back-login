
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { admin, db } = require("./firebaseAdmin.js");

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.post("/api/register", async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    // Crear usuario en Auth
    const userRecord = await admin.auth().createUser({
      email,
      password,
    });

    // Guardar información adicional en Firestore
    await db.collection("users").doc(userRecord.uid).set({
      name,
      email,
      role: role || "Ciudadano", // Usa el role del body o un valor por defecto
    });

    res.status(200).json({ message: "Usuario registrado correctamente" });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
});


app.post("/api/getUserData", async (req, res) => {
  const { token } = req.body;

  try {
    // Verificar el token con Firebase Admin
    const decodedToken = await admin.auth().verifyIdToken(token);
    const uid = decodedToken.uid;

    // Buscar los datos del usuario en Firestore
    const userDoc = await db.collection("users").doc(uid).get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    const userData = userDoc.data();

    res.status(200).json({
      name: userData.name,
      role: userData.role,
      email: userData.email,
    });
  } catch (error) {
    console.error("Error verificando token:", error);
    res.status(401).json({ error: "Token inválido" });
  }
});

