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

export async function sendWelcomeEmail(email: string, nome: string, resetToken: string) {
    console.log(`📧 [EMAIL] Enviando email de boas-vindas para ${email}...`);

    const resetLink = `${process.env.NEXTAUTH_URL}/auth/redefinir-senha?token=${resetToken}`;

    const mailOptions = {
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to: email,
        subject: 'Bem-vindo ao CDC Transporte - Defina sua senha',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="text-align: center; padding: 20px 0;">
                    <img src="${process.env.NEXTAUTH_URL}/logo-transporte.png" alt="CDC Transporte" style="max-width: 150px;" />
                </div>
                
                <h2 style="color: #5D2A1A;">Olá, ${nome}! 👋</h2>
                
                <p>Sua conta no <strong>CDC Transporte</strong> foi criada com sucesso!</p>
                
                <p>Para começar a usar o sistema, você precisa definir sua senha.</p>
                
                <p>Clique no botão abaixo para criar sua senha:</p>
                
                <p style="text-align: center; margin: 30px 0;">
                    <a href="${resetLink}" 
                       style="background-color: #5D2A1A; 
                              color: white; 
                              padding: 14px 28px; 
                              text-decoration: none; 
                              border-radius: 5px;
                              display: inline-block;
                              font-size: 16px;">
                        🔑 Criar minha senha
                    </a>
                </p>
                
                <p>Este link é válido por <strong>1 hora</strong>.</p>
                
                <p>Se você não solicitou esta conta, entre em contato com o administrador.</p>
                
                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
                
                <div style="color: #999; font-size: 12px; text-align: center;">
                    <p>CDC Transporte - Sistema de Gestão de Mobilidade</p>
                    <p>© ${new Date().getFullYear()} Todos os direitos reservados.</p>
                </div>
            </div>
        `,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Email de boas-vindas enviado:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('❌ Erro ao enviar email de boas-vindas:', error);
        throw new Error('Erro ao enviar email de boas-vindas');
    }
}