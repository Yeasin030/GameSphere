<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Sluggable\HasSlug;
use Spatie\Sluggable\SlugOptions;

class Game extends Model
{
    use HasFactory, SoftDeletes, HasSlug;

    protected $fillable = [
        'name', 'slug', 'description', 'short_description', 'cover_image',
        'background_image', 'screenshots', 'trailer_url', 'developer',
        'publisher', 'release_date', 'age_rating', 'is_multiplayer',
        'is_online_multiplayer', 'is_free', 'official_website', 'is_featured',
        'is_trending', 'rawg_id', 'igdb_id', 'is_active',
    ];

    protected function casts(): array
    {
        return [
            'screenshots'           => 'array',
            'is_multiplayer'        => 'boolean',
            'is_online_multiplayer' => 'boolean',
            'is_free'               => 'boolean',
            'is_featured'           => 'boolean',
            'is_trending'           => 'boolean',
            'is_early_access'       => 'boolean',
            'has_battle_pass'       => 'boolean',
            'is_active'             => 'boolean',
            'release_date'          => 'date',
            'players_count'         => 'integer',
            'average_rating'        => 'float',
        ];
    }

    public function getSlugOptions(): SlugOptions
    {
        return SlugOptions::create()
            ->generateSlugsFrom('name')
            ->saveSlugsTo('slug');
    }

    // ─── Relationships ──────────────────────────────────────────────

    public function platforms(): BelongsToMany
    {
        return $this->belongsToMany(Platform::class, 'game_platform');
    }

    public function genres(): BelongsToMany
    {
        return $this->belongsToMany(Genre::class, 'game_genre');
    }

    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(GameTag::class, 'game_tag');
    }

    public function storeLinks(): HasMany
    {
        return $this->hasMany(GameStoreLink::class);
    }

    public function trackedByUsers(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'user_games')
            ->withPivot(['status', 'display_order', 'rating']);
    }

    public function posts(): HasMany
    {
        return $this->hasMany(Post::class);
    }

    public function tournaments(): HasMany
    {
        return $this->hasMany(Tournament::class);
    }

    public function newsArticles(): HasMany
    {
        return $this->hasMany(NewsArticle::class);
    }

    // ─── Scopes ─────────────────────────────────────────────────────

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }

    public function scopeTrending($query)
    {
        return $query->where('is_trending', true)->orderByDesc('players_count');
    }

    public function scopeSearch($query, string $term)
    {
        return $query->where('name', 'LIKE', "%{$term}%")
                     ->orWhere('developer', 'LIKE', "%{$term}%")
                     ->orWhere('publisher', 'LIKE', "%{$term}%");
    }

    public function scopeForPlatform($query, int $platformId)
    {
        return $query->whereHas('platforms', fn ($q) => $q->where('platforms.id', $platformId));
    }

    public function scopeForGenre($query, int $genreId)
    {
        return $query->whereHas('genres', fn ($q) => $q->where('genres.id', $genreId));
    }

    public function getCoverImageUrlAttribute(): ?string
    {
        if (!$this->cover_image) return null;
        if (str_starts_with($this->cover_image, 'http') || str_starts_with($this->cover_image, '/')) {
            return $this->cover_image;
        }
        return url('storage/' . $this->cover_image);
    }

    public function getBackgroundImageUrlAttribute(): ?string
    {
        if (!$this->background_image) return null;
        if (str_starts_with($this->background_image, 'http') || str_starts_with($this->background_image, '/')) {
            return $this->background_image;
        }
        return url('storage/' . $this->background_image);
    }
}
