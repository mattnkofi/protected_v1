const { OAuth2Client } = require('google-auth-library');
const { User } = require('../model');
const jwtService = require('../services/JwtService');
const { getDeviceInfo } = require('../middleware/AuthMiddleware');

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
const googleRedirectUri = process.env.GOOGLE_REDIRECT_URI || `${process.env.FRONTEND_URL || 'http://localhost:5000'}/auth/google/callback`;

const isGoogleOAuthConfigured = Boolean(googleClientId && googleClientSecret && googleRedirectUri);

const client = isGoogleOAuthConfigured
    ? new OAuth2Client(googleClientId, googleClientSecret, googleRedirectUri)
    : null;

const ensureGoogleOAuthConfig = (res) => {
    if (isGoogleOAuthConfigured) return true;

    console.error('[OAuth] Google OAuth is not configured. Missing GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET / GOOGLE_REDIRECT_URI');
    res.status(500).json({
        message: 'Google OAuth is not configured on the server. Please set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_REDIRECT_URI in backend/.env and restart the backend.'
    });
    return false;
};

const getGoogleProfileFromAccessToken = async (accessToken) => {
    if (!accessToken) return null;

    const resp = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` }
    });

    if (!resp.ok) {
        const body = await resp.text();
        throw new Error(`Google userinfo request failed (${resp.status}): ${body}`);
    }

    return await resp.json();
};

/**
 * Sets the same secure refresh cookie used in AuthController
 */
const setRefreshCookie = (res, token) => {
    res.cookie('refresh_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'None',
        path: '/api/v1/auth',
        maxAge: 7 * 24 * 60 * 60 * 1000
    });
};

exports.getGoogleAuthUrl = (req, res) => {
    if (!ensureGoogleOAuthConfig(res)) return;

    const url = client.generateAuthUrl({
        access_type: 'offline',
        scope: ['openid', 'profile', 'email'],
        prompt: 'select_account',
        redirect_uri: googleRedirectUri,
        include_granted_scopes: true
    });
    res.json({ authUrl: url });
};

exports.exchangeGoogleCode = async (req, res, next) => {
    try {
        if (!ensureGoogleOAuthConfig(res)) return;

        const { code } = req.body;
        if (!code) return res.status(400).json({ message: 'Code is required' });

        // 1. Exchange code to tokens
        const { tokens } = await client.getToken({
            code,
            redirect_uri: googleRedirectUri
        });

        let profile;
        if (tokens?.id_token) {
            const ticket = await client.verifyIdToken({
                idToken: tokens.id_token,
                audience: googleClientId,
            });
            profile = ticket.getPayload();
        } else {
            // Some Google responses may omit id_token depending on scopes/settings.
            profile = await getGoogleProfileFromAccessToken(tokens?.access_token);
        }

        const { email, name, sub: provider_id, picture } = profile || {};
        if (!email || !provider_id) {
            return res.status(401).json({ message: 'Unable to read Google profile from token response.' });
        }

        // 2. Sync User in DB
        let [user, created] = await User.findOrCreate({
            where: { email },
            defaults: {
                name: name,
                provider: 'google',
                provider_id: provider_id,
                avatar_url: picture,
                email_verified_at: new Date(),
                role: 'player'
            }
        });

        // If user existed but was local, link to Google
        if (!created && !user.provider_id) {
            await user.update({
                provider: 'google',
                provider_id: provider_id,
                email_verified_at: user.email_verified_at || new Date()
            });
        }

        // 3. Issue internal App Tokens
        const deviceInfo = getDeviceInfo(req);
        const appTokens = await jwtService.issueTokens(user, deviceInfo);

        // 4. Set Refresh Cookie
        setRefreshCookie(res, appTokens.refreshToken);

        res.json({
            message: 'Google login successful',
            token: appTokens.accessToken,
            refreshToken: appTokens.refreshToken,
            user: user.toJSON()
        });
    } catch (error) {
        console.error('Google OAuth Exchange Error:', error);
        const details = error?.response?.data?.error_description || error?.response?.data?.error || error?.message;
        res.status(401).json({
            message: 'Authentication with Google failed.',
            details: process.env.NODE_ENV === 'development' ? details : undefined
        });
    }
};