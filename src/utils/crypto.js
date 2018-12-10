import CryptoJS from 'crypto-js';

export function encrypt(val, secret) {
    if (secret && val) {
        if (typeof val === 'object') {
            val = JSON.stringify(val);
        }
        return CryptoJS.AES.encrypt(val, secret).toString();
    }
}

export function decrypt(ciphertext, secret) {
    if (secret && ciphertext) {
        const bytes = CryptoJS.AES.decrypt(ciphertext, secret);
        let result = bytes.toString(CryptoJS.enc.Utf8);
        if (typeof result === 'object') {
            result = JSON.parse(result);
        }
        return result;
    }
}

const crypto = {
    encrypt,
    decrypt
};

export default crypto;
