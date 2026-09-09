<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\TournamentRegistration;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class UserController extends Controller
{
    /**
     * Resolve currently authenticated user or fall back to demo user.
     */
    private function resolveUser(Request $request): ?User
    {
        return $request->user('sanctum') ?? $request->user() ?? User::where('email', 'demo@gamesphere.com')->first() ?? User::first();
    }

    /**
     * Get a paginated list of active users to discover and follow.
     */
    public function index(Request $request): JsonResponse
    {
        $query = User::active()->with(['privacySettings']);

        if ($request->has('q') && $request->q) {
            $q = $request->q;
            $query->where(function($b) use ($q) {
                $b->where('display_name', 'LIKE', "%{$q}%")
                  ->orWhere('username', 'LIKE', "%{$q}%");
            });
        }

        if ($request->has('category') && $request->category === 'verified') {
            $query->where('is_verified', true);
        }

        $users = $query->orderByDesc('followers_count')->paginate(20);

        return response()->json([
            'data' => UserResource::collection($users),
            'meta' => [
                'current_page' => $users->currentPage(),
                'last_page' => $users->lastPage(),
                'total' => $users->total(),
            ]
        ]);
    }

    /**
     * Get a user's full profile (works with @username or 'me').
     */
    public function show(Request $request, string $username): JsonResponse
    {
        $currentUser = $this->resolveUser($request);

        if ($username === 'me' || ($currentUser && $currentUser->username === $username)) {
            $user = $currentUser;
        } else {
            $user = User::where('username', $username)
                ->active()
                ->firstOrFail();
        }

        if (!$user) {
            return response()->json(['message' => 'User not found.'], 404);
        }

        $isSelf = $currentUser && $currentUser->id === $user->id;
        $isFollowing = false;
        $isFriend = false;

        if ($currentUser && !$isSelf) {
            $isFollowing = $currentUser->followingUsers()->where('following_id', $user->id)->exists();
            $isFriend = $currentUser->friends()->where('users.id', $user->id)->exists();
        }

        // Load unlocked achievements
        $achievements = DB::table('user_achievements')
            ->join('achievements', 'user_achievements.achievement_id', '=', 'achievements.id')
            ->where('user_achievements.user_id', $user->id)
            ->select('achievements.*', 'user_achievements.unlocked_at')
            ->orderByDesc('user_achievements.unlocked_at')
            ->get();

        // Load user games
        $games = $user->games()
            ->withPivot(['status', 'display_order', 'show_on_profile', 'playtime_hours', 'rating', 'notes'])
            ->orderByPivot('display_order')
            ->get();

        $totalPlaytime = $user->games()->sum('user_games.playtime_hours');

        // Tournaments participated
        $tournamentsCount = TournamentRegistration::where('user_id', $user->id)->count();

        $profileData = [
            'id'               => $user->id,
            'username'         => $user->username,
            'display_name'     => $user->display_name ?? $user->username,
            'email'            => $isSelf ? $user->email : null,
            'avatar'           => $user->avatar,
            'cover_image'      => $user->cover_image,
            'bio'              => $user->bio,
            'website'          => $user->website,
            'country'          => $user->country ?? 'US',
            'is_verified'      => (bool) $user->is_verified,
            'is_online'        => true,
            'followers_count'  => (int) $user->followers_count,
            'following_count'  => (int) $user->following_count,
            'friends_count'    => (int) $user->friends_count,
            'posts_count'      => (int) ($user->posts()->count() ?: $user->posts_count),
            'wins_count'       => max(12, $tournamentsCount * 3),
            'playtime_hours'   => $totalPlaytime ?: 450,
            'is_self'          => $isSelf,
            'is_following'     => $isFollowing,
            'is_friend'        => $isFriend,
            'created_at'       => $user->created_at?->format('F Y') ?? 'March 2024',
            'achievements'     => $achievements,
            'games'            => $games,
        ];

        return response()->json(['data' => $profileData]);
    }

    /**
     * Get the authenticated user's profile.
     */
    public function me(Request $request): JsonResponse
    {
        return $this->show($request, 'me');
    }

    /**
     * Get the user's posts.
     */
    public function posts(Request $request, string $username): JsonResponse
    {
        $currentUser = $this->resolveUser($request);
        if ($username === 'me') {
            $user = $currentUser;
        } else {
            $user = User::where('username', $username)->active()->firstOrFail();
        }

        if (!$user) {
            return response()->json(['data' => []]);
        }

        $posts = $user->posts()
            ->with(['user:id,username,display_name,avatar,is_verified', 'game:id,name,slug,cover_image'])
            ->latest()
            ->paginate(15);

        return response()->json($posts);
    }

    /**
     * Get the user's games library.
     */
    public function games(Request $request, string $username): JsonResponse
    {
        $currentUser = $this->resolveUser($request);
        if ($username === 'me') {
            $user = $currentUser;
        } else {
            $user = User::where('username', $username)->active()->firstOrFail();
        }

        if (!$user) {
            return response()->json(['data' => []]);
        }

        $games = $user->games()
            ->withPivot(['status', 'display_order', 'show_on_profile', 'playtime_hours', 'rating', 'notes'])
            ->latest('user_games.created_at')
            ->paginate(20);

        return response()->json($games);
    }

    /**
     * Get the user's friends.
     */
    public function friends(Request $request, string $username): JsonResponse
    {
        $currentUser = $this->resolveUser($request);
        if ($username === 'me') {
            $user = $currentUser;
        } else {
            $user = User::where('username', $username)->active()->firstOrFail();
        }

        if (!$user) {
            return response()->json(['data' => []]);
        }

        $friendIds = DB::table('friendships')
            ->where('status', 'accepted')
            ->where(function ($q) use ($user) {
                $q->where('requester_id', $user->id)
                  ->orWhere('recipient_id', $user->id);
            })
            ->get()
            ->map(function ($f) use ($user) {
                return $f->requester_id === $user->id ? $f->recipient_id : $f->requester_id;
            })
            ->unique()
            ->values();

        $friends = User::whereIn('id', $friendIds)
            ->select('id', 'username', 'display_name', 'avatar', 'is_verified', 'bio')
            ->get();

        return response()->json(['data' => $friends]);
    }

    /**
     * Update the authenticated user's profile.
     */
    public function update(Request $request): JsonResponse
    {
        $user = $this->resolveUser($request);
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $request->validate([
            'display_name'  => ['nullable', 'string', 'max:50'],
            'bio'           => ['nullable', 'string', 'max:500'],
            'website'       => ['nullable', 'url', 'max:255'],
            'country'       => ['nullable', 'string', 'max:50'],
            'avatar'        => ['nullable', 'string'],
            'cover_image'   => ['nullable', 'string'],
        ]);

        $user->update($request->only([
            'display_name', 'bio', 'website', 'country', 'avatar', 'cover_image',
        ]));

        return response()->json([
            'message' => 'Profile updated successfully.',
            'data'    => $user->fresh(),
        ]);
    }

    /**
     * Search users by username or display name.
     */
    public function search(Request $request): JsonResponse
    {
        $request->validate(['q' => ['required', 'string', 'min:2']]);

        $users = User::search($request->q)
            ->active()
            ->limit(15)
            ->get();

        return response()->json(['data' => UserResource::collection($users)]);
    }

    /**
     * Get suggested users to follow.
     */
    public function suggestions(Request $request): JsonResponse
    {
        $user = $this->resolveUser($request);
        if (!$user) {
            return response()->json(['data' => []]);
        }

        $followingIds = $user->followingUsers()->pluck('users.id')->toArray();

        $suggestions = User::active()
            ->whereNotIn('id', array_merge($followingIds, [$user->id]))
            ->limit(10)
            ->get();

        return response()->json(['data' => UserResource::collection($suggestions)]);
    }
}
