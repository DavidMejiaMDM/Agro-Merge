const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path');
const nodemailer = require('nodemailer');

// Configuración del mensajero en este caso(Gmail)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'agromerge@gmail.com', // Tu correo de Agro-Merge
        pass: 'codr ubjv pjvg sbxy' // No es tu clave normal, es la de 16 letras de Google
    }
});

const app = express();

// Configuraciones para entender los datos del HTML
app.use(cors());
app.use(express.urlencoded({ extended: true })); 
app.use(express.json());
app.use(express.static(path.join(__dirname, '../Interfaz')));

// 1. Conexión a MySQL Workbench
const conexion = mysql.createConnection({
    host: 'localhost',
    user: 'root',      
    password: '1234567890', 
    database: 'agro_merge_db'
});

conexion.connect((error) => {
    if (error) {
        console.error('Error conectando a la base de datos:', error);
    } else {
        console.log('¡Conectado exitosamente a MySQL Workbench!');
    }
});

// 2. RUTA: REGISTRO
app.post('/registro', (req, res) => {
    const nombre = req.body.nombre_usuario;
    const email = req.body.correo_usuario; 
    const contrasena = req.body.clave_usuario;
    const codigoVerificacion = Math.floor(1000 + Math.random() * 9000);

    const sql = 'INSERT INTO usuarios (nombre, email, contrasena, estado, codigo_verificacion) VALUES (?, ?, ?, "inactivo", ?)';
    
    conexion.query(sql, [nombre, email, contrasena, codigoVerificacion], (error, resultados) => {
        if (error) {
            console.error('Error en MySQL:', error);
            // Si el error es por duplicado, avisamos amigablemente
            if (error.code === 'ER_DUP_ENTRY') {
                return res.send('<h1>Error</h1><p>Este correo ya está registrado.</p><a href="javascript:history.back()">Volver</a>');
            }
            return res.send('Error al registrar en la base de datos.');
        }

        // --- SI LLEGAMOS AQUÍ, EL USUARIO YA EXISTE EN LA BD ---

        const opcionesCorreo = {
            from: '"Agro-Merge 🌿" <tu_correo@gmail.com>',
            to: email,
            subject: 'Tu código de verificación - Agro-Merge',
            html: `
                <div style="text-align: center; font-family: sans-serif;">
                    <h2>¡Hola ${nombre}!</h2>
                    <p>Usa el siguiente código para activar tu cuenta:</p>
                    <h1 style="color: #16a34a;">${codigoVerificacion}</h1>
                </div>
            `
        };

        // ENVIAR EL CORREO
        transporter.sendMail(opcionesCorreo, (err, info) => {
            if (err) {
                console.error('Error de Nodemailer:', err);
                // Aunque falle el correo, el usuario ya se creó. 
                // Lo mandamos a la página de confirmación de todos modos.
                return res.redirect('http://127.0.0.1:5500/Interfaz/pages/Confirmar-codigo/confirmar-codigo.html');
            }
            
            console.log('✅ Correo enviado con éxito a:', email);
            
            // REDIRECCIÓN FINAL (Solo ocurre si el correo se envió o falló controladamente)
            return res.redirect('http://127.0.0.1:5500/Interfaz/pages/Confirmar-codigo/confirmar-codigo.html');
        });
    });
});

// 3. RUTA: LOGIN 
app.post('/login', (req, res) => {
    const email = req.body.correo_usuario;
    const contrasena = req.body.clave_usuario;

    const sql = 'SELECT * FROM usuarios WHERE email = ? AND contrasena = ?';
    
    conexion.query(sql, [email, contrasena], (error, resultados) => {
        if (error) {
            console.error('Error en el login:', error);
            return res.send('Hubo un error al procesar tu solicitud.');
        }

        if (resultados.length > 0) {
            const usuario = resultados[0];
            
            if (usuario.estado === 'inactivo') {
                // CORRECCIÓN: Si está inactivo, lo mandamos a la página de confirmar código, no a una que no existe
                res.send('<h1>Cuenta inactiva</h1><p>Debes verificar tu código de 4 dígitos.</p><a href="http://127.0.0.1:5500/Interfaz/pages/Confirmar-codigo/confirmar-codigo.html">Ir a verificar ahora</a>');
            } else {
                console.log('Login exitoso de:', usuario.nombre);
                // Asegúrate de que el puerto 5501 sea el que está usando tu Index.html
                res.redirect('http://127.0.0.1:5500/Interfaz/Index.html');
            }
        } else {
            res.send('<h1>Error</h1><p>Correo o contraseña incorrectos.</p><a href="javascript:history.back()">Volver a intentar</a>');
        }
    });
});

// 4. RUTA: VERIFICAR CÓDIGO
app.post('/verificar-codigo', (req, res) => {
    const { d1, d2, d3, d4, correo_usuario } = req.body;
    
    // UNIMOS LOS 4 DÍGITOS EN UNA SOLA VARIABLE
    const codigoIngresado = `${d1}${d2}${d3}${d4}`;

    // Buscamos al usuario por correo Y código
    const sql = 'SELECT * FROM usuarios WHERE email = ? AND codigo_verificacion = ?';
    
    conexion.query(sql, [correo_usuario, codigoIngresado], (error, resultados) => {
        if (error) {
            return res.send("Error en la base de datos.");
        }

        if (resultados.length > 0) {
            // CÓDIGO CORRECTO: Actualizamos el estado a 'activo'
            const updateSql = 'UPDATE usuarios SET estado = "activo" WHERE email = ?';
            conexion.query(updateSql, [correo_usuario], (err) => {
                // Redirigimos al login o al index ya logueado
                res.redirect('http://127.0.0.1:5500/Interfaz/pages/Login/login.html');
            });
        } else {
            // CÓDIGO INCORRECTO
            res.send(`
                <h1>Código incorrecto</h1>
                <p>El código ${codigoIngresado} para el correo ${correo_usuario} no coincide.</p>
                <a href="javascript:history.back()">Intentar de nuevo</a>
            `);
        }
    });
});

app.listen(3000, () => {
    console.log('Servidor corriendo en el puerto 3000');
});