import axios from 'axios';
import { MlKem512 } from 'mlkem';
import { v4 as uuidv4 } from 'uuid';
import { gcm } from '@noble/ciphers/aes';
import { utf8ToBytes } from '@noble/ciphers/utils';
import { randomBytes } from '@noble/ciphers/webcrypto';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type EncryptedData = {
    ciphertext_b64: string,
    client_id: string,
    nonce_b64: string
}

export class EncryptionClient {
    CLIENT_ID: string;
    SHARED_SECRET: Uint8Array;

    constructor() {
        this.CLIENT_ID = uuidv4();
        this.SHARED_SECRET = new Uint8Array();
        this.initialize();
    }

    async initialize() {
        await this.genClientSecret();
    }

    base64ToUint8Array(base64: string): Uint8Array {
        const binaryString = atob(base64);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes;
    }

    uint8ArrayToBase64(uint8Array: Uint8Array): string {
        let binaryString = '';
        for (let i = 0; i < uint8Array.length; i++) {
        binaryString += String.fromCharCode(uint8Array[i]);
        }
        return btoa(binaryString);
    }

    async genClientSecret(): Promise<void> {
        const data = { client_id: String(this.CLIENT_ID) };
        let pk: Uint8Array = new Uint8Array();
        await axios.post(`${API_URL}/kem/initiate`, data)
        .then(response => {
            const public_key_b64 = response.data.public_key_b64;
            pk = this.base64ToUint8Array(public_key_b64);
        })
        .catch(error => {
            console.error('There was an error!', error);
        });

        const sender = new MlKem512();
        const [ciphertext, shared_secret] = await sender.encap(pk); // Save shared secret somewhere

        const ciphertext_b64 = this.uint8ArrayToBase64(ciphertext);
        const complete_data = { client_id: String(this.CLIENT_ID), ciphertext_b64: ciphertext_b64 };
        await axios.post(`${API_URL}/kem/complete`, complete_data)
        .then(response => {
            console.log(response.data);
        })
        .catch(error => {
            console.error('There was an error!', error);
        });

        this.SHARED_SECRET = shared_secret;
    }

    encryptData(data: string): EncryptedData {
        const key = this.SHARED_SECRET;
        const nonce = randomBytes(24);
        const bytes = utf8ToBytes(data);
        const aes = gcm(key, nonce);
        const ciphertext = aes.encrypt(bytes);

        return {
            ciphertext_b64: this.uint8ArrayToBase64(ciphertext),
            nonce_b64: this.uint8ArrayToBase64(nonce),
            client_id: this.CLIENT_ID
        }
    }

    decryptData(data: EncryptedData): string {
        try {
            const key = this.SHARED_SECRET;
            const nonce = this.base64ToUint8Array(data.nonce_b64);
            const aes = gcm(key, nonce);
            const plaintext = aes.decrypt(this.base64ToUint8Array(data.ciphertext_b64));
            return new TextDecoder().decode(plaintext);
        } catch (error) {
            console.error('Decryption error:', error);
            throw new Error('Failed to decrypt data');
        }
    }

}