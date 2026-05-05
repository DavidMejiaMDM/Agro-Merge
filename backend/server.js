const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path');
const nodemailer = require('nodemailer');

// Configuración del mensajero (Gmail)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'agromerge@gmail.com',
        pass: 'codr ubjv pjvg sbxy'
    }
});

const app = express();

// Configuraciones para entender los datos del frontend
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Servir HTML, CSS y JS desde Interfaz
app.use(express.static(path.join(__dirname, '../Interfaz')));

// Opcional: evita warning de Chrome DevTools en consola
app.get('/.well-known/appspecific/com.chrome.devtools.json', (req, res) => {
    res.status(204).end();
});

// Conexión a MySQL
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

// (Opcional recomendado) Crear columna rol si no existe
const asegurarColumnaRol = () => {
    const sql = `
        ALTER TABLE usuarios
        ADD COLUMN rol ENUM('comprador','vendedor','empresa') NOT NULL DEFAULT 'comprador'
    `;
    conexion.query(sql, (err) => {
        if (err) {
            if (err.code === 'ER_DUP_FIELDNAME') {
                console.log('DESARROLLADOR MARCOS DAVID M.');
            } else {
                console.warn('No se pudo verificar/crear la columna rol:', err.message);
            }
        } else {
            console.log('Columna "rol" creada correctamente.');
        }
    });
};

asegurarColumnaRol();


// =======================================================
// 1) RUTA: REGISTRO (CON ROLES)
// =======================================================
app.post('/registro', (req, res) => {
    const nombre = req.body.nombre_usuario?.trim();
    const email = req.body.correo_usuario?.trim().toLowerCase();
    const contrasena = req.body.clave_usuario;
    const rol = req.body.rol_usuario?.trim().toLowerCase() || 'comprador';

    const documento = req.body.documento_usuario?.trim() || null;
    const telefono = req.body.telefono_usuario?.trim() || null;

    const codigoVerificacion = Math.floor(1000 + Math.random() * 9000);
    const rolesPermitidos = ['comprador', 'vendedor', 'empresa'];

    if (!nombre || !email || !contrasena) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Faltan campos obligatorios (nombre, correo o contraseña).'
        });
    }

    if (!rolesPermitidos.includes(rol)) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Rol inválido.'
        });
    }

    const sql = `
        INSERT INTO usuarios
        (nombre, email, contrasena, documento, telefono, rol, estado, codigo_verificacion)
        VALUES (?, ?, ?, ?, ?, ?, 'inactivo', ?)
    `;

    conexion.query(sql, [nombre, email, contrasena, documento, telefono, rol, codigoVerificacion], (error) => {
        if (error) {
            console.error('Error en MySQL (registro):', error);

            if (error.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({
                    ok: false,
                    mensaje: 'Este correo ya está registrado.'
                });
            }

            return res.status(500).json({
                ok: false,
                mensaje: 'Error al registrar en la base de datos.'
            });
        }

        const opcionesCorreo = {
            from: '"Agro-Merge 🌿" <agromerge@gmail.com>',
            to: email,
            subject: 'Tu código de verificación - Agro-Merge',
            html: `
                <div style="text-align: center; font-family: sans-serif;">
                    <h2>¡Hola ${nombre}!</h2>
                    <p>Tu cuenta está casi lista. Usa el siguiente código para activarla:</p>
                    <h1 style="color: #16a34a;">${codigoVerificacion}</h1>
                </div>
            `
        };

        transporter.sendMail(opcionesCorreo, (err) => {
            if (err) {
                console.error('Error de Nodemailer (registro):', err);
            }

            return res.status(201).json({
                ok: true,
                mensaje: 'Registro exitoso. Revisa tu correo para verificar tu cuenta.',
                rol_usuario: rol
            });
        });
    });
});


// =======================================================
// 2) RUTA: LOGIN (RESPUESTA JSON CON ROL)
// =======================================================
app.post('/login', (req, res) => {
    const email = req.body.correo_usuario?.trim().toLowerCase();
    const contrasena = req.body.clave_usuario;

    const sql = `
        SELECT id, nombre, email, contrasena, estado, rol
        FROM usuarios
        WHERE email = ? AND contrasena = ?
    `;

    conexion.query(sql, [email, contrasena], (error, resultados) => {
        if (error) {
            console.error('Error en el login:', error);
            return res.status(500).json({
                ok: false,
                mensaje: 'Hubo un error al procesar tu solicitud.'
            });
        }

        if (resultados.length === 0) {
            return res.status(401).json({
                ok: false,
                mensaje: 'Correo o contraseña incorrectos.'
            });
        }

        const usuario = resultados[0];

        if (usuario.estado === 'inactivo') {
            return res.status(403).json({
                ok: false,
                mensaje: 'Debes verificar tu código de 4 dígitos.',
                requiere_verificacion: true
            });
        }

        return res.json({
            ok: true,
            mensaje: 'Login exitoso',
            usuario: {
                nombre: usuario.nombre,
                email: usuario.email,
                rol: usuario.rol || 'comprador'
            }
        });
    });
});


// =======================================================
// 3) RUTA: VERIFICAR CÓDIGO (ACTIVACIÓN + REDIRECCIÓN POR ROL)
// =======================================================
app.post('/verificar-codigo', (req, res) => {
    const { d1, d2, d3, d4, correo_usuario } = req.body;
    const codigoIngresado = `${d1}${d2}${d3}${d4}`;

    const sql = `
        SELECT email, codigo_verificacion, rol
        FROM usuarios
        WHERE email = ? AND codigo_verificacion = ?
    `;

    conexion.query(sql, [correo_usuario, codigoIngresado], (error, resultados) => {
        if (error) {
            console.error('Error en verificación de código:', error);
            return res.status(500).send('Error en la base de datos.');
        }

        if (resultados.length === 0) {
            return res.status(400).send(`
                <h1>Código incorrecto</h1>
                <p>El código ingresado no coincide para el correo ${correo_usuario}.</p>
                <a href="javascript:history.back()">Intentar de nuevo</a>
            `);
        }

        const usuario = resultados[0];

        // Activar cuenta
        const updateSql = 'UPDATE usuarios SET estado = "activo" WHERE email = ?';
        conexion.query(updateSql, [correo_usuario], (err) => {
            if (err) {
                console.error('Error activando usuario:', err);
                return res.status(500).send('No se pudo activar la cuenta.');
            }

            // vendedor y empresa: ruta exacta que pediste
            if (usuario.rol === 'vendedor' || usuario.rol === 'empresa') {
                return res.sendFile(
                    path.join(__dirname, '../Interfaz/pages/Correo-verificado-vendedor/correo.verificado-vendedor.html')
                );
            }

            // comprador
            return res.sendFile(
                path.join(__dirname, '../Interfaz/pages/Correo-verificado/correo.verificado.html')
            );
        });
    });
});

// =======================================================
// 4) RUTA: VERIFICAR CÓDIGO (SOLO PARA RESET CONTRASEÑA)
// =======================================================
app.post('/verificar-codigo-reset', (req, res) => {
    const { d1, d2, d3, d4, correo_usuario } = req.body;
    const codigoIngresado = `${d1}${d2}${d3}${d4}`;

    const sql = 'SELECT * FROM usuarios WHERE email = ? AND codigo_verificacion = ?';

    conexion.query(sql, [correo_usuario, codigoIngresado], (error, resultados) => {
        if (error) {
            console.error('Error en base de datos:', error);
            return res.send('Error en la base de datos al verificar código.');
        }

        if (resultados.length > 0) {
            res.redirect('/pages/Actualizar-Contraseña/Actualizar-Contraseña.html');
        } else {
            res.send(`
                <h1>Código incorrecto</h1>
                <p>El código ingresado no coincide con el enviado a tu correo.</p>
                <a href="javascript:history.back()">Intentar de nuevo</a>
            `);
        }
    });
});


// =======================================================
// 5) RUTA: RECUPERAR CONTRASEÑA (SOLICITAR CÓDIGO)
// =======================================================
app.post('/recover-password', (req, res) => {
    const email = req.body.correo_usuario?.trim().toLowerCase();
    const codigoReset = Math.floor(1000 + Math.random() * 9000);

    const sqlCheck = 'SELECT * FROM usuarios WHERE email = ?';

    conexion.query(sqlCheck, [email], (error, resultados) => {
        if (error) {
            console.error('Error al buscar usuario:', error);
            return res.send('Error en el servidor.');
        }

        if (resultados.length === 0) {
            return res.send('<h1>Error</h1><p>Este correo no está registrado en Agro-Merge.</p><a href="javascript:history.back()">Volver</a>');
        }

        const sqlUpdate = 'UPDATE usuarios SET codigo_verificacion = ? WHERE email = ?';
        conexion.query(sqlUpdate, [codigoReset, email], (err) => {
            if (err) {
                console.error('Error al actualizar código:', err);
                return res.send('Error al generar el código de seguridad.');
            }

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

            transporter.sendMail(opcionesCorreo, (mailErr) => {
                if (mailErr) {
                    console.error('Error enviando email:', mailErr);
                    return res.send('Error al enviar el correo. Verifica tu conexión.');
                }

                console.log('Código de recuperación enviado a:', email);
                res.redirect('/pages/Codigo-Contraseña/Codigo-Contraseña.html');
            });
        });
    });
});


// =======================================================
// 6) RUTA: ACTUALIZAR CONTRASEÑA
// =======================================================
app.post('/update-password', (req, res) => {
    const email = req.body.correo_usuario?.trim().toLowerCase();
    const nuevaContrasena = req.body.nueva_clave;

    const sql = 'UPDATE usuarios SET contrasena = ? WHERE email = ?';

    conexion.query(sql, [nuevaContrasena, email], (error) => {
        if (error) {
            console.error('Error al actualizar la contraseña:', error);
            return res.send('Hubo un error al guardar tu nueva contraseña.');
        }

        const sqlLimpiarCodigo = 'UPDATE usuarios SET codigo_verificacion = NULL WHERE email = ?';
        conexion.query(sqlLimpiarCodigo, [email]);

        console.log('✅ Contraseña actualizada con éxito para:', email);
        res.redirect('/pages/Verificacion-Exitosa/Verificacion-Exitosa.html');
    });
});


// =======================================================
// RUTAS DASHBOARD / PERFIL
// =======================================================

// 7) OBTENER DATOS DEL USUARIO LOGEADO
app.get('/api/usuario', (req, res) => {
    const email = req.query.email;

    const sql = 'SELECT nombre, email, documento, telefono, rol FROM usuarios WHERE email = ?';

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

// 8) ACTUALIZAR TELÉFONO
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

// 9) CAMBIAR CONTRASEÑA DESDE DASHBOARD
app.post('/api/cambiar-password', (req, res) => {
    const { email, claveActual, claveNueva } = req.body;

    const sqlCheck = 'SELECT contrasena FROM usuarios WHERE email = ?';
    conexion.query(sqlCheck, [email], (err, resultados) => {
        if (err) return res.status(500).json({ error: 'Error en la base de datos' });

        if (resultados.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' });

        if (resultados[0].contrasena !== claveActual) {
            return res.status(401).json({ error: 'La contraseña actual es incorrecta' });
        }

        const sqlUpdate = 'UPDATE usuarios SET contrasena = ? WHERE email = ?';
        conexion.query(sqlUpdate, [claveNueva, email], (err2) => {
            if (err2) return res.status(500).json({ error: 'Error al actualizar la contraseña' });
            res.json({ mensaje: 'Contraseña actualizada con éxito' });
        });
    });
});

// 10) ACTUALIZAR DIRECCIÓN
app.post('/api/actualizar-direccion', (req, res) => {
    const { email, direccion } = req.body;

    const sql = 'UPDATE usuarios SET direccion = ? WHERE email = ?';
    conexion.query(sql, [direccion, email], (err) => {
        if (err) {
            console.error('Error actualizando dirección:', err);
            return res.status(500).json({ error: 'Error al guardar la dirección' });
        }
        res.json({ mensaje: 'Dirección guardada con éxito', direccion: direccion });
    });
});


// =======================================================
// INICIAR SERVIDOR
// =======================================================
app.listen(3000, () => {
    console.log('====================================================');
    console.log('Servidor corriendo en el puerto 3000');
    console.log('ACCEDE DESDE: http://localhost:3000/Index.html');
    console.log('====================================================');
});