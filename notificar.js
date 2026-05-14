// api/notificar.js
// Recibe notificación de pago y envía email al dueño

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });

  const { plan, nombre, email, telefono } = req.body;

  if (!plan) return res.status(400).json({ error: 'Faltan datos' });

  const planLabels = {
    basic:   'Plan Básico — $16.000 COP',
    senior:  'Plan Senior — $24.000 COP',
    premium: 'Plan Premium — $30.000 COP'
  };

  const planLinks = {
    basic:   `${process.env.NEXT_PUBLIC_BASE_URL || 'https://flyn-omega.vercel.app'}/entrega-basico.html`,
    senior:  `${process.env.NEXT_PUBLIC_BASE_URL || 'https://flyn-omega.vercel.app'}/entrega-senior.html`,
    premium: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://flyn-omega.vercel.app'}/entrega-premium.html`
  };

  const planLabel = planLabels[plan] || plan;
  const deliveryLink = planLinks[plan] || '';

  // Enviar email via EmailJS API o Resend
  try {
    const emailRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: 'FLYN Ventas <notificaciones@flyn.com>',
        to: ['isaacramos2289@gmail.com'],
        subject: `🔔 NUEVA VENTA FLYN — ${planLabel}`,
        html: `
          <div style="font-family:monospace;background:#03070a;color:#d5eaf6;padding:32px;border-radius:8px;max-width:500px;">
            <h1 style="color:#00dfc8;font-size:28px;letter-spacing:4px;margin-bottom:8px;">FLYN</h1>
            <p style="color:#2e5068;font-size:11px;letter-spacing:2px;margin-bottom:24px;">NUEVA VENTA CONFIRMADA</p>
            
            <div style="background:#0a1820;border:1px solid #1c3348;border-radius:4px;padding:20px;margin-bottom:20px;">
              <p style="color:#7fa8bf;font-size:11px;letter-spacing:2px;margin-bottom:8px;">PLAN COMPRADO</p>
              <p style="color:#00dfc8;font-size:18px;font-weight:bold;">${planLabel}</p>
            </div>

            <div style="background:#0a1820;border:1px solid #1c3348;border-radius:4px;padding:20px;margin-bottom:20px;">
              <p style="color:#7fa8bf;font-size:11px;letter-spacing:2px;margin-bottom:12px;">DATOS DEL COMPRADOR</p>
              <p style="color:#d5eaf6;margin-bottom:6px;"><strong>Nombre:</strong> ${nombre || 'No especificado'}</p>
              <p style="color:#d5eaf6;margin-bottom:6px;"><strong>Email:</strong> ${email || 'No especificado'}</p>
              <p style="color:#d5eaf6;"><strong>Teléfono:</strong> ${telefono || 'No especificado'}</p>
            </div>

            <div style="background:#0f2030;border:1px solid rgba(0,223,200,0.3);border-radius:4px;padding:20px;margin-bottom:20px;">
              <p style="color:#7fa8bf;font-size:11px;letter-spacing:2px;margin-bottom:8px;">LINK DE ENTREGA — ENVIÁ ESTE LINK AL CLIENTE</p>
              <p style="color:#00dfc8;word-break:break-all;">${deliveryLink}</p>
            </div>

            <div style="background:#0a1820;border:1px solid #1c3348;border-radius:4px;padding:16px;">
              <p style="color:#7fa8bf;font-size:10px;letter-spacing:1px;">ACCIÓN REQUERIDA: Enviá el link de entrega al cliente por WhatsApp en menos de 30 minutos.</p>
            </div>
          </div>
        `
      })
    });

    if (emailRes.ok) {
      return res.status(200).json({ success: true, message: 'Notificación enviada' });
    } else {
      const err = await emailRes.json();
      console.error('Email error:', err);
      return res.status(500).json({ error: 'Error enviando email', detail: err });
    }

  } catch (err) {
    console.error('Error:', err);
    return res.status(500).json({ error: err.message });
  }
}
