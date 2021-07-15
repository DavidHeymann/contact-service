"use strict";
const nodemailer = require("nodemailer");
const amqp = require("amqplib/callback_api");
const queueName = "call_to_user";
// async..await is not allowed in global scope, must use a wrapper
async function main(mail, fullName) {
  // Generate test SMTP service account from ethereal.email
  // Only needed if you don't have a real mail account for testing
  let testAccount = await nodemailer.createTestAccount();

  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: "practfix@gmail.com", // generated ethereal user
      pass: "Aa123456!", // generated ethereal password
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: '"practfix" <practfix@gmail.com>', // sender address
    to: mail, // list of receivers
    subject: "practfix", // Subject line
    text: `Hello ${fullName},\nשמחים לבשר שהתרגול ששלחת עובד ועלה לאתר\nעומדים לשירותכם תמיד,\nצוות practfix`, // plain text body
    // html: "<b>Hello world?</b>", // html body
  });

  console.log("Message sent: %s", info.messageId);
  // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

  // Preview only available when sending through an Ethereal account
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
}



amqp.connect(
  "amqps://nvrswiti:g6sHr4Z8IHYLb2ynujmuWZtNx8Bpe77T@cow.rmq2.cloudamqp.com/nvrswiti",
  function (error0, connection) {
    if (error0) {
      throw error0;
    }
    connection.createChannel(function (error1, channel) {
      if (error1) {
        throw error1;
      }
      const queue = queueName;

      channel.assertQueue(queue, {
        durable: false,
      });
      channel.prefetch(1);
      console.log(
        " [*] Waiting for messages in %s. To exit press CTRL+C",
        queue
      );
      channel.consume(
        queue,
        async function (msg) {
          let { mail, fullName } = JSON.parse(msg.content.toString());
          console.log(" [x] Received %s", fullName);
          main(mail, fullName).catch((err) => {
            console.log(err);
          });
          console.log(" [x] Done");
        },
        {
          // manual acknowledgment mode,
          // see https://www.rabbitmq.com/confirms.html for details
          noAck: true,
        }
      );
    });
  }
);
