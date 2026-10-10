<?php

namespace Tests\Feature\Api;

use App\Models\User;
use App\Models\Group;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class GroupApiSecurityTest extends TestCase
{
    use RefreshDatabase;

    public function test_unauthenticated_user_cannot_create_group()
    {
        $response = $this->postJson('/api/v1/groups', [
            'name' => 'Test Group',
            'description' => 'Test Description'
        ]);

        $response->assertStatus(401);
    }

    public function test_authenticated_user_can_create_group()
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->postJson('/api/v1/groups', [
            'name' => 'Test Group',
            'description' => 'Test Description'
        ]);

        $response->assertStatus(201);
    }
}
