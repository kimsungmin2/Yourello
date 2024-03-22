import { Injectable } from '@nestjs/common';
import nodemailer from 'nodemailer'

interface EmailOptions{
  from: string;
  to: string;
  subject: string;
  html: string;
}

@Injectable()
export class EmailService {
  private transporter;

  constructor(){
    this.transporter = nodemailer.createTransport({
      service: process.env.email_service,
      auth: {
        user: process.env.user,
        pass: process.env.pass
      }
    });
  }
async sendVerivicationToEmail(email: string, token: any ){
  const emailOptions: EmailOptions = {
    from: process.env.user,
    to: email,
    subject: 'Trello Board 보드 초대 인증 메일',
    html: `<p>아래의 인증코드를 입력해주세요 !</p>
  <p>인증 코드 : ${token.code} </p>
  <p>This link will expire on ${token.expires}.</p>`
  };
  return await this.transporter.sendMail(emailOptions);
}

async generateRandomToken(min: number, max: number){
  const code = Math.floor(Math.random() * (max-min+1))+min;
  const expires =  new Date();
  expires.setHours(expires.getHours()+24); //24시간 후 만료
  return {code, expires};
}

// <p><a href="http://localhost:3030/boards/accept/?email=${email}/code=${token.code}">인증하기</a></p>
 

}
