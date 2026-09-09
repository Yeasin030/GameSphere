<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserNotificationPreference extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'notify_likes',
        'notify_comments',
        'notify_follows',
        'notify_friend_requests',
        'notify_messages',
        'notify_group_invites',
        'notify_tournament_updates',
        'notify_mentions',
        'notify_achievements',
        'notify_news',
    ];

    protected $casts = [
        'notify_likes' => 'boolean',
        'notify_comments' => 'boolean',
        'notify_follows' => 'boolean',
        'notify_friend_requests' => 'boolean',
        'notify_messages' => 'boolean',
        'notify_group_invites' => 'boolean',
        'notify_tournament_updates' => 'boolean',
        'notify_mentions' => 'boolean',
        'notify_achievements' => 'boolean',
        'notify_news' => 'boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
