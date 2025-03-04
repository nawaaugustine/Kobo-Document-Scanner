import { registerPlugin } from '@capacitor/core';

/**
 * Interface for the SendData plugin.
 */
export interface SendDataPlugin {
  sendData(options: {
    dateOfBirth: string;
    CoAAddress: string;
    province: string;
    district: string;
    village: string;
    documentNumber: string;
    fullName: string;
    fathersName: string;
    age: number;
    gender: string;
    frontImage: string;
    backImage: string;
    DocumentFace: string;
    dependentsInfo: string;
    dateOfIssue: string;
    documentAdditionalNumber: string;
    dateOfExpiry: string;
  }): Promise<void>;
}

const SendData = registerPlugin<SendDataPlugin>('SendData');
export default SendData;
