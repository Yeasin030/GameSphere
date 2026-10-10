<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class NewsArticle extends Model
{
    use HasFactory, SoftDeletes;


    protected $fillable = [
        'source_id',
        'game_id',
        'category_id',
        'title',
        'slug',
        'summary',
        'ai_summary',
        'source_url',
        'image_url',
        'image_credit',
        'author',
        'tags',
        'status',
        'is_featured',
        'is_breaking',
        'is_duplicate',
        'content_hash',
        'views_count',
        'saves_count',
        'published_at',
        'source_published_at',
    ];

    protected function casts(): array
    {
        return [
            'tags'                => 'array',
            'is_featured'         => 'boolean',
            'is_breaking'         => 'boolean',
            'is_duplicate'        => 'boolean',
            'views_count'         => 'integer',
            'saves_count'         => 'integer',
            'published_at'        => 'datetime',
            'source_published_at' => 'datetime',
        ];
    }

    public function source(): BelongsTo
    {
        return $this->belongsTo(NewsSource::class, 'source_id');
    }

    public function game(): BelongsTo
    {
        return $this->belongsTo(Game::class, 'game_id');
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(NewsCategory::class, 'category_id');
    }

    public function savedByUsers(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'saved_news', 'article_id', 'user_id')
            ->withTimestamps();
    }

    public function scopePublished($query)
    {
        return $query->where('status', 'published');
    }

    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }
}
