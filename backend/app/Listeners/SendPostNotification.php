<?php

namespace App\Listeners;

use App\Events\PostCreated;
use App\Models\Notification;
use App\Models\Friendship;
use Illuminate\Contracts\Queue\ShouldQueue;

class SendPostNotification implements ShouldQueue
{
    public function handle(PostCreated $event): void
    {
        $post = $event->post;
        $user = $post->user;

        // Find friends to notify
        $friendships = Friendship::where('status', 'accepted')
            ->where(function ($q) use ($user) {
                $q->where('requester_id', $user->id)->orWhere('recipient_id', $user->id);
            })->get();

        $friendIds = $friendships->map(function ($f) use ($user) {
            return $f->requester_id === $user->id ? $f->recipient_id : $f->requester_id;
        });

        foreach ($friendIds as $friendId) {
            Notification::create([
                'user_id' => $friendId,
                'type' => 'post_created',
                'data' => [
                    'post_id' => $post->id,
                    'message' => "{$user->username} published a new post.",
                ],
            ]);
        }
    }
}
