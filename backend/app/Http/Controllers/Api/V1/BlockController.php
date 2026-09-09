<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Friendship;
use App\Http\Resources\UserResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BlockController extends Controller
{
    /**
     * Block a user.
     */
    public function block(Request $request, User $user): JsonResponse
    {
        $currentUser = $request->user();

        if ($currentUser->id === $user->id) {
            return response()->json(['message' => 'You cannot block yourself.'], 422);
        }

        // Add to blocked users (assuming a relationship exists on User model)
        if (!$currentUser->blockedUsers()->where('blocked_id', $user->id)->exists()) {
            $currentUser->blockedUsers()->attach($user->id);
            
            // Remove friendship if exists
            Friendship::where(function ($q) use ($currentUser, $user) {
                $q->where('requester_id', $currentUser->id)->where('recipient_id', $user->id);
            })->orWhere(function ($q) use ($currentUser, $user) {
                $q->where('requester_id', $user->id)->where('recipient_id', $currentUser->id);
            })->delete();

            // Unfollow mutually
            $currentUser->followingUsers()->detach($user->id);
            $user->followingUsers()->detach($currentUser->id);
        }

        return response()->json(['message' => "Blocked {$user->username}."]);
    }

    /**
     * Unblock a user.
     */
    public function unblock(Request $request, User $user): JsonResponse
    {
        $currentUser = $request->user();

        $currentUser->blockedUsers()->detach($user->id);

        return response()->json(['message' => "Unblocked {$user->username}."]);
    }

    /**
     * Get list of blocked users.
     */
    public function index(Request $request): JsonResponse
    {
        $blocked = $request->user()->blockedUsers()->paginate(20);

        return response()->json([
            'data' => UserResource::collection($blocked),
            'meta' => ['total' => $blocked->total()],
        ]);
    }

    /**
     * Mute a user (hide from feed).
     */
    public function mute(Request $request, User $user): JsonResponse
    {
        $currentUser = $request->user();

        if ($currentUser->id === $user->id) {
            return response()->json(['message' => 'You cannot mute yourself.'], 422);
        }

        if (!$currentUser->mutedUsers()->where('muted_id', $user->id)->exists()) {
            $currentUser->mutedUsers()->attach($user->id);
        }

        return response()->json(['message' => "Muted {$user->username}."]);
    }

    /**
     * Unmute a user.
     */
    public function unmute(Request $request, User $user): JsonResponse
    {
        $currentUser = $request->user();

        $currentUser->mutedUsers()->detach($user->id);

        return response()->json(['message' => "Unmuted {$user->username}."]);
    }
}
