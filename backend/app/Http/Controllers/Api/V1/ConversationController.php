<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Conversation;
use App\Events\MessageRead;
use App\Events\TypingEvent;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ConversationController extends Controller
{
    /**
     * List all conversations for the authenticated user.
     */
    public function index(Request $request): JsonResponse
    {
        $conversations = $request->user()->conversations()
            ->with(['users' => function ($query) use ($request) {
                $query->where('users.id', '!=', $request->user()->id)->select('users.id', 'username', 'display_name', 'avatar');
            }])
            ->with('lastMessage')
            ->orderByDesc('updated_at')
            ->paginate(20);

        return response()->json([
            'data' => $conversations->items(),
            'meta' => [
                'current_page' => $conversations->currentPage(),
                'last_page'    => $conversations->lastPage(),
                'total'        => $conversations->total(),
            ],
        ]);
    }

    /**
     * Create a new conversation (or return existing 1-on-1).
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'user_ids' => 'required|array|min:1',
            'user_ids.*' => 'exists:users,id',
            'is_group' => 'boolean',
            'name' => 'nullable|string|max:100',
        ]);

        $userIds = $request->user_ids;
        $userIds[] = $request->user()->id; // Add self
        $userIds = array_unique($userIds);

        if (!$request->is_group && count($userIds) === 2) {
            // Check if 1-on-1 already exists
            $existing = Conversation::where('is_group', false)
                ->whereHas('users', function ($q) use ($userIds) {
                    $q->whereIn('users.id', $userIds);
                }, '=', 2)
                ->first();

            if ($existing) {
                return response()->json(['data' => $existing]);
            }
        }

        DB::beginTransaction();
        try {
            $conversation = Conversation::create([
                'is_group' => $request->is_group ?? false,
                'name' => $request->name,
                'creator_id' => $request->user()->id,
            ]);

            foreach ($userIds as $id) {
                $conversation->users()->attach($id, [
                    'role' => $id === $request->user()->id ? 'admin' : 'member',
                    'joined_at' => now(),
                ]);
            }
            DB::commit();

            return response()->json(['data' => $conversation], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Failed to create conversation.'], 500);
        }
    }

    /**
     * Get a specific conversation.
     */
    public function show(Conversation $conversation, Request $request): JsonResponse
    {
        if (!$conversation->users()->where('users.id', $request->user()->id)->exists()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $conversation->load(['users' => function($q) {
            $q->select('users.id', 'username', 'display_name', 'avatar');
        }]);

        return response()->json(['data' => $conversation]);
    }

    /**
     * Mark conversation as read.
     */
    public function markRead(Conversation $conversation, Request $request): JsonResponse
    {
        if (!$conversation->users()->where('users.id', $request->user()->id)->exists()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $conversation->users()->updateExistingPivot($request->user()->id, [
            'last_read_at' => now(),
        ]);

        broadcast(new MessageRead($conversation->id, $request->user()->id))->toOthers();

        return response()->json(['message' => 'Marked as read.']);
    }

    /**
     * Broadcast typing status.
     */
    public function typing(Conversation $conversation, Request $request): JsonResponse
    {
        $request->validate(['is_typing' => 'required|boolean']);

        if (!$conversation->users()->where('users.id', $request->user()->id)->exists()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        broadcast(new TypingEvent(
            $conversation->id,
            $request->user()->only(['id', 'username', 'display_name', 'avatar']),
            $request->is_typing
        ))->toOthers();

        return response()->json(['message' => 'Typing event broadcasted.']);
    }

    /**
     * Delete/leave conversation.
     */
    public function destroy(Conversation $conversation, Request $request): JsonResponse
    {
        if (!$conversation->users()->where('users.id', $request->user()->id)->exists()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if ($conversation->is_group) {
            $conversation->users()->detach($request->user()->id);
            // Optionally: if no users left, delete conversation.
        } else {
            // For 1-on-1, typically we'd hide it for this user, but simple delete here
            $conversation->delete();
        }

        return response()->json(['message' => 'Conversation removed.']);
    }
}
