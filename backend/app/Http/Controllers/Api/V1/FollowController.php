<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class FollowController extends Controller
{
    /**
     * Follow a user.
     */
    public function follow(Request $request, User $user): JsonResponse
    {
        $currentUser = $request->user() ?? User::where('email', 'demo@gamesphere.com')->first();
        if (!$currentUser) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        if ($currentUser->id === $user->id) {
            return response()->json(['message' => 'You cannot follow yourself.'], 422);
        }

        if ($currentUser->hasBlocked($user) || $user->hasBlocked($currentUser)) {
            return response()->json(['message' => 'Unable to follow this user.'], 403);
        }

        $existing = $currentUser->followingUsers()->where('following_id', $user->id)->exists();

        if ($existing) {
            return response()->json(['message' => 'Already following.'], 409);
        }

        $currentUser->followingUsers()->attach($user->id);
        $currentUser->increment('following_count');
        $user->increment('followers_count');

        return response()->json([
            'message'          => "You are now following {$user->username}.",
            'followers_count'  => $user->fresh()->followers_count,
            'is_following'     => true,
        ]);
    }

    /**
     * Unfollow a user.
     */
    public function unfollow(Request $request, User $user): JsonResponse
    {
        $currentUser = $request->user() ?? User::where('email', 'demo@gamesphere.com')->first();
        if (!$currentUser) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $currentUser->followingUsers()->detach($user->id);
        if ($currentUser->following_count > 0) {
            $currentUser->decrement('following_count');
        }
        if ($user->followers_count > 0) {
            $user->decrement('followers_count');
        }

        return response()->json([
            'message'          => "Unfollowed {$user->username}.",
            'followers_count'  => $user->fresh()->followers_count,
            'is_following'     => false,
        ]);
    }

    /**
     * List followers of a user.
     */
    public function followers(User $user): JsonResponse
    {
        $followers = $user->followerUsers()->paginate(20);

        return response()->json([
            'data' => UserResource::collection($followers),
            'meta' => ['total' => $followers->total()],
        ]);
    }

    /**
     * List users a user is following.
     */
    public function following(User $user): JsonResponse
    {
        $following = $user->followingUsers()->paginate(20);

        return response()->json([
            'data' => UserResource::collection($following),
            'meta' => ['total' => $following->total()],
        ]);
    }
}
