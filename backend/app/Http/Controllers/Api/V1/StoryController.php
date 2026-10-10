<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Story;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StoryController extends Controller
{
    /**
     * Get active stories for feed.
     */
    public function index(Request $request): JsonResponse
    {
        if (Story::active()->count() === 0 && Story::count() > 0) {
            Story::query()->update(['expires_at' => now()->addDays(7)]);
        }

        $user = $request->user('sanctum') ?? $request->user();
        $query = Story::with('user')->active();

        if ($user) {
            $followingIds = $user->followingUsers()->pluck('users.id')->toArray();
            $query->where(function ($q) use ($user, $followingIds) {
                $q->where('privacy', 'public')
                  ->orWhere('user_id', $user->id)
                  ->orWhereIn('user_id', $followingIds);
            });
        } else {
            $query->where('privacy', 'public');
        }

        $stories = $query->latest()->get();

        $defaultImages = [
            'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=600&auto=format&fit=crop&q=80',
            '/clutch_gameplay.jpg',
            '/battlestation_setup.jpg',
            'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80',
            '/minecraft_castle.jpg',
        ];

        // Format stories for frontend consumption
        $formatted = $stories->map(function ($s, $idx) use ($defaultImages) {
            $user = $s->user;
            $media = $s->media_path;
            if (!$media) {
                $media = $defaultImages[$idx % count($defaultImages)];
            }
            $mediaUrl = (str_starts_with($media, 'http') || str_starts_with($media, '/'))
                ? $media
                : url('storage/' . $media);

            return [
                'id'           => (string) $s->id,
                'type'         => $s->type,
                'media_path'   => $s->media_path,
                'media_url'    => $mediaUrl,
                'image'        => $mediaUrl,
                'text_content' => $s->text_content,
                'seen'         => false,
                'expires_at'   => $s->expires_at?->toIso8601String(),
                'user'         => [
                    'id'         => $user?->id,
                    'name'       => $user?->display_name ?? $user?->username ?? 'Gamer',
                    'username'   => $user?->username ?? 'gamer',
                    'avatar_url' => $user?->avatar_url,
                ],
            ];
        });

        return response()->json(['data' => $formatted]);
    }

    /**
     * Create a new story.
     */
    public function store(Request $request): JsonResponse
    {
        $type = $request->input('type');
        if (! $type) {
            $type = $request->hasFile('media') ? 'image' : 'text';
            $request->merge(['type' => $type]);
        }

        $request->validate([
            'type'         => 'nullable|in:image,video,text',
            'media'        => 'nullable|file|max:20480',
            'text_content' => 'nullable|string',
            'privacy'      => 'nullable|in:public,friends,followers',
        ]);

        $mediaPath = null;
        if ($request->hasFile('media')) {
            $mediaPath = $request->file('media')->store('stories', 'public');
        }

        $user = $request->user();

        $story = Story::create([
            'user_id'          => $user->id,
            'type'             => $type ?: ($mediaPath ? 'image' : 'text'),
            'media_path'       => $mediaPath,
            'text_content'     => $request->input('text_content'),
            'background_color' => $request->input('background_color', '#7c3aed'),
            'font_style'       => $request->input('font_style', 'default'),
            'privacy'          => $request->input('privacy', 'public'),
            'duration_seconds' => 5,
            'expires_at'       => now()->addHours(24),
        ]);

        $story->load('user');

        return response()->json([
            'message' => 'Story created successfully',
            'data'    => [
                'id'           => $story->id,
                'type'         => $story->type,
                'media_path'   => $story->media_path,
                'media_url'    => $story->media_path ? url('storage/' . $story->media_path) : null,
                'text_content' => $story->text_content,
                'seen'         => false,
                'expires_at'   => $story->expires_at?->toIso8601String(),
                'user'         => [
                    'id'         => $story->user?->id,
                    'name'       => $story->user?->display_name ?? $story->user?->username,
                    'username'   => $story->user?->username,
                    'avatar_url' => $story->user?->avatar_url,
                ],
            ],
        ], 201);
    }

    public function show(Story $story): JsonResponse
    {
        return response()->json(['data' => $story->load('user')]);
    }

    public function recordView(Request $request, Story $story): JsonResponse
    {
        $story->increment('views_count');
        return response()->json(['message' => 'View recorded']);
    }

    public function destroy(Request $request, Story $story): JsonResponse
    {
        if ($story->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $story->delete();
        return response()->json(['message' => 'Story deleted']);
    }
}
