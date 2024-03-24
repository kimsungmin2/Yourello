import { Injectable } from '@nestjs/common';
import nodemailer from 'nodemailer';

interface EmailOptions {
  from: string;
  to: string;
  subject: string;
  html: string;
}

@Injectable()
export class EmailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: process.env.email_service,
      auth: {
        user: process.env.user,
        pass: process.env.pass,
      },
    });
  }
  async sendVerificationToEmail(email: string, boardId: string, title: string) {
    const emailOptions: EmailOptions = {
      from: process.env.user,
      to: email,
      subject: '보드 초대 메일',
      html: `
      <html>
  <head>
    <title>🎉 초대합니다 🎉</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        line-height: 1.6;
        margin: 0;
        padding: 0;
        background-color: #f9f9f9;
      }

      h2 {
        margin: 0;
      }

      .container {
        max-width: 600px;
        margin: auto;
        padding: 20px;
        background-color: #fff;
        border-radius: 10px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      }

      .header {
        background-color: #3394cc;
        color: #fff;
        padding: 20px;
        text-align: center;
        border-top-left-radius: 5px;
        border-top-right-radius: 5px;
      }

      .content {
        padding: 20px;
        text-align: center;
        color: black;
      }

      .button {
        display: inline-block;
        background-color: #3394cc;
        color: #fff;
        text-decoration: none;
        padding: 10px 20px;
        border-radius: 5px;
        transition: background-color 0.3s ease;
      }
      .button:hover {
        background-color: #27719b;
      }

      .emoji {
        font-size: 20px;
        vertical-align: middle;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h2>
          <span class="emoji">🎉</span> 환영합니다!
          <span class="emoji">🎉</span>
        </h2>
      </div>
      <div class="content">
        <h3>${title} 보드에 초대되었습니다.</h3>
        <p>아래 초대 수락 버튼을 클릭하시면 보드에 자동 등록됩니다!</p>
        <a
          href="http://localhost:3000/boards/invite/accept?boardId=${boardId}&email=${email}"
          class="button"
          >초대 수락</a
        >
      </div>
    </div>
  </body>
</html>
      `,
    };

    return await this.transporter.sendMail(emailOptions);
  }
}
