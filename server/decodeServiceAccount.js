import dotenv from "dotenv";

dotenv.config();

export function decodeBase64ToJson(base64String) {
    try {
        const decodedBuffer = Buffer.from(base64String, 'base64');
        const decodedString = decodedBuffer.toString('utf8');
        const jsonData = JSON.parse(decodedString);

        return {
            success: true,
            data: jsonData
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
}

export function decodeFromEnv() {
    const base64FromEnv = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
    if (!base64FromEnv) {
        return {
            success: false,
            error: 'FIREBASE_SERVICE_ACCOUNT_BASE64 not found'
        };
    }
    return decodeBase64ToJson(base64FromEnv);
}