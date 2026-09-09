<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Post;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminPostController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $posts = Post::latest()->paginate(20);
        return response()->json([
            'data' => $posts->items(),
            'meta' => ['total' => $posts->total()]
        ]);
    }

    public function destroy(Post $post): JsonResponse
    {
        $post->delete();
        return response()->json(['message' => 'Post deleted.']);
    }

    public function approve(Post $post): JsonResponse
    {
        return response()->json(['message' => 'Post approved.']);
    }

    public function hide(Post $post): JsonResponse
    {
        return response()->json(['message' => 'Post hidden.']);
    }
}
