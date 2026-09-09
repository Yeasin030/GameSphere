<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Conversation;
use App\Models\Message;
use App\Events\MessageSent;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MessageController extends Controller
{
    /**
     * Get messages for a conversation.
     */
    public function index(Conversation $conversation, Request $request): JsonResponse
    {
        if (!$conversation->users()->where('users.id', $request->user()->id)->exists()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $messages = $conversation->messages()
            ->with(['sender' => function($q) {
                $q->select('id', 'username', 'display_name', 'avatar');
            }])
            ->latest()
            ->paginate(30);

        return response()->json([
            'data' => $messages->items(),
            'meta' => [
                'current_page' => $messages->currentPage(),
                'last_page'    => $messages->lastPage(),
                'total'        => $messages->total(),
            ],
        ]);
    }

    /**
     * Send a message in a conversation.
     */
    public function store(Conversation $conversation, Request $request): JsonResponse
    {
        if (!$conversation->users()->where('users.id', $request->user()->id)->exists()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'content' => 'required_without_all:attachment|string',
            'attachment' => 'nullable|file|max:10240', // 10MB
        ]);

        $message = $conversation->messages()->create([
            'sender_id' => $request->user()->id,
            'content' => $request->content,
            'type' => $request->hasFile('attachment') ? 'media' : 'text',
        ]);

        if ($request->hasFile('attachment')) {
            // Handle file upload
            $path = $request->file('attachment')->store('messages', 'public');
            $message->update(['attachment_url' => \Storage::url($path)]);
        }

        $conversation->update(['last_message_at' => now()]);

        $message->load('sender');
        broadcast(new MessageSent($message))->toOthers();

        return response()->json(['data' => $message], 201);
    }

    /**
     * Update a message (edit).
     */
    public function update(Message $message, Request $request): JsonResponse
    {
        if ($message->sender_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate(['content' => 'required|string']);

        $message->update([
            'content' => $request->content,
            'is_edited' => true,
        ]);

        return response()->json(['data' => $message]);
    }

    /**
     * Delete a message.
     */
    public function destroy(Message $message, Request $request): JsonResponse
    {
        if ($message->sender_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $message->delete();

        return response()->json(['message' => 'Message deleted.']);
    }

    /**
     * React to a message.
     */
    public function react(Message $message, Request $request): JsonResponse
    {
        $request->validate(['reaction' => 'required|string|max:10']);

        // Assuming a JSON column for reactions for simplicity
        $reactions = $message->reactions ?? [];
        $reactions[$request->user()->id] = $request->reaction;
        $message->update(['reactions' => $reactions]);

        return response()->json(['data' => $message]);
    }

    /**
     * Forward a message.
     */
    public function forward(Message $message, Request $request): JsonResponse
    {
        $request->validate(['conversation_id' => 'required|exists:conversations,id']);

        $targetConversation = Conversation::findOrFail($request->conversation_id);

        if (!$targetConversation->users()->where('users.id', $request->user()->id)->exists()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $newMessage = $targetConversation->messages()->create([
            'sender_id' => $request->user()->id,
            'content' => $message->content,
            'type' => $message->type,
            'attachment_url' => $message->attachment_url,
            'is_forwarded' => true,
        ]);

        return response()->json(['data' => $newMessage], 201);
    }
}
