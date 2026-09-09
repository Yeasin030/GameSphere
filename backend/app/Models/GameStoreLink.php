<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GameStoreLink extends Model
{
    protected $fillable = [
        'game_id',
        'platform_id',
        'store',
        'url',
        'price',
        'is_free',
        'is_available',
    ];

    protected function casts(): array
    {
        return [
            'is_free'      => 'boolean',
            'is_available' => 'boolean',
            'price'        => 'float',
        ];
    }

    public function game(): BelongsTo
    {
        return $this->belongsTo(Game::class);
    }

    public function platform(): BelongsTo
    {
        return $this->belongsTo(Platform::class);
    }
}
