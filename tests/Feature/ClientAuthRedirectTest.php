<?php

namespace Tests\Feature;

use Tests\TestCase;

class ClientAuthRedirectTest extends TestCase
{
    public function test_unauthenticated_client_dashboard_redirects_to_client_login(): void
    {
        $response = $this->get('/client/dashboard');

        $response->assertRedirect('/client/login');
    }
}
