const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path');
const nodemailer = require('nodemailer');
const fs = require('fs');
const multer = require('multer');

function normalizarEmail(email) {
    return (email || '').trim().toLowerCase();
}

// ==============================
// Configuración correo (Gmail)
// ==============================
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'agromerge@gmail.com',
        pass: 'codr ubjv pjvg sbxy'
    }
});

const app = express();

// ==============================
// Middlewares
// ==============================
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Evita warning de Chrome DevTools (antes del static)
app.get('/.well-known/appspecific/com.chrome.devtools.json', (req, res) => {
    res.status(204).end();
});

// Servir frontend
app.use(express.static(path.join(__dirname, '../Interfaz')));

// ==============================
// Multer / Uploads
// ==============================
const uploadsDir = path.join(__dirname, 'uploads', 'productos');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadsDir),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname || '').toLowerCase();
        const allowedExt = ['.jpg', '.jpeg', '.png', '.webp'];
        const safeExt = allowedExt.includes(ext) ? ext : '.jpg';
        cb(null, `prod_${Date.now()}_${Math.floor(Math.random() * 1e6)}${safeExt}`);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) return cb(null, true);
    cb(new Error('Formato de imagen no permitido. Usa JPG, JPEG, PNG o WEBP.'));
};

const uploadProducto = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }
});

// ==============================
// Conexión MySQL
// ==============================
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
        console.log('¡Conectado exitosamente a MySQL!');
    }
});

// Asegurar columna rol compatible con tu SQL (incluye admin)
const asegurarColumnaRol = () => {
    const sql = `
        ALTER TABLE usuarios
        ADD COLUMN rol ENUM('comprador','vendedor','empresa','admin') NOT NULL DEFAULT 'comprador'
    `;
    conexion.query(sql, (err) => {
        if (err) {
            if (err.code === 'ER_DUP_FIELDNAME') {
                console.log('Columna "rol" ya existe.');
            } else {
                console.warn('No se pudo verificar/crear columna rol:', err.message);
            }
        } else {
            console.log('Columna "rol" creada correctamente.');
        }
    });
};

asegurarColumnaRol();

// ==============================
// 1) REGISTRO (CORREGIDO)
// ==============================
app.post('/registro', (req, res) => {
    const nombre = req.body.nombre_usuario?.trim();
    const email = req.body.correo_usuario?.trim().toLowerCase();
    const contrasena = req.body.clave_usuario;
    const rol = req.body.rol_usuario?.trim().toLowerCase() || 'comprador';

    const documento = req.body.documento_usuario?.trim() || null;
    const telefono = req.body.telefono_usuario?.trim() || null;

    const codigoVerificacion = Math.floor(1000 + Math.random() * 9000);
    const rolesPermitidos = ['comprador', 'vendedor', 'empresa', 'admin'];

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

    const sqlUsuario = `
        INSERT INTO usuarios
        (nombre, email, contrasena, documento, telefono, rol, estado, codigo_verificacion)
        VALUES (?, ?, ?, ?, ?, ?, 'inactivo', ?)
    `;

    conexion.query(
        sqlUsuario,
        [nombre, email, contrasena, documento, telefono, rol, codigoVerificacion],
        (error, resultadoUsuario) => {
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

            const idUsuario = resultadoUsuario.insertId;

            const enviarCorreoYResponder = () => {
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

                transporter.sendMail(opcionesCorreo, (errMail) => {
                    if (errMail) {
                        console.error('Error de Nodemailer (registro):', errMail);
                    }

                    return res.status(201).json({
                        ok: true,
                        mensaje: 'Registro exitoso. Revisa tu correo para verificar tu cuenta.',
                        rol_usuario: rol
                    });
                });
            };

            // Crear perfil vendedor automáticamente
            if (rol === 'vendedor' || rol === 'empresa') {
                const sqlVendedor = `
                    INSERT INTO vendedores (id_usuario, nombre_tienda, descripcion, telefono)
                    VALUES (?, ?, ?, ?)
                `;
                const nombreTienda = `Tienda de ${nombre}`;
                const descripcionTienda = null;

                conexion.query(
                    sqlVendedor,
                    [idUsuario, nombreTienda, descripcionTienda, telefono],
                    (errorVendedor) => {
                        if (errorVendedor) {
                            console.error('Error creando perfil vendedor:', errorVendedor);
                            return conexion.query('DELETE FROM usuarios WHERE id_usuario = ?', [idUsuario], () => {
                                return res.status(500).json({
                                    ok: false,
                                    mensaje: 'No se pudo crear el perfil de vendedor. Intenta de nuevo.'
                                });
                            });
                        }

                        return enviarCorreoYResponder();
                    }
                );
            } else {
                return enviarCorreoYResponder();
            }
        }
    );
});

// ==============================
// 2) LOGIN
// ==============================
app.post('/login', (req, res) => {
    const email = normalizarEmail(req.body.correo_usuario);
    const contrasena = req.body.clave_usuario;

    const sql = `
        SELECT id_usuario, nombre, email, contrasena, estado, rol
        FROM usuarios
        WHERE email = ? AND contrasena = ?
    `;

    conexion.query(sql, [email, contrasena], (error, resultados) => {
        if (error) {
            console.error('Error en login:', error);
            return res.status(500).json({ ok: false, mensaje: 'Error en servidor.' });
        }

        if (!resultados.length) {
            return res.status(401).json({ ok: false, mensaje: 'Correo o contraseña incorrectos.' });
        }

        const usuario = resultados[0];

        if (usuario.estado === 'inactivo') {
            return res.status(403).json({
                ok: false,
                mensaje: 'Debes verificar tu código de 4 dígitos.',
                requiere_verificacion: true,
                correo_usuario: usuario.email
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

// ==============================
// 3) VERIFICAR CÓDIGO ACTIVACIÓN
// ==============================
app.post('/verificar-codigo', (req, res) => {
    const { d1, d2, d3, d4, correo_usuario } = req.body;
    const codigoIngresado = `${d1 || ''}${d2 || ''}${d3 || ''}${d4 || ''}`.trim();
    const emailNormalizado = normalizarEmail(correo_usuario);

    if (!emailNormalizado || codigoIngresado.length !== 4) {
        return res.status(400).send(`
            <h1>Datos incompletos</h1>
            <p>Debes ingresar correo y código de 4 dígitos.</p>
            <a href="javascript:history.back()">Intentar de nuevo</a>
        `);
    }

    const sql = `
        SELECT email, codigo_verificacion, rol
        FROM usuarios
        WHERE email = ? AND codigo_verificacion = ?
    `;

    conexion.query(sql, [emailNormalizado, codigoIngresado], (error, resultados) => {
        if (error) {
            console.error('Error en verificación:', error);
            return res.status(500).send('Error en base de datos.');
        }

        if (!resultados.length) {
            return res.status(400).send(`
                <h1>Código incorrecto</h1>
                <p>El código no coincide para ${emailNormalizado}.</p>
                <a href="/pages/Confirmar-codigo/confirmar-codigo.html?email=${encodeURIComponent(emailNormalizado)}">Intentar de nuevo</a>
            `);
        }

        const usuario = resultados[0];
        const emailActivo = normalizarEmail(usuario.email);
        const updateSql = 'UPDATE usuarios SET estado = "activo" WHERE email = ?';

        conexion.query(updateSql, [emailActivo], (err) => {
            if (err) return res.status(500).send('No se pudo activar la cuenta.');

            const emailParam = encodeURIComponent(emailActivo);

            res.setHeader(
                'Set-Cookie',
                `agro_email=${emailParam}; Path=/; Max-Age=86400; SameSite=Lax`
            );

            if (usuario.rol === 'vendedor' || usuario.rol === 'empresa') {
                return res.redirect(
                    `/pages/Correo-verificado-vendedor/correo.verificado-vendedor.html?email=${emailParam}`
                );
            }

            return res.redirect(
                `/pages/Correo-verificado/correo.verificado.html?email=${emailParam}`
            );
        });
    });
});

// ==============================
// 4) VERIFY RESET CODE
// ==============================
app.post('/verificar-codigo-reset', (req, res) => {
    const { d1, d2, d3, d4, correo_usuario } = req.body;
    const codigoIngresado = `${d1}${d2}${d3}${d4}`;

    const sql = 'SELECT * FROM usuarios WHERE email = ? AND codigo_verificacion = ?';
    conexion.query(sql, [correo_usuario, codigoIngresado], (error, resultados) => {
        if (error) return res.send('Error en la base de datos.');
        if (resultados.length > 0) {
            res.redirect('/pages/Actualizar-Contraseña/Actualizar-Contraseña.html');
        } else {
            res.send(`
                <h1>Código incorrecto</h1>
                <p>El código ingresado no coincide.</p>
                <a href="javascript:history.back()">Intentar de nuevo</a>
            `);
        }
    });
});

// ==============================
// 5) RECOVER PASSWORD
// ==============================
app.post('/recover-password', (req, res) => {
    const email = req.body.correo_usuario?.trim().toLowerCase();
    const codigoReset = Math.floor(1000 + Math.random() * 9000);

    const sqlCheck = 'SELECT * FROM usuarios WHERE email = ?';
    conexion.query(sqlCheck, [email], (error, resultados) => {
        if (error) return res.send('Error en el servidor.');
        if (!resultados.length) {
            return res.send('<h1>Error</h1><p>Correo no registrado.</p><a href="javascript:history.back()">Volver</a>');
        }

        const sqlUpdate = 'UPDATE usuarios SET codigo_verificacion = ? WHERE email = ?';
        conexion.query(sqlUpdate, [codigoReset, email], (err) => {
            if (err) return res.send('Error al generar código.');

            const opcionesCorreo = {
                from: '"Agro-Merge 🌿" <agromerge@gmail.com>',
                to: email,
                subject: 'Restablecer contraseña - Agro-Merge',
                html: `
                    <div style="text-align: center; font-family: sans-serif;">
                        <h2>Recuperación de Acceso</h2>
                        <p>Tu código de seguridad es:</p>
                        <h1>${codigoReset}</h1>
                    </div>
                `
            };

            transporter.sendMail(opcionesCorreo, (mailErr) => {
                if (mailErr) return res.send('Error al enviar correo.');
                res.redirect('/pages/Codigo-Contraseña/Codigo-Contraseña.html');
            });
        });
    });
});

// ==============================
// 6) UPDATE PASSWORD
// ==============================
app.post('/update-password', (req, res) => {
    const email = req.body.correo_usuario?.trim().toLowerCase();
    const nuevaContrasena = req.body.nueva_clave;

    const sql = 'UPDATE usuarios SET contrasena = ? WHERE email = ?';
    conexion.query(sql, [nuevaContrasena, email], (error) => {
        if (error) return res.send('Error al actualizar contraseña.');

        const sqlLimpiarCodigo = 'UPDATE usuarios SET codigo_verificacion = NULL WHERE email = ?';
        conexion.query(sqlLimpiarCodigo, [email]);

        res.redirect('/pages/Verificacion-Exitosa/Verificacion-Exitosa.html');
    });
});

// ==============================
// 7) PERFIL USUARIO
// ==============================
app.get('/api/usuario', (req, res) => {
    const email = req.query.email;
    const sql = 'SELECT nombre, email, documento, telefono, rol FROM usuarios WHERE email = ?';

    conexion.query(sql, [email], (error, resultados) => {
        if (error) return res.status(500).json({ error: 'Error del servidor' });
        if (resultados.length > 0) return res.json(resultados[0]);
        return res.status(404).json({ error: 'Usuario no encontrado' });
    });
});

app.post('/api/actualizar-telefono', (req, res) => {
    const { email, telefono } = req.body;
    const sql = 'UPDATE usuarios SET telefono = ? WHERE email = ?';

    conexion.query(sql, [telefono, email], (error) => {
        if (error) return res.status(500).json({ success: false, mensaje: 'Error al actualizar' });
        res.json({ success: true, mensaje: 'Teléfono guardado correctamente' });
    });
});

app.post('/api/cambiar-password', (req, res) => {
    const { email, claveActual, claveNueva } = req.body;

    const sqlCheck = 'SELECT contrasena FROM usuarios WHERE email = ?';
    conexion.query(sqlCheck, [email], (err, resultados) => {
        if (err) return res.status(500).json({ error: 'Error en base de datos' });
        if (!resultados.length) return res.status(404).json({ error: 'Usuario no encontrado' });
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

app.post('/api/actualizar-direccion', (req, res) => {
    const { email, direccion } = req.body;
    const sql = 'UPDATE usuarios SET direccion = ? WHERE email = ?';

    conexion.query(sql, [direccion, email], (err) => {
        if (err) return res.status(500).json({ error: 'Error al guardar dirección' });
        res.json({ mensaje: 'Dirección guardada con éxito', direccion });
    });
});

// ==============================
// 8) PRODUCTOS (ADAPTADO A TU SQL)
// ==============================
app.post('/api/productos/agregar', uploadProducto.single('imagen_producto'), (req, res) => {
    try {
        const nombre = req.body.nombre?.trim();
        const precio = req.body.precio?.trim();
        const tipo_venta = req.body.tipo_venta?.trim();
        const email_usuario = req.body.email_usuario?.trim().toLowerCase();

        if (!nombre || !precio || !email_usuario) {
            return res.status(400).json({ ok: false, mensaje: 'Faltan campos obligatorios.' });
        }

        if (!req.file) {
            return res.status(400).json({ ok: false, mensaje: 'La imagen es obligatoria.' });
        }

        const precioNum = Number(precio);
        if (Number.isNaN(precioNum) || precioNum <= 0) {
            return res.status(400).json({ ok: false, mensaje: 'Precio inválido.' });
        }

        const sqlUsuario = `SELECT id_usuario FROM usuarios WHERE email = ? LIMIT 1`;
        conexion.query(sqlUsuario, [email_usuario], (errUser, rowsUser) => {
            if (errUser) {
                console.error('Error buscando usuario:', errUser);
                return res.status(500).json({ ok: false, mensaje: 'Error buscando usuario.' });
            }

            if (!rowsUser.length) {
                return res.status(404).json({ ok: false, mensaje: 'Usuario no encontrado.' });
            }

            const idUsuario = rowsUser[0].id_usuario;

            const sqlVendedor = `SELECT id_vendedor FROM vendedores WHERE id_usuario = ? LIMIT 1`;
            conexion.query(sqlVendedor, [idUsuario], (errVend, rowsVend) => {
                if (errVend) {
                    console.error('Error buscando vendedor:', errVend);
                    return res.status(500).json({ ok: false, mensaje: 'Error buscando perfil vendedor.' });
                }

                if (!rowsVend.length) {
                    return res.status(400).json({
                        ok: false,
                        mensaje: 'Este usuario no tiene perfil en tabla vendedores.'
                    });
                }

                const idVendedor = rowsVend[0].id_vendedor;
                const imagen = `/uploads/productos/${req.file.filename}`;
                const descripcion = tipo_venta ? `Tipo de venta: ${tipo_venta}` : null;

                const sqlInsert = `
                    INSERT INTO productos
                    (id_vendedor, id_categoria, nombre, descripcion, precio, stock, imagen, estado, fecha_publicacion)
                    VALUES (?, NULL, ?, ?, ?, 0, ?, 'borrador', NOW())
                `;

                conexion.query(sqlInsert, [idVendedor, nombre, descripcion, precioNum, imagen], (errIns, result) => {
                    if (errIns) {
                        console.error('Error guardando producto:', errIns);
                        return res.status(500).json({
                            ok: false,
                            mensaje: 'Error al guardar producto.',
                            detalle: errIns.sqlMessage || errIns.message
                        });
                    }

                    return res.status(201).json({
                        ok: true,
                        mensaje: 'Producto guardado exitosamente.',
                        producto: {
                            id_producto: result.insertId,
                            id_vendedor: idVendedor,
                            nombre,
                            precio: precioNum,
                            tipo_venta: tipo_venta || '',
                            imagen
                        }
                    });
                });
            });
        });
    } catch (error) {
        console.error('Error en /api/productos/agregar:', error);
        return res.status(500).json({ ok: false, mensaje: 'Error interno del servidor.' });
    }
});

app.get('/api/productos', (req, res) => {
    const email = req.query.email?.trim().toLowerCase();
    if (!email) return res.status(400).json({ ok: false, mensaje: 'Email requerido.' });

    const sql = `
        SELECT
            p.id_producto AS id,
            p.nombre,
            p.precio,
            p.imagen AS imagen_url,
            p.descripcion,
            p.fecha_creacion
        FROM productos p
        INNER JOIN vendedores v ON v.id_vendedor = p.id_vendedor
        INNER JOIN usuarios u ON u.id_usuario = v.id_usuario
        WHERE u.email = ?
        ORDER BY p.id_producto DESC
    `;

    conexion.query(sql, [email], (err, rows) => {
        if (err) {
            console.error('Error listando productos:', err);
            return res.status(500).json({ ok: false, mensaje: 'Error al listar productos.' });
        }

        const productos = rows.map((r) => {
            let tipo_venta = '';
            if (r.descripcion && r.descripcion.startsWith('Tipo de venta:')) {
                tipo_venta = r.descripcion.replace('Tipo de venta:', '').trim();
            }
            return { ...r, tipo_venta };
        });

        return res.json({ ok: true, productos });
    });
});

// Manejo global de errores multer
app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        return res.status(400).json({ ok: false, mensaje: `Error de archivo: ${err.message}` });
    }
    if (err) {
        console.error('Error global:', err);
        return res.status(500).json({ ok: false, mensaje: err.message || 'Error interno' });
    }
    next();
});

// ==============================
// Iniciar servidor
// ==============================
app.listen(3000, () => {
    console.log('====================================================');
    console.log('Servidor corriendo en el puerto 3000');
    console.log('ACCEDE DESDE: http://localhost:3000/Index.html');
    console.log('====================================================');
});