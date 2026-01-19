import {resendClient,sender} from '../lib/resend.js';
import {createWelcomeEmailTemplate} from '../emails/emailTemplates.js';
export const sendWelcomeEmail = async (email, name, clientURL) => {
    console.log('Debug - sender object:', sender);
    console.log('Debug - sender.name:', sender.name);
    console.log('Debug - sender.email:', sender.email);
    console.log('Debug - from field will be:', `${sender.name} <${sender.email}>`);
    const {data, error}=await resendClient.emails.send({
        from:`${sender.name} <${sender.email}>`,
        to:email, 
        subject:"welcome to chat app",
        html:createWelcomeEmailTemplate(name, clientURL)
    });

    if(error){
        console.error("Error sending welcome email:", error);
        throw new Error("failed to send welcome email");
    }
    console.log("welcome emai sent successfully", data);
};
