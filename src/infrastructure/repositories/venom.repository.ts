import LeadExternal from "../../domain/lead-external.repository";
import { create, Whatsapp } from "venom-bot";
import { Buffer } from 'buffer';

export class VenomTransporter implements LeadExternal {
  instance: Whatsapp | undefined;

  constructor() {
    create(
      'sessionName',
      (base64Qr,asciiQR) => {
        console.log(asciiQR);
        var matches = base64Qr.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
        response = {type:"",data: {}};  
        if (matches?.length !== 3) {
          return new Error('Invalid input string');
        }
        response.type = matches[1];
        response.data = Buffer.from(matches[2], 'base64');  
        var imageBuffer = response;
        require('fs').writeFile(
          './src/storage/qrcode/qr.png',
          imageBuffer['data'],
          'binary',
          function (err: null) {
            if (err != null) {
              console.log(err);
            }
          }
        );
      }, (statusSession) => {
        console.log('Status Session: ', statusSession);
      }, {
        logQR: true
      }
    ).then((client) => (this.instance = client));
  }

  async sendStatus(): Promise<any> {
    let connection = await this.instance?.getConnectionState();
    if(connection === "CONNECTED") {
      const data = {
        err: false,
        status: "400",
        statusText: "Connected",
      }
      return Promise.resolve(data);
    } else {
      const data = {
        err: true,
        status: "500",
        statusText: "Internal Server Error",
      }
      return Promise.resolve(data);
    }
  }

  async sendMsg(lead: { message: string; phone: string; pathtofiles: Array<string> }): Promise<any> {
    let connection = await this.instance?.getConnectionState();
    if(connection === "CONNECTED") {
      try {
        const { message, phone, pathtofiles } = lead;
        var result;
        if(pathtofiles?.length > 0) {
          let pathtofile = 'http://localhost:3001/media/' + pathtofiles[0];
          let filename = pathtofiles[0];
          result = await this.instance?.sendFile(`${phone}@c.us`, pathtofile, filename, message)
          if(pathtofiles.length > 1) {
            for(let i = 1; i < pathtofiles.length; i++) {
              let pathtofile = 'http://localhost:3001/media/' + pathtofiles[i];                       
              let filename = pathtofiles[i];
              result = await this.instance?.sendFile(`${phone}@c.us`, pathtofile, filename,``)
            };
          }
        }
        else {
          result = await this.instance?.sendText(`${phone}@c.us`, message);
        }
        const response = result;
        return Promise.resolve(response);
      } 
      catch (error: any) {
        return Promise.resolve(error);
      }
    } else {
      return Promise.resolve("Disconnected, ¡restarting connection with WhatsApp!");
    }
  }
}