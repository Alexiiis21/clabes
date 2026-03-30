export default function AuthPage() {
    return new Response('Authenticate', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Secure Area"',
      },
    });
}
