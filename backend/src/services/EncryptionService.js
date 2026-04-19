'use strict';

const crypto = require('crypto');

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;

function getKey() {
    const baseSecret = process.env.PURPLE_DESK_SECRET || process.env.JWT_SECRET;
    if (!baseSecret) {
        throw new Error('PURPLE_DESK_SECRET is not configured');
    }
    return crypto.createHash('sha256').update(baseSecret).digest();
}

function encrypt(plainText) {
    const iv = crypto.randomBytes(IV_LENGTH);
    const key = getKey();
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    let encrypted = cipher.update(plainText, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    const tag = cipher.getAuthTag().toString('base64');

    return {
        iv: iv.toString('base64'),
        tag,
        data: encrypted
    };
}

function decrypt(payload) {
    const key = getKey();
    const iv = Buffer.from(payload.iv, 'base64');
    const tag = Buffer.from(payload.tag, 'base64');
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);
    let decrypted = decipher.update(payload.data, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

module.exports = {
    encrypt,
    decrypt
};
