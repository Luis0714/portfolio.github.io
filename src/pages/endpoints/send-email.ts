import type { APIRoute } from "astro";
import { Resend } from "resend";

const response = (
  body: string,
  {
    status,
    statusText,
    headers,
  }: { status?: number; statusText?: string; headers?: Headers }
) => new Response(body, { status, statusText, headers });

export const POST: APIRoute = async ({ params, request }) => {
  const body = await request.json();
  console.log(body);
  const { email, name, message } = body;
  const { data, error } = await sendEmail(name, email, message);
  return manageResponse(data, error);
};

async function sendEmail(name: string, email: string, message: string) {
  const key = import.meta.env.PUBLIC_RESEND_KEY;
  const emailSender = import.meta.env.PUBLIC_RESEND_EMAIL_SENDER;
  const emailReceiver = import.meta.env.PUBLIC_RESEND_EMAIL_RECEIVER;
  const subject = "Mensaje desde formulario de contacto del portafolio";
  console.log({ key, emailSender, emailReceiver });
  const template = getTemplate({ name, email, message });
  const resend = new Resend(key);
  const { data, error } = await resend.emails.send({
    from: emailSender,
    to: [emailReceiver],
    subject: subject,
    html: template,
  });
  return { data, error };
}

function manageResponse(data: any, error: any) {
  if (error) {
    return response("Error al enviar el mensaje", { status: 500 });
  }
  return response("Mensaje enviado correctamente", { status: 200 });
}

function getTemplate(information: any): string {
  return `
          <!DOCTYPE html>
          <html lang="es">
            <head>
              <meta charset="UTF-8" />
              <meta name="viewport" content="width=device-width, initial-scale=1.0" />
              <title>Nuevo mensaje de contacto</title>
              <style>
                body {
                  font-family: 'Helvetica Neue', Arial, sans-serif;
                  background-color: #f4f4f4;
                  margin: 0;
                  padding: 20px;
                  color: #333;
                }
                .container {
                  max-width: 600px;
                  margin: 0 auto;
                  background: #ffffff;
                  padding: 30px;
                  border-radius: 8px;
                  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                }
                h1 {
                  font-size: 24px;
                  color: #2c3e50;
                  text-align: center;
                  margin-bottom: 20px;
                }
                p {
                  font-size: 16px;
                  line-height: 1.5;
                  margin: 10px 0;
                }
                .label {
                  font-weight: bold;
                  color: #2c3e50;
                }
                .footer {
                  text-align: center;
                  font-size: 12px;
                  color: #aaa;
                  margin-top: 30px;
                }
                </style>
              </head>
              <body>
                <div class="container">
                  <h1>Nuevo mensaje de contacto</h1>
                  <p><span class="label">Nombre:</span> ${information.name}</p>
                  <p><span class="label">Correo:</span> ${information.email}</p>
                  <p><span class="label">Mensaje:</span></p>
                  <p>${information.message}</p>
                </div>
                <div class="footer">
                  <p>Este mensaje fue enviado desde el formulario de contacto de Estremor dev.</p>
                </div>
              </body>
            </html>
          `;
}
