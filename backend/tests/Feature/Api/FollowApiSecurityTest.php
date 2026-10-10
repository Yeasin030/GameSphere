<?php

namespace Tests\Feature\Api;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class FollowApiSecurityTest extends TestCase
{
    use RefreshDatabase;

    public function test_unauthenticated_user_cannot_follow()
    {
        $user = User::factory()->create();

        $response = $this->postJson('/api/v1/users/' . $user->id . '/follow');

        $response->assertStatus(401);
    }

    public function test_authenticated_user_can_follow()
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();

        $response = $this->actingAs($user1)->postJson('/api/v1/users/' . $user2->id . '/follow');

        $response->assertStatus(200);
    }
}
