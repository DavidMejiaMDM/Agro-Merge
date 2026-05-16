document.addEventListener('DOMContentLoaded', () => {
    const pedidoRaw = localStorage.getItem('ultimoPedidoAgro');

    if (!pedidoRaw) {
        document.getElementById('mensaje-confirmacion').textContent =
            'No se encontró información del pedido. Regresa al checkout.';
        return;
    }

    let pedido;
    try {
        pedido = JSON.parse(pedidoRaw);
    } catch {
        alert('Error leyendo datos del pedido.');
        return;
    }

    const totalItems = (pedido.items || []).reduce((acc, i) => acc + Number(i.cantidad || 0), 0);
    document.getElementById('pedido-resumen').textContent = `(${totalItems} productos)`;

    document.getElementById('detalle-factura').textContent =
        `Factura ${pedido.factura} | Pago: ${pedido.pago?.metodo || 'N/A'} | Doc: ${pedido.facturacion?.documento || 'N/A'} | Total: $${Number(pedido.total || 0).toLocaleString('es-CO')}`;

    document.getElementById('btn-ir-inicio').addEventListener('click', () => {
        window.location.href = '../../Index.html';
    });

   document.getElementById('btn-descargar-comprobante').addEventListener('click', async () => {
    try {
        const resp = await fetch('http://localhost:3000/api/factura/pedido/pdf', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                factura: pedido.factura,
                cliente: pedido.cliente,
                items: pedido.items,
                envio: Number(pedido.costoEnvio || pedido.envioInfo?.costo_envio || 7900),
                envioInfo: pedido.envioInfo || {},
                facturacion: pedido.facturacion || {},
                pago: pedido.pago || {},
                subtotal: pedido.subtotal,
                total: pedido.total
            })
        });

        if (!resp.ok) {
            const errText = await resp.text();
            console.error(errText);
            alert('No se pudo generar el comprobante PDF.');
            return;
        }

        const blob = await resp.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${pedido.factura || 'comprobante'}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error(error);
        alert('Error de conexión al generar el PDF.');
    }
});
});