<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MediaResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'           => $this->id,
            'type'         => $this->type,           // image, video, gif
            'url'          => $this->url,
            'thumbnail_url'=> $this->thumbnail_url,
            'width'        => $this->width,
            'height'       => $this->height,
            'duration'     => $this->duration,       // for videos
            'alt_text'     => $this->alt_text,
            'order'        => $this->order,
        ];
    }
}
