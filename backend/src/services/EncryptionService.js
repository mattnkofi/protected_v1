const crypto = require('crypto');

const getKey = () => {
	const secret = process.env.PURPLE_DESK_SECRET || process.env.JWT_SECRET;
	if (!secret) {
		throw new Error('Missing PURPLE_DESK_SECRET or JWT_SECRET for encryption.');
	}
	return crypto.createHash('sha256').update(String(secret)).digest();
};

const encrypt = (payload) => {
	const key = getKey();
	const iv = crypto.randomBytes(12);
	const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

	const raw = typeof payload === 'string' ? payload : JSON.stringify(payload);
	const encrypted = Buffer.concat([cipher.update(raw, 'utf8'), cipher.final()]);
	const tag = cipher.getAuthTag();

	return JSON.stringify({
		iv: iv.toString('base64'),
		content: encrypted.toString('base64'),
		tag: tag.toString('base64')
	});
};

const decrypt = (encryptedPayload) => {
	if (!encryptedPayload) return null;
	const key = getKey();
	const payload = JSON.parse(encryptedPayload);
	const iv = Buffer.from(payload.iv, 'base64');
	const tag = Buffer.from(payload.tag, 'base64');
	const content = Buffer.from(payload.content, 'base64');

	const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
	decipher.setAuthTag(tag);
	const decrypted = Buffer.concat([decipher.update(content), decipher.final()]).toString('utf8');

	try {
		return JSON.parse(decrypted);
	} catch (error) {
		return decrypted;
	}
};

module.exports = {
	encrypt,
	decrypt
};
