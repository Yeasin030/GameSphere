<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Bookmark;
use App\Models\Post;
use App\Http\Resources\PostResource;
use Illuminate\Http\Request;

class BookmarkController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user('sanctum') ?? $request->user() ?? \App\Models\User::first();
        $bookmarks = Bookmark::with(['post.user', 'post.game'])
            ->where('user_id', $user->id)
            ->latest()
            ->paginate(15);

        // Map bookmarks to posts
        $posts = $bookmarks->getCollection()->map(function ($bookmark) {
            return $bookmark->post;
        });

        return PostResource::collection($posts);
    }

    public function toggle(Request $request, Post $post)
    {
        $user = $request->user('sanctum') ?? $request->user() ?? \App\Models\User::first();
        $bookmark = Bookmark::where('user_id', $user->id)
            ->where('post_id', $post->id)
            ->first();

        if ($bookmark) {
            $bookmark->delete();
            $post->decrement('saves_count');
            return response()->json(['message' => 'Post removed from bookmarks', 'is_bookmarked' => false]);
        }

        Bookmark::create([
            'user_id' => $user->id,
            'post_id' => $post->id,
        ]);
        $post->increment('saves_count');

        return response()->json(['message' => 'Post bookmarked successfully', 'is_bookmarked' => true]);
    }
}
