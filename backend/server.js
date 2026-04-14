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

// Esta línea es la que permite que Express sirva tus HTML, CSS y JS sin usar Live Server
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
                // Ruta corregida a relativa
                return res.redirect('/pages/Confirmar-codigo/confirmar-codigo.html');
            }
            
            console.log('✅ Correo enviado con éxito a:', email);
            
            // REDIRECCIÓN FINAL (Ruta corregida a relativa)
            return res.redirect('/pages/Confirmar-codigo/confirmar-codigo.html');
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
                // Ruta corregida a relativa en el enlace
                res.send('<h1>Cuenta inactiva</h1><p>Debes verificar tu código de 4 dígitos.</p><a href="/pages/Confirmar-codigo/confirmar-codigo.html">Ir a verificar ahora</a>');
            } else {
                console.log('Login exitoso de:', usuario.nombre);
                
                const nombreSeguro = encodeURIComponent(usuario.nombre);
                
                // REDIRECCIÓN CORRECTA AL INDEX PRINCIPAL (Ruta corregida a relativa)
                res.redirect(`/Index.html?login=true&nombre=${nombreSeguro}&email=${usuario.email}`);
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
                // Redirigimos al mensaje de éxito (Ruta corregida a relativa)
                res.redirect('/pages/Correo-verificado/correo.verificado.html');
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

// 4.1 RUTA: VERIFICAR CÓDIGO (SOLO PARA RESTABLECER CONTRASEÑA)
app.post('/verificar-codigo-reset', (req, res) => {
    const { d1, d2, d3, d4, correo_usuario } = req.body;
    
    // Unimos los 4 dígitos
    const codigoIngresado = `${d1}${d2}${d3}${d4}`;

    // Buscamos si el código y el correo coinciden
    const sql = 'SELECT * FROM usuarios WHERE email = ? AND codigo_verificacion = ?';
    
    conexion.query(sql, [correo_usuario, codigoIngresado], (error, resultados) => {
        if (error) {
            console.error('Error en base de datos:', error);
            return res.send("Error en la base de datos al verificar código.");
        }

        if (resultados.length > 0) {
            // CÓDIGO CORRECTO: Redirigimos a la pantalla de nueva contraseña (Ruta corregida a relativa)
            res.redirect('/pages/Actualizar-Contraseña/Actualizar-Contraseña.html');
        } else {
            // CÓDIGO INCORRECTO
            res.send(`
                <h1>Código incorrecto</h1>
                <p>El código ingresado no coincide con el enviado a tu correo.</p>
                <a href="javascript:history.back()">Intentar de nuevo</a>
            `);
        }
    });
});


// 5. RUTA: RECUPERAR CONTRASEÑA (Solicitar código)
app.post('/recover-password', (req, res) => {
    const email = req.body.correo_usuario;
    const codigoReset = Math.floor(1000 + Math.random() * 9000); // Genera código de 4 dígitos

    // Primero verificamos si el correo existe en la base de datos
    const sqlCheck = 'SELECT * FROM usuarios WHERE email = ?';
    
    conexion.query(sqlCheck, [email], (error, resultados) => {
        if (error) {
            console.error('Error al buscar usuario:', error);
            return res.send('Error en el servidor.');
        }

        if (resultados.length === 0) {
            // Usuario no encontrado
            return res.send('<h1>Error</h1><p>Este correo no está registrado en Agro-Merge.</p><a href="javascript:history.back()">Volver</a>');
        }

        // Si existe, actualizamos su código de verificación en la BD
        const sqlUpdate = 'UPDATE usuarios SET codigo_verificacion = ? WHERE email = ?';
        conexion.query(sqlUpdate, [codigoReset, email], (err) => {
            if (err) {
                console.error('Error al actualizar código:', err);
                return res.send('Error al generar el código de seguridad.');
            }

            // Configuramos el correo
            const opcionesCorreo = {
                from: '"Agro-Merge 🌿" <agromerge@gmail.com>',
                to: email,
                subject: 'Restablecer contraseña - Agro-Merge',
                html: `
                    <div style="text-align: center; font-family: sans-serif; border: 1px solid #e2e8f0; padding: 20px; border-radius: 10px;">
                        <h2 style="color: #16a34a;">Recuperación de Acceso</h2>
                        <p>Has solicitado restablecer tu contraseña. Usa el siguiente código de seguridad:</p>
                        <h1 style="background: #f0fdf4; display: inline-block; padding: 10px 20px; border-radius: 8px; color: #166534; letter-spacing: 5px;">
                            ${codigoReset}
                        </h1>
                        <p style="color: #64748b; font-size: 12px; margin-top: 20px;">Si no solicitaste este cambio, puedes ignorar este correo de forma segura.</p>
                    </div>
                `
            };

            // Enviamos el correo
            transporter.sendMail(opcionesCorreo, (mailErr) => {
                if (mailErr) {
                    console.error('Error enviando email:', mailErr);
                    return res.send('Error al enviar el correo. Verifica tu conexión.');
                }

                console.log(' Código de recuperación enviado a:', email);
                // Redirigimos a la pantalla de verificación (Ruta corregida a relativa)
                res.redirect('/pages/Codigo-Contraseña/Codigo-Contraseña.html');
            });
        });
    });
});

// 6. RUTA: ACTUALIZAR CONTRASEÑA (Guardar la nueva clave)
app.post('/update-password', (req, res) => {
    const email = req.body.correo_usuario;
    const nuevaContrasena = req.body.nueva_clave;

    
    const sql = 'UPDATE usuarios SET contrasena = ? WHERE email = ?';

    conexion.query(sql, [nuevaContrasena, email], (error, resultados) => {
        if (error) {
            console.error('Error al actualizar la contraseña:', error);
            return res.send('Hubo un error al guardar tu nueva contraseña.');
        }

        // Limpiamos el código de verificación para que no vuelva a ser usado
        const sqlLimpiarCodigo = 'UPDATE usuarios SET codigo_verificacion = NULL WHERE email = ?';
        conexion.query(sqlLimpiarCodigo, [email]);

        console.log('✅ Contraseña actualizada con éxito para:', email);
        
        
        res.redirect('/pages/Verificacion-Exitosa/Verificacion-Exitosa.html');
    });
});


// =======================================================
// RUTAS PARA EL DASHBOARD DE PERFIL
// =======================================================

// 7. RUTA: OBTENER DATOS DEL USUARIO LOGEADO
app.get('/api/usuario', (req, res) => {
    const email = req.query.email;
    
    const sql = 'SELECT nombre, email, documento, telefono FROM usuarios WHERE email = ?';
    
    conexion.query(sql, [email], (error, resultados) => {
        if (error) {
            console.error('Error obteniendo usuario:', error);
            return res.status(500).json({ error: 'Error del servidor' });
        }
        if (resultados.length > 0) {
            res.json(resultados[0]);
        } else {
            res.status(404).json({ error: 'Usuario no encontrado' });
        }
    });
});

// 8. RUTA: ACTUALIZAR TELÉFONO
app.post('/api/actualizar-telefono', (req, res) => {
    const { email, telefono } = req.body;
    const sql = 'UPDATE usuarios SET telefono = ? WHERE email = ?';
    
    conexion.query(sql, [telefono, email], (error) => {
        if (error) {
            console.error('Error al actualizar teléfono:', error);
            return res.status(500).json({ success: false, mensaje: 'Error al actualizar' });
        }
        res.json({ success: true, mensaje: 'Teléfono guardado correctamente' });
    });
});

app.listen(3000, () => {
    console.log('====================================================');
    console.log(' Servidor corriendo en el puerto 3000');
    console.log('ACCEDE DESDE: http://localhost:3000/Index.html');
    console.log('====================================================');
});