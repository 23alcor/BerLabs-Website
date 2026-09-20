declare namespace Cloudflare {
  interface Env {
    DB?: D1Database;
    BUCKET?: R2Bucket;
    MAILGUN_API_KEY?: string;
    MAILGUN_DOMAIN?: string;
    SITE_ORIGIN?: string;
    TURNSTILE_SECRET?: string;
    TURNSTILE_SITE_KEY?: string;
  }
}
