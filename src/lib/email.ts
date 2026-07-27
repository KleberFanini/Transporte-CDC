import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT) || 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

export async function sendPasswordResetEmail(email: string, resetToken: string) {
    console.log('📧 [EMAIL] Iniciando envio de email...');
    console.log(`📧 [EMAIL] Para: ${email}`);
    console.log(`📧 [EMAIL] Token: ${resetToken.substring(0, 20)}...`);

    const resetLink = `${process.env.NEXTAUTH_URL}/auth/redefinir-senha?token=${resetToken}`;
    console.log(`📧 [EMAIL] Link: ${resetLink}`);

    const mailOptions = {
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to: email,
        subject: 'Redefinição de Senha - CDC Transporte',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #5D2A1A;">Redefinição de Senha</h2>
                <p>Recebemos uma solicitação para redefinir sua senha no <strong>CDC Transporte</strong>.</p>
                <p>Clique no botão abaixo para criar uma nova senha:</p>
                <p style="text-align: center; margin: 30px 0;">
                    <a href="${resetLink}" 
                       style="background-color: #5D2A1A; 
                              color: white; 
                              padding: 12px 24px; 
                              text-decoration: none; 
                              border-radius: 5px;
                              display: inline-block;">
                        Redefinir Senha
                    </a>
                </p>
                <p>Se você não solicitou, ignore este email.</p>
                <p><small>Este link expira em <strong>1 hora</strong>.</small></p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
                <p style="color: #999; font-size: 12px;">
                    CDC Transporte - Sistema de Gestão de Mobilidade
                </p>
            </div>
        `,
    };

    try {
        console.log('📧 [EMAIL] Enviando...');
        const info = await transporter.sendMail(mailOptions);
        console.log('✅ [EMAIL] Email enviado com sucesso!');
        console.log(`📧 [EMAIL] Message ID: ${info.messageId}`);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('❌ [EMAIL] Erro ao enviar:', error);
        throw new Error('Erro ao enviar email de recuperação');
    }
}