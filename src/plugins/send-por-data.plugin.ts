import { registerPlugin } from '@capacitor/core';

// Interface for the SendDataPlugin
export interface SendDataPlugin {
  sendData(options: {
    documentNumber: string;
    fullName: string;
    fathersName: string;
    age: number;
    gender: string;
    frontImage: string; // Add frontImage
    backImage: string;  // Add backImage
  }): Promise<void>;
}

// Register the plugin with Capacitor
const SendData = registerPlugin<SendDataPlugin>('SendData');

export default SendData;
