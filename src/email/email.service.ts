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
  async sendVerificationToEmail(email: string, boardId: string) {
    const emailOptions: EmailOptions = {
      from: process.env.user,
      to: email,
      subject: '보드 초대 메일',
      html: `
      <h1>보드에 초대되었습니다.</h1>
      <a href="http://localhost:3030/boards/invite/accept?boardId=${boardId}&email=${email}" class="button">보드 구경하기</a>
      `,
    };

    return await this.transporter.sendMail(emailOptions);
  }
}
