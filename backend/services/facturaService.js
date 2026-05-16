const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');

function formatoCOP(valor) {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        maximumFractionDigits: 0
    }).format(Number(valor) || 0);
}

function extraerTipoVenta(descripcion) {
    if (!descripcion) return 'N/A';
    if (String(descripcion).startsWith('Tipo de venta:')) {
        return String(descripcion).replace('Tipo de venta:', '').trim();
    }
    return String(descripcion);
}

function calcularTotales(items, envio = 0) {
    const subtotal = (items || []).reduce((acc, item) => {
        const cantidad = Number(item.cantidad || 1);
        const precio = Number(item.precio || 0);
        return acc + cantidad * precio;
    }, 0);

    const costoEnvio = Number(envio || 0);
    return { subtotal, total: subtotal + costoEnvio };
}

function normalizarEnvioInfo(envioInfo, cliente) {
    if (!envioInfo || typeof envioInfo !== 'object') {
        return {
            contacto: cliente?.nombre || 'N/A',
            direccion: 'N/A',
            ciudad: 'N/A',
            region: '',
            metodo_envio: 'Estándar'
        };
    }
    return envioInfo;
}

async function generarFacturaPDF({
    factura,
    cliente = {},
    items = [],
    envio = 0,
    envioInfo = {},
    facturacion = {},
    pago = {}
}) {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ size: 'A4', margin: 40 });
            const chunks = [];

            doc.on('data', (chunk) => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);

            const listaItems = Array.isArray(items) ? items : [];
            const { subtotal, total } = calcularTotales(listaItems, envio);
            const infoEnvio = normalizarEnvioInfo(envioInfo, cliente);
            const fecha = new Date().toLocaleString('es-CO');

            doc.fontSize(20).fillColor('#1b5e20').text('AGRO-MERGE');
            doc.moveDown(0.2);
            doc.fontSize(10).fillColor('#444').text('Comprobante de compra / Factura');
            doc.text(`No. ${factura || 'SIN-NUMERO'}`);
            doc.text(`Fecha: ${fecha}`);

            doc.moveDown(0.8);
            doc.fontSize(12).fillColor('#111').text('Datos del cliente', { underline: true });
            doc.moveDown(0.3);
            doc.fontSize(10).fillColor('#333');
            doc.text(`Nombre: ${cliente.nombre || 'N/A'}`);
            doc.text(`Correo: ${cliente.email || 'N/A'}`);

            doc.moveDown(0.6);
            doc.fontSize(12).fillColor('#111').text('Datos de envio', { underline: true });
            doc.moveDown(0.3);
            doc.fontSize(10);
            doc.text(`Contacto: ${infoEnvio.contacto || 'N/A'}`);
            doc.text(`Direccion: ${infoEnvio.direccion || 'N/A'}`);
            doc.text(`Ciudad: ${infoEnvio.ciudad || 'N/A'}${infoEnvio.region ? ' - ' + infoEnvio.region : ''}`);
            doc.text(`Metodo de envio: ${infoEnvio.metodo_envio || 'Estandar'}`);

            doc.moveDown(0.6);
            doc.fontSize(12).fillColor('#111').text('Facturacion y pago', { underline: true });
            doc.moveDown(0.3);
            doc.fontSize(10);
            doc.text(`NIT / CC: ${facturacion.documento || 'N/A'}`);
            doc.text(`Metodo de pago: ${pago.metodo || 'N/A'}`);

            doc.moveDown(1);

            const startX = 40;
            let y = doc.y;

            doc.fontSize(10).fillColor('#fff');
            doc.rect(startX, y, 515, 22).fill('#388e3c');
            doc.fillColor('#fff');
            doc.text('Producto', startX + 8, y + 6);
            doc.text('Cant.', 300, y + 6);
            doc.text('Precio', 360, y + 6);
            doc.text('Total', 460, y + 6);

            y += 24;
            doc.fillColor('#111');

            listaItems.forEach((item) => {
                const cantidad = Number(item.cantidad || 1);
                const precio = Number(item.precio || 0);
                const lineaTotal = cantidad * precio;

                doc.text(String(item.nombre || 'Producto'), startX + 8, y + 6, { width: 240 });
                doc.text(String(cantidad), 300, y + 6);
                doc.text(formatoCOP(precio), 360, y + 6);
                doc.text(formatoCOP(lineaTotal), 460, y + 6);

                y += 22;
                if (y > 700) {
                    doc.addPage();
                    y = 50;
                }
            });

            y += 20;
            doc.fontSize(11).fillColor('#111');
            doc.text(`Subtotal: ${formatoCOP(subtotal)}`, 350, y, { align: 'right' });
            doc.text(`Envio: ${formatoCOP(envio)}`, 350, y + 16, { align: 'right' });
            doc.fontSize(13).fillColor('#1b5e20');
            doc.text(`TOTAL: ${formatoCOP(total)}`, 350, y + 34, { align: 'right' });

            doc.end();
        } catch (error) {
            reject(error);
        }
    });
}

async function generarFacturaExcel({ factura, cliente = {}, items = [], envio = 0 }) {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Factura');
    const listaItems = Array.isArray(items) ? items : [];
    const { subtotal, total } = calcularTotales(listaItems, envio);

    sheet.getCell('A1').value = 'AGRO-MERGE - FACTURA';
    sheet.getCell('A3').value = 'Factura No.';
    sheet.getCell('B3').value = factura;
    sheet.getCell('A6').value = 'Cliente';
    sheet.getCell('B6').value = cliente.nombre || 'N/A';

    let row = 10;
    listaItems.forEach((item) => {
        const cantidad = Number(item.cantidad || 1);
        const precio = Number(item.precio || 0);
        sheet.getRow(row).values = [item.nombre, cantidad, precio, cantidad * precio];
        row++;
    });

    sheet.getCell(`A${row + 1}`).value = 'Subtotal';
    sheet.getCell(`B${row + 1}`).value = subtotal;
    sheet.getCell(`A${row + 2}`).value = 'Envio';
    sheet.getCell(`B${row + 2}`).value = Number(envio || 0);
    sheet.getCell(`A${row + 3}`).value = 'TOTAL';
    sheet.getCell(`B${row + 3}`).value = total;

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
}

module.exports = {
    generarFacturaPDF,
    generarFacturaExcel,
    extraerTipoVenta,
    calcularTotales
};