<?php

namespace Tests\Feature\Api;

use App\Models\User;
use App\Models\Post;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class PostApiSecurityTest extends TestCase
{
    use RefreshDatabase;

    public function test_unauthenticated_user_cannot_create_post()
    {
        $response = $this->postJson('/api/v1/posts', [
            'content' => 'Test post content'
        ]);

        $response->assertStatus(401);
    }

    public function test_authenticated_user_can_create_post()
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->postJson('/api/v1/posts', [
            'content' => 'Test post content'
        ]);

        $response->assertStatus(201);
    }

    public function test_unauthenticated_user_cannot_delete_post()
    {
        $user = User::factory()->create();
        $post = Post::factory()->create(['user_id' => $user->id]);

        $response = $this->deleteJson('/api/v1/posts/' . $post->id);

        $response->assertStatus(401);
    }

    public function test_authenticated_user_cannot_delete_others_post()
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();
        $post = Post::factory()->create(['user_id' => $user2->id]);

        $response = $this->actingAs($user1)->deleteJson('/api/v1/posts/' . $post->id);

        $response->assertStatus(403);
    }

    public function test_authenticated_user_can_delete_own_post()
    {
        $user = User::factory()->create();
        $post = Post::factory()->create(['user_id' => $user->id]);

        $response = $this->actingAs($user)->deleteJson('/api/v1/posts/' . $post->id);

        $response->assertStatus(200);
    }
}
