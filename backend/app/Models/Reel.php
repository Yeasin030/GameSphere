<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Reel extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'game_id',
        'caption',
        'audio_name',
        'file_path',
        'thumbnail_path',
        'compressed_path',
        'file_size',
        'duration',
        'width',
        'height',
        'status',
        'privacy',
        'comments_enabled',
        'is_featured',
        'views_count',
        'likes_count',
        'shares_count',
        'saves_count',
    ];

    protected function casts(): array
    {
        return [
            'file_size'        => 'integer',
            'duration'         => 'integer',
            'width'            => 'integer',
            'height'           => 'integer',
            'comments_enabled' => 'boolean',
            'is_featured'      => 'boolean',
            'views_count'      => 'integer',
            'likes_count'      => 'integer',
            'shares_count'     => 'integer',
            'saves_count'      => 'integer',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function game(): BelongsTo
    {
        return $this->belongsTo(Game::class);
    }

    public function likedByUsers(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'reel_likes')
            ->withTimestamps();
    }

    public function hashtags(): BelongsToMany
    {
        return $this->belongsToMany(Hashtag::class, 'hashtag_reel');
    }

    public function scopeReady($query)
    {
        return $query->where('status', 'ready');
    }

    public function scopePublic($query)
    {
        return $query->where('privacy', 'public');
    }
}
