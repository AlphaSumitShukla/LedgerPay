require('dotenv').config();
const nodemailer = require('nodemailer');



// Create Transporter


const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        type: 'OAuth2',
        user: process.env.EMAIL_USER,
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        refreshToken: process.env.REFRESH_TOKEN,
    },
});



// Verify Email Configuration


transporter.verify((error, success) => {
    if (error) {
        console.error('Error connecting to email server:', error);
    } else {
        console.log('Email server is ready to send messages');
    }
});



// Common Send Email Function


const sendEmail = async (to, subject, text, html) => {
    try {

        const info = await transporter.sendMail({
            from: `"Backend Ledger" <${process.env.EMAIL_USER}>`,
            to: to,
            subject: subject,
            text: text,
            html: html,
        });

        console.log('Message sent: %s', info.messageId);

        console.log(
            'Preview URL: %s',
            nodemailer.getTestMessageUrl(info)
        );

    } catch (error) {

        console.error('Error sending email:', error);

    }
};


// 1. Registration Email


async function sendRegistertionEmail(userEmail, name) {

    const subject = 'Welcome to Backend Ledger!';

    const text = `Hello ${name},

Thank you for registering at Backend Ledger.

We're excited to have you on board!

Best regards,
The Backend Ledger Team.`;

    const html = `
        <h2>Welcome to Backend Ledger, ${name}! 🎉</h2>

        <p>
            Thank you for registering at Backend Ledger.
        </p>

        <p>
            We're excited to have you on board!
        </p>

        <p>
            Best regards,<br>
            <strong>The Backend Ledger Team</strong>
        </p>
    `;

    await sendEmail(
        userEmail,
        subject,
        text,
        html
    );
}


// 2. Successful Transaction Email


async function sendTransactionEmail(
    userEmail,
    name,
    amount,
    toAccount
) {

    const subject = 'Transaction Successful - Backend Ledger';

    const text = `Hello ${name},

Your transaction was successful.

Amount: ₹${amount}
To Account: ${toAccount}

Thank you for using Backend Ledger.

Best regards,
The Backend Ledger Team.`;

    const html = `
        <h2>Transaction Successful ✅</h2>

        <p>Hello ${name},</p>

        <p>
            Your transaction has been completed successfully.
        </p>

        <p>
            <strong>Amount:</strong> ₹${amount}
        </p>

        <p>
            <strong>To Account:</strong> ${toAccount}
        </p>

        <p>
            Thank you for using Backend Ledger.
        </p>

        <p>
            Best regards,<br>
            <strong>The Backend Ledger Team</strong>
        </p>
    `;

    await sendEmail(
        userEmail,
        subject,
        text,
        html
    );
}



// 3. Failed Transaction Email


async function sendFailureEmail(
    userEmail,
    name,
    amount,
    reason
) {

    const subject = 'Transaction Failed - Backend Ledger';

    const text = `Hello ${name},

Unfortunately, your transaction could not be completed.

Amount: ₹${amount}
Reason: ${reason}

Please try again. If the problem continues, please contact support.

Best regards,
The Backend Ledger Team.`;

    const html = `
        <h2>Transaction Failed ❌</h2>

        <p>Hello ${name},</p>

        <p>
            Unfortunately, your transaction could not be completed.
        </p>

        <p>
            <strong>Amount:</strong> ₹${amount}
        </p>

        <p>
            <strong>Reason:</strong> ${reason}
        </p>

        <p>
            Please try again. If the problem continues,
            please contact support.
        </p>

        <p>
            Best regards,<br>
            <strong>The Backend Ledger Team</strong>
        </p>
    `;

    await sendEmail(
        userEmail,
        subject,
        text,
        html
    );
}



// Export Functions


module.exports = {
    sendRegistertionEmail,
    sendTransactionEmail,
    sendFailureEmail
};


