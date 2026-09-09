<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class GameResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'               => $this->id,
            'slug'             => $this->slug,
            'title'            => $this->name,
            'name'             => $this->name,
            'developer'        => $this->developer,
            'publisher'        => $this->publisher,
            'cover_image'      => $this->cover_image_url ?? $this->cover_image,
            'cover_image_url'  => $this->cover_image_url ?? $this->cover_image,
            'background_image' => $this->background_image_url ?? $this->background_image,
            'banner_image_url' => $this->background_image_url ?? $this->background_image,
            'description'      => $this->description,
            'short_description'=> $this->short_description ?? $this->description,
            'genres'           => $this->genres,
            'platforms'        => $this->platforms,
            'release_date'     => $this->release_date?->toDateString(),
            'rating'           => (float)($this->average_rating ?? 4.8),
            'average_rating'   => (float)($this->average_rating ?? 4.8),
            'players_count'    => (int)($this->players_count ?? 12000),
            'is_featured'      => (bool)$this->is_featured,
            'is_trending'      => (bool)$this->is_trending,
            'is_free'          => (bool)$this->is_free,
            'created_at'       => $this->created_at?->toDateString(),
        ];
    }
}
