<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class NewsSource extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'website_url',
        'feed_url',
        'api_endpoint',
        'feed_type',
        'logo',
        'language',
        'credibility',
        'is_active',
        'allowed_categories',
        'api_key_env',
        'last_fetched_at',
        'fetch_interval_minutes',
    ];

    protected function casts(): array
    {
        return [
            'is_active'              => 'boolean',
            'last_fetched_at'        => 'datetime',
            'allowed_categories'     => 'array',
            'fetch_interval_minutes' => 'integer',
        ];
    }

    public function articles(): HasMany
    {
        return $this->hasMany(NewsArticle::class, 'source_id');
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
