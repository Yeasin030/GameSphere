<?php

namespace Tests\Feature\Api;

use App\Models\User;
use App\Models\Post;
use App\Models\Comment;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class CommentApiSecurityTest extends TestCase
{
    use RefreshDatabase;

    public function test_unauthenticated_user_cannot_create_comment()
    {
        $user = User::factory()->create();
        $post = Post::factory()->create(['user_id' => $user->id]);

        $response = $this->postJson('/api/v1/posts/' . $post->id . '/comments', [
            'content' => 'Test comment content'
        ]);

        $response->assertStatus(401);
    }

    public function test_authenticated_user_can_create_comment()
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();
        $post = Post::factory()->create(['user_id' => $user2->id]);

        $response = $this->actingAs($user1)->postJson('/api/v1/posts/' . $post->id . '/comments', [
            'content' => 'Test comment content'
        ]);

        $response->assertStatus(201);
    }
}
