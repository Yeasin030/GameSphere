<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserPrivacySetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'profile_visibility',
        'posts_visibility',
        'friends_visibility',
        'show_online_status',
        'friend_requests_from',
        'messages_from',
        'games_visibility',
        'allow_search_indexing',
        'allow_tagging',
        'tag_approval',
    ];

    protected $casts = [
        'show_online_status' => 'boolean',
        'allow_search_indexing' => 'boolean',
        'allow_tagging' => 'boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
