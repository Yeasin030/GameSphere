<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Story extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'type',
        'media_path',
        'thumbnail_path',
        'text_content',
        'background_color',
        'font_style',
        'overlays',
        'privacy',
        'duration_seconds',
        'views_count',
        'expires_at',
    ];

    protected function casts(): array
    {
        return [
            'overlays'         => 'array',
            'duration_seconds' => 'integer',
            'views_count'      => 'integer',
            'expires_at'       => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function scopeActive($query)
    {
        return $query->where('expires_at', '>', now());
    }

    public function scopePublic($query)
    {
        return $query->where('privacy', 'public');
    }
}
