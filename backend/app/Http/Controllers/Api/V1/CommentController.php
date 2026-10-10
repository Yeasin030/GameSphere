<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Comment;
use App\Models\Post;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class CommentController extends Controller
{
    /**
     * Get comments for a post.
     */
    public function index(Request $request, Post $post): JsonResponse
    {
        $comments = $post->comments()
            ->with(['user:id,username,display_name,avatar'])
            ->whereNull('parent_id') // top-level only
            ->withCount('replies')
            ->latest()
            ->paginate(20);

        return response()->json([
            'data' => $comments->items(),
            'meta' => [
                'current_page' => $comments->currentPage(),
                'last_page'    => $comments->lastPage(),
                'total'        => $comments->total(),
            ],
        ]);
    }

    /**
     * Store a new comment.
     */
    public function store(Request $request, Post $post): JsonResponse
    {
        $content = $request->input('content') ?: $request->json('content');
        if (!$content) {
            $raw = json_decode($request->getContent(), true);
            $content = $raw['content'] ?? null;
        }

        if (empty($content)) {
            return response()->json(['message' => 'The content field is required.'], 422);
        }

        $user = $request->user();

        $comment = $post->comments()->create([
            'user_id'   => $user->id,
            'content'   => $content,
            'parent_id' => $request->input('parent_id'),
        ]);

        $post->increment('comments_count');

        $comment->load('user:id,username,display_name,avatar');

        return response()->json([
            'message' => 'Comment added.',
            'data'    => $comment,
        ], 201);
    }

    /**
     * Update a comment.
     */
    public function update(Request $request, Comment $comment): JsonResponse
    {
        // Add authorization logic if policy exists
        // Gate::authorize('update', $comment);
        
        if ($request->user()->id !== $comment->user_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'content' => ['required', 'string', 'max:1000'],
        ]);

        $comment->update([
            'content' => $request->content,
        ]);

        return response()->json([
            'message' => 'Comment updated.',
            'data'    => $comment,
        ]);
    }

    /**
     * Delete a comment.
     */
    public function destroy(Request $request, Comment $comment): JsonResponse
    {
        // Gate::authorize('delete', $comment);
        if ($request->user()->id !== $comment->user_id && !$request->user()->hasRole('admin')) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $post = $comment->post;
        $comment->delete();
        $post->decrement('comments_count');

        return response()->json([
            'message' => 'Comment deleted.',
        ]);
    }
}
