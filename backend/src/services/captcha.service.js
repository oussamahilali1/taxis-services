import { config } from '../lib/config.js';
import { HttpError } from '../lib/http-error.js';

const providerEndpoints = {
  turnstile: 'https://challenges.cloudflare.com/turnstile/v0/siteverify',
  hcaptcha: 'https://hcaptcha.com/siteverify',
};

function getCaptchaToken(input) {
  return String(input?.captchaToken ?? input?.captcha_token ?? input?.captcha ?? '').trim();
}

export async function verifyPublicCaptcha(input, { remoteIp } = {}) {
  const mode = config.abuse.captchaMode;
  if (mode === 'off') {
    return {
      checked: false,
      verified: false,
      provider: '',
    };
  }

  const token = getCaptchaToken(input);
  if (!token) {
    if (mode === 'required') {
      throw new HttpError(400, 'CAPTCHA_REQUIRED', 'Veuillez confirmer le controle anti-spam.');
    }

    return {
      checked: false,
      verified: false,
      provider: config.abuse.captchaProvider,
    };
  }

  try {
    const response = await fetch(providerEndpoints[config.abuse.captchaProvider], {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        secret: config.abuse.captchaSecret,
        response: token,
        remoteip: remoteIp || '',
      }),
    });

    if (!response.ok) {
      throw new Error(`Captcha verification failed with status ${response.status}.`);
    }

    const payload = await response.json();
    if (!payload.success) {
      throw new HttpError(400, 'CAPTCHA_INVALID', 'Le controle anti-spam a echoue. Veuillez reessayer.');
    }

    return {
      checked: true,
      verified: true,
      provider: config.abuse.captchaProvider,
    };
  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    }

    throw new HttpError(502, 'CAPTCHA_UNAVAILABLE', 'Le controle anti-spam est temporairement indisponible.');
  }
}
