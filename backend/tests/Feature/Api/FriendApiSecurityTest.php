<?php

namespace Tests\Feature\Api;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class FriendApiSecurityTest extends TestCase
{
    use RefreshDatabase;

    public function test_unauthenticated_user_cannot_send_friend_request()
    {
        $user = User::factory()->create();

        $response = $this->postJson('/api/v1/users/' . $user->id . '/friend-request');

        $response->assertStatus(401);
    }

    public function test_authenticated_user_can_send_friend_request()
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();

        $response = $this->actingAs($user1)->postJson('/api/v1/users/' . $user2->id . '/friend-request');

        $response->assertStatus(200);
    }

    public function test_unauthenticated_user_cannot_view_friends_list()
    {
        $response = $this->getJson('/api/v1/friends');

        $response->assertStatus(401);
    }

    public function test_authenticated_user_can_view_friends_list()
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->getJson('/api/v1/friends');

        $response->assertStatus(200);
    }
}
