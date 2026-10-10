<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Post extends Model
{
    use HasFactory, SoftDeletes;


    protected $fillable = [
        'user_id',
        'game_id',
        'content',
        'type',
        'privacy',
        'link_url',
        'link_title',
        'link_description',
        'link_image',
        'repost_id',
        'is_pinned',
        'comments_enabled',
        'is_hidden',
        'is_reported',
        'likes_count',
        'comments_count',
        'shares_count',
        'saves_count',
        'views_count',
        'rank_score',
        'edited_at',
    ];

    protected function casts(): array
    {
        return [
            'is_pinned'        => 'boolean',
            'comments_enabled' => 'boolean',
            'is_hidden'        => 'boolean',
            'is_reported'      => 'boolean',
            'likes_count'      => 'integer',
            'comments_count'   => 'integer',
            'shares_count'     => 'integer',
            'saves_count'      => 'integer',
            'views_count'      => 'integer',
            'rank_score'       => 'float',
            'edited_at'        => 'datetime',
        ];
    }

    // ─── Attribute Accessor Aliases ──────────────────────────────────
    public function getVisibilityAttribute(): string
    {
        return $this->privacy ?? 'public';
    }

    public function setVisibilityAttribute(?string $value): void
    {
        $this->attributes['privacy'] = $value ?: 'public';
    }

    public function getRankingScoreAttribute(): float
    {
        return (float) ($this->rank_score ?? 0);
    }

    public function setRankingScoreAttribute($value): void
    {
        $this->attributes['rank_score'] = $value;
    }

    public function getReactionsCountAttribute(): int
    {
        return (int) ($this->likes_count ?? 0);
    }

    public function setReactionsCountAttribute($value): void
    {
        $this->attributes['likes_count'] = $value;
    }

    // ─── Relationships ──────────────────────────────────────────────

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function game(): BelongsTo
    {
        return $this->belongsTo(Game::class);
    }

    public function repost(): BelongsTo
    {
        return $this->belongsTo(Post::class, 'repost_id');
    }

    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class);
    }

    public function topLevelComments(): HasMany
    {
        return $this->hasMany(Comment::class)->whereNull('parent_id')->latest();
    }

    public function reactions(): HasMany
    {
        return $this->hasMany(PostReaction::class);
    }

    public function bookmarks(): HasMany
    {
        return $this->hasMany(Bookmark::class);
    }

    // ─── Scopes ─────────────────────────────────────────────────────

    public function scopePublic($query)
    {
        return $query->where('privacy', 'public')->where('is_hidden', false);
    }

    public function scopeVisible($query, ?User $viewer = null)
    {
        if (! $viewer) {
            return $query->where('privacy', 'public')->where('is_hidden', false);
        }

        return $query->where('is_hidden', false)->where(function ($q) use ($viewer) {
            $q->where('privacy', 'public')
              ->orWhere(function ($q2) use ($viewer) {
                  $q2->where('privacy', 'followers')
                     ->whereIn('user_id', $viewer->followingUsers()->pluck('users.id'));
              })
              ->orWhere('user_id', $viewer->id);
        });
    }

    public function scopeForFeed($query)
    {
        return $query->with(['user', 'game'])
            ->orderByDesc('rank_score')
            ->orderByDesc('created_at');
    }

    public function scopeWithViewerContext($query, ?User $viewer = null)
    {
        if (! $viewer) {
            return $query;
        }

        return $query->with([
            'reactions' => fn ($q) => $q->where('user_id', $viewer->id),
            'bookmarks' => fn ($q) => $q->where('user_id', $viewer->id),
        ]);
    }
}
