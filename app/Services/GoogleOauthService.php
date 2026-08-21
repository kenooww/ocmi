<?php

namespace App\Services;

use GuzzleHttp\Client as GuzzleClient;
use Illuminate\Support\Str;

class GoogleOauthService
{
    protected string $clientId;
    protected string $clientSecret;
    protected string $redirectUri;
    protected GuzzleClient $http;

    public function __construct()
    {
        $this->clientId = config('services.google.client_id') ?? env('GOOGLE_CLIENT_ID');
        $this->clientSecret = config('services.google.client_secret') ?? env('GOOGLE_CLIENT_SECRET');
        $this->redirectUri = config('services.google.redirect') ?? env('GOOGLE_REDIRECT');
        $this->http = new GuzzleClient(['timeout' => 10.0]);
    }

    public function getAuthUrl(array $scopes = ['openid', 'email', 'profile']): string
    {
        $state = Str::random(40);
        session(['google_oauth_state' => $state]);

        $params = http_build_query([
            'client_id' => $this->clientId,
            'redirect_uri' => $this->redirectUri,
            'response_type' => 'code',
            'scope' => implode(' ', $scopes),
            'access_type' => 'offline',
            'include_granted_scopes' => 'true',
            'state' => $state,
            'prompt' => 'select_account',
        ]);

        return 'https://accounts.google.com/o/oauth2/v2/auth?' . $params;
    }

    public function getUserFromCode(string $code, ?string $state = null): array
    {
        // validate state
        $sessionState = session('google_oauth_state');
        if ($state && $sessionState && $state !== $sessionState) {
            throw new \RuntimeException('Invalid OAuth state.');
        }

        // Exchange code for tokens
        $response = $this->http->post('https://oauth2.googleapis.com/token', [
            'form_params' => [
                'code' => $code,
                'client_id' => $this->clientId,
                'client_secret' => $this->clientSecret,
                'redirect_uri' => $this->redirectUri,
                'grant_type' => 'authorization_code',
            ],
        ]);

        $data = json_decode((string) $response->getBody(), true);
        if (! isset($data['access_token'])) {
            throw new \RuntimeException('Failed to retrieve access token from Google.');
        }

        // Retrieve user info
        $userinfo = $this->http->get('https://www.googleapis.com/oauth2/v3/userinfo', [
            'headers' => [
                'Authorization' => 'Bearer ' . $data['access_token'],
            ],
        ]);

        $profile = json_decode((string) $userinfo->getBody(), true);
        return array_merge($profile, $data);
    }
}
