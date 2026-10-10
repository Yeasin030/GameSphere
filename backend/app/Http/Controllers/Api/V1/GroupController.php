<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Group;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class GroupController extends Controller
{
    /**
     * List all communities/groups.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Group::with(['owner', 'game'])->where('is_active', true);

        if ($request->filled('q')) {
            $q = $request->q;
            $query->where(function ($b) use ($q) {
                $b->where('name', 'LIKE', "%{$q}%")
                  ->orWhere('description', 'LIKE', "%{$q}%");
            });
        }

        if ($request->filled('type') && $request->type !== 'all') {
            $query->where('type', $request->type);
        }

        if ($request->boolean('verified')) {
            $query->where('is_verified', true);
        }

        $sort = $request->input('sort', 'members');
        match ($sort) {
            'posts'   => $query->orderByDesc('posts_count'),
            'newest'  => $query->latest(),
            default   => $query->orderByDesc('members_count'),
        };

        $groups = $query->paginate($request->integer('per_page', 24));

        return response()->json([
            'data' => $groups->items(),
            'meta' => [
                'current_page' => $groups->currentPage(),
                'last_page'    => $groups->lastPage(),
                'total'        => $groups->total(),
            ],
        ]);
    }

    /**
     * Create a new group.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'             => 'required|string|max:255',
            'description'      => 'required|string',
            'type'             => 'nullable|in:public,private,invite_only',
            'avatar'           => 'nullable|string',
            'cover_image'      => 'nullable|string',
            'game_id'          => 'nullable|integer',
            'require_approval' => 'nullable|boolean',
        ]);

        // Pick owner (authenticated user or fallback to first user)
        $owner = $request->user() ;
        if (!$owner) {
            return response()->json(['message' => 'User not found to assign as group owner.'], 400);
        }

        $slug = Str::slug($validated['name']) . '-' . rand(100, 999);

        $group = Group::create([
            'owner_id'         => $owner->id,
            'game_id'          => $validated['game_id'] ?? null,
            'name'             => $validated['name'],
            'slug'             => $slug,
            'description'      => $validated['description'],
            'avatar'           => $validated['avatar'] ?? 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=150&auto=format&fit=crop&q=80',
            'cover_image'      => $validated['cover_image'] ?? '/battlestation_setup.jpg',
            'type'             => $validated['type'] ?? 'public',
            'language'         => 'en',
            'require_approval' => $request->boolean('require_approval', false),
            'is_verified'      => false,
            'is_active'        => true,
            'members_count'    => 1,
            'posts_count'      => 0,
        ]);

        // Attach owner as member
        $group->members()->attach($owner->id, [
            'role'      => 'owner',
            'status'    => 'approved',
            'joined_at' => now(),
        ]);

        return response()->json([
            'message' => 'Group created successfully.',
            'data'    => $group->load(['owner', 'game']),
        ], 201);
    }

    /**
     * Show single group by slug.
     */
    public function show(string $slug): JsonResponse
    {
        $group = Group::where('slug', $slug)
            ->with(['owner', 'game', 'activeMembers'])
            ->firstOrFail();

        return response()->json(['data' => $group]);
    }

    /**
     * Join a group.
     */
    public function join(Request $request, Group $group): JsonResponse
    {
        $user = $request->user() ;
        if (!$user) {
            return response()->json(['message' => 'User required to join group.'], 401);
        }

        $existing = $group->members()->where('user_id', $user->id)->first();
        if ($existing) {
            return response()->json([
                'message' => 'Already a member of this group.',
                'members_count' => $group->members_count,
            ]);
        }

        $group->members()->attach($user->id, [
            'role'      => 'member',
            'status'    => $group->require_approval ? 'pending' : 'approved',
            'joined_at' => now(),
        ]);

        $group->increment('members_count');

        return response()->json([
            'message' => 'Successfully joined group.',
            'members_count' => $group->fresh()->members_count,
            'status' => $group->require_approval ? 'pending' : 'approved',
        ]);
    }

    /**
     * Leave a group.
     */
    public function leave(Request $request, Group $group): JsonResponse
    {
        $user = $request->user() ;
        if (!$user) {
            return response()->json(['message' => 'User required to leave group.'], 401);
        }

        $group->members()->detach($user->id);
        if ($group->members_count > 0) {
            $group->decrement('members_count');
        }

        return response()->json([
            'message' => 'Left group.',
            'members_count' => $group->fresh()->members_count,
        ]);
    }
}
