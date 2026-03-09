const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path');

const app = express();

// Configuraciones para entender los datos del HTML
app.use(cors());
app.use(express.urlencoded({ extended: true })); 
app.use(express.json());
app.use(express.static(path.join(__dirname, '../Interfaz')));

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

// =======================================================
// RUTA 3: LOGIN 
// =======================================================
app.post('/login', (req, res) => {
    const email = req.body.correo_usuario;
    const contrasena = req.body.clave_usuario;

    // Buscamos si existe un usuario con ese correo y esa contraseña iguales
    const sql = 'SELECT * FROM usuarios WHERE email = ? AND contrasena = ?';
    
    conexion.query(sql, [email, contrasena], (error, resultados) => {
        if (error) {
            console.error('Error en el login:', error);
            return res.send('Hubo un error al procesar tu solicitud.');
        }

        if (resultados.length > 0) {
            const usuario = resultados[0];
            
            // Verificamos si ya puso el código de 4 dígitos (para saber si el estado es activo)
            if (usuario.estado === 'inactivo') {
                res.send('<h1>Cuenta inactiva</h1><p>Debes verificar tu correo con el código de 4 dígitos antes de iniciar sesión.</p><a href="http://127.0.0.1:5500/verificar.html">Ir a verificar</a>');
            } else {
                // aqui redireccionamos al idenx principal
                console.log('Login exitoso de:', usuario.nombre);
                res.redirect('http://127.0.0.1:5501/Index.html');
            }
        } else {
            // No coincidió el correo o la contraseña
            res.send('<h1>Error</h1><p>Correo o contraseña incorrectos.</p><a href="javascript:history.back()">Volver a intentar</a>');
        }
    });
});

// Encender servidor
app.listen(3000, () => {
    console.log('Servidor corriendo en el puerto 3000');
});