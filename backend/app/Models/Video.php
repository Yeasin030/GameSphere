<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Video extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'game_id',
        'title',
        'slug',
        'description',
        'file_path',
        'thumbnail_path',
        'poster_path',
        'processed_versions',
        'file_size',
        'duration',
        'category',
        'visibility',
        'status',
        'comments_enabled',
        'is_featured',
        'views_count',
        'likes_count',
        'shares_count',
    ];

    protected function casts(): array
    {
        return [
            'processed_versions' => 'array',
            'file_size'          => 'integer',
            'duration'           => 'integer',
            'comments_enabled'   => 'boolean',
            'is_featured'        => 'boolean',
            'views_count'        => 'integer',
            'likes_count'        => 'integer',
            'shares_count'       => 'integer',
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
        return $this->belongsToMany(User::class, 'video_likes')
            ->withTimestamps();
    }

    public function hashtags(): BelongsToMany
    {
        return $this->belongsToMany(Hashtag::class, 'hashtag_video');
    }

    public function scopePublic($query)
    {
        return $query->where('visibility', 'public');
    }

    public function scopeReady($query)
    {
        return $query->where('status', 'ready');
    }
}
