const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();

// Configuraciones para entender los datos del HTML
app.use(cors());
app.use(express.urlencoded({ extended: true })); 
app.use(express.json());

// 1. Conexión a  MySQL Workbench
const conexion = mysql.createConnection({
    host: 'localhost',
    user: 'root',      // Tu usuario de Workbench 
    password: '1234567890', // Contraseña personal del workbrench
    database: 'agro_merge_db'
});

conexion.connect((error) => {
    if (error) {
        console.error('Error conectando a la base de datos:', error);
    } else {
        console.log('¡Conectado exitosamente a MySQL Workbench!');
    }
});

// 2. Ruta para recibir los datos del HTML
app.post('/registro', (req, res) => {
    // Capturamos los datos del formulario (deben coincidir con el atributo "name" del HTML)
    const nombre = req.body.nombre_usuario; // Nuevo campo requerido por tu BD
    const email = req.body.correo_usuario; 
    const contrasena = req.body.clave_usuario;

    // Solo necesitamos insertar nombre, email y contrasena. 
    // El id, foto, rol, estado y fecha se llenan solos gracias a tu excelente diseño de BD.
    const sql = 'INSERT INTO usuarios (nombre, email, contrasena) VALUES (?, ?, ?)';
    
    conexion.query(sql, [nombre, email, contrasena], (error, resultados) => {
        if (error) {
            console.error('Error al registrar:', error);
            res.send('Hubo un error al registrar el usuario. Es posible que el correo ya exista.');
        } else {
            console.log('Usuario registrado con éxito.');
            // Redirige al login. Verifica que esta sea tu URL de Live Server.
            res.redirect('http://127.0.0.1:5500/Login/login.html');
        }
    });
});

// Encender el servidor
app.listen(3000, () => {
    console.log('Servidor corriendo en el puerto 3000');
});