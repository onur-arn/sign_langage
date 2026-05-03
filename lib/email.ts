import nodemailer from 'nodemailer';

function getTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

export async function sendApprovalRequestEmail(newUser: { name: string | null; email: string; id: string }) {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail || !process.env.SMTP_USER) return;
  const transporter = getTransporter();

  const approveUrl = `${process.env.NEXTAUTH_URL}/api/admin/approve?userId=${newUser.id}&action=approve&secret=${process.env.ADMIN_SECRET}`;
  const rejectUrl  = `${process.env.NEXTAUTH_URL}/api/admin/approve?userId=${newUser.id}&action=reject&secret=${process.env.ADMIN_SECRET}`;

  await transporter.sendMail({
    from: `"Sign Language App" <${process.env.SMTP_USER}>`,
    to: adminEmail,
    subject: `Nouvelle demande d'inscription — ${newUser.name || newUser.email}`,
    html: `
      <div style="font-family: sans-serif; max-width: 500px; margin: auto;">
        <h2 style="color: #7c3aed;">Nouvelle demande d'inscription</h2>
        <p><strong>Nom :</strong> ${newUser.name || '—'}</p>
        <p><strong>Email :</strong> ${newUser.email}</p>
        <p><strong>Date :</strong> ${new Date().toLocaleString('fr-FR')}</p>
        <div style="margin-top: 24px; display: flex; gap: 12px;">
          <a href="${approveUrl}" style="background:#16a34a;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">
            ✓ Approuver
          </a>
          &nbsp;&nbsp;
          <a href="${rejectUrl}" style="background:#dc2626;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">
            ✗ Rejeter
          </a>
        </div>
        <p style="margin-top:20px;color:#64748b;font-size:12px;">
          Vous pouvez aussi gérer les demandes depuis <a href="${process.env.NEXTAUTH_URL}/admin">le panneau admin</a>.
        </p>
      </div>
    `,
  });
}

export async function sendStatusEmail(userEmail: string, approved: boolean) {
  if (!process.env.SMTP_USER) return;
  const transporter = getTransporter();

  await transporter.sendMail({
    from: `"Sign Language App" <${process.env.SMTP_USER}>`,
    to: userEmail,
    subject: approved ? 'Votre compte a été approuvé' : 'Votre demande a été refusée',
    html: approved
      ? `<p>Bonjour,<br><br>Votre compte a été <strong style="color:#16a34a">approuvé</strong>. Vous pouvez maintenant vous connecter.<br><br>
         <a href="${process.env.NEXTAUTH_URL}/login" style="background:#7c3aed;color:white;padding:10px 20px;border-radius:8px;text-decoration:none;">Se connecter</a></p>`
      : `<p>Bonjour,<br><br>Votre demande d'inscription a été <strong style="color:#dc2626">refusée</strong>.<br>
         Contactez l'administrateur pour plus d'informations.</p>`,
  });
}
