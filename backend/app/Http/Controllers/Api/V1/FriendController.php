<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Friendship;
use App\Http\Resources\UserResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FriendController extends Controller
{

    /**
     * Send a friend request.
     */
    public function sendRequest(Request $request, User $user): JsonResponse
    {
        $currentUser = $request->user();

        if ($currentUser->id === $user->id) {
            return response()->json(['message' => 'Cannot add yourself as a friend.'], 422);
        }

        if ($currentUser->hasBlocked($user) || $user->hasBlocked($currentUser)) {
            return response()->json(['message' => 'Unable to send friend request.'], 403);
        }

        $existing = Friendship::where(function ($q) use ($currentUser, $user) {
            $q->where('requester_id', $currentUser->id)->where('recipient_id', $user->id);
        })->orWhere(function ($q) use ($currentUser, $user) {
            $q->where('requester_id', $user->id)->where('recipient_id', $currentUser->id);
        })->first();

        if ($existing) {
            if ($existing->status === 'accepted') {
                return response()->json(['message' => 'Already friends.'], 409);
            }
            if ($existing->status === 'pending') {
                return response()->json(['message' => 'Friend request already sent.'], 409);
            }
            if ($existing->status === 'declined') {
                // If previously declined, update to pending again
                $existing->update(['status' => 'pending', 'requester_id' => $currentUser->id, 'recipient_id' => $user->id]);
                return response()->json(['message' => 'Friend request sent.']);
            }
        }

        Friendship::create([
            'requester_id' => $currentUser->id,
            'recipient_id' => $user->id,
            'status'       => 'pending',
        ]);

        return response()->json(['message' => 'Friend request sent.']);
    }

    /**
     * Accept a friend request.
     */
    public function accept(Request $request, Friendship $friendship): JsonResponse
    {
        if ($friendship->recipient_id !== $request->user()->id || $friendship->status !== 'pending') {
            return response()->json(['message' => 'Unauthorized or invalid request.'], 403);
        }

        $friendship->update(['status' => 'accepted']);

        return response()->json(['message' => 'Friend request accepted.']);
    }

    /**
     * Reject a friend request.
     */
    public function reject(Request $request, Friendship $friendship): JsonResponse
    {
        if ($friendship->recipient_id !== $request->user()->id || $friendship->status !== 'pending') {
            return response()->json(['message' => 'Unauthorized or invalid request.'], 403);
        }

        $friendship->update(['status' => 'declined']);

        return response()->json(['message' => 'Friend request rejected.']);
    }

    /**
     * Remove a friend.
     */
    public function remove(Request $request, User $user): JsonResponse
    {
        $currentUser = $request->user();

        Friendship::where(function ($q) use ($currentUser, $user) {
            $q->where('requester_id', $currentUser->id)->where('recipient_id', $user->id);
        })->orWhere(function ($q) use ($currentUser, $user) {
            $q->where('requester_id', $user->id)->where('recipient_id', $currentUser->id);
        })->delete();

        return response()->json(['message' => 'Friend removed.']);
    }

    /**
     * Get friend list.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        // Get friend IDs
        $friendships = Friendship::where('status', 'accepted')
            ->where(function ($q) use ($user) {
                $q->where('requester_id', $user->id)->orWhere('recipient_id', $user->id);
            })->get();

        $friendIds = $friendships->map(function ($f) use ($user) {
            return $f->requester_id === $user->id ? $f->recipient_id : $f->requester_id;
        });

        $friends = User::whereIn('id', $friendIds)->paginate(20);

        return response()->json([
            'data' => UserResource::collection($friends),
            'meta' => ['total' => $friends->total()],
        ]);
    }

    /**
     * Get pending friend requests.
     */
    public function requests(Request $request): JsonResponse
    {
        $user = $request->user();

        $requests = Friendship::where('recipient_id', $user->id)
            ->where('status', 'pending')
            ->with('requester')
            ->paginate(20);

        // Map to users
        $users = $requests->map(fn($req) => $req->requester);

        return response()->json([
            'data' => UserResource::collection($users),
            'meta' => ['total' => $requests->total()],
        ]);
    }

    /**
     * Get friend suggestions.
     */
    public function suggestions(Request $request): JsonResponse
    {
        $user = $request->user();

        $friendships = Friendship::where('status', 'accepted')
            ->where(function ($q) use ($user) {
                $q->where('requester_id', $user->id)->orWhere('recipient_id', $user->id);
            })->get();
            
        $friendIds = $friendships->map(function ($f) use ($user) {
            return $f->requester_id === $user->id ? $f->recipient_id : $f->requester_id;
        })->toArray();
        $friendIds[] = $user->id; // Exclude self

        $suggestions = User::whereNotIn('id', $friendIds)
            ->active()
            ->limit(10)
            ->get();
            
        return response()->json([
            'data' => UserResource::collection($suggestions)
        ]);
    }
}
