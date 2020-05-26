import { MailService } from '@sendgrid/mail';
// eslint-disable-next-line import/no-extraneous-dependencies
import { MailData } from '@sendgrid/helpers/classes/mail';

const SimpleSendGridAdapter = (mailOptions: { apiKey: string; fromAddress: string }) => {
  if (!mailOptions || !mailOptions.apiKey || !mailOptions.fromAddress) {
    throw new Error('SimpleSendGridAdapter requires an API Key.');
  }

  const sendgrid = new MailService();

  const sendMail = ({
    to,
    subject,
    text,
    html,
    templateId,
    dynamicTemplateData,
  }: MailData): Promise<any> => {
    sendgrid.setApiKey(mailOptions.apiKey);
    const msg = {
      to,
      from: mailOptions.fromAddress,
      subject,
      text,
      html: html || `<div>${text}</div>`,
      templateId,
      dynamicTemplateData,
    };

    return sendgrid.send(msg);
  };

  return Object.freeze({
    sendMail,
  });
};

export default SimpleSendGridAdapter;
