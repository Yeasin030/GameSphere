<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PostResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $userData = $this->whenLoaded('user', fn () => new UserResource($this->user));

        return [
            'id'              => $this->id,
            'type'            => $this->type,
            'content'         => $this->content,
            'visibility'      => $this->privacy,
            'privacy'         => $this->privacy,
            'is_pinned'       => (bool) $this->is_pinned,
            'is_featured'     => false,
            'rank_score'      => (float) $this->rank_score,
            'ranking_score'   => (float) $this->rank_score,
            'likes_count'     => (int) $this->likes_count,
            'reactions_count' => (int) $this->likes_count,
            'comments_count'  => (int) $this->comments_count,
            'shares_count'    => (int) $this->shares_count,
            'views_count'     => (int) $this->views_count,
            'link_url'        => $this->link_url,
            'link_image'      => $this->link_image ? (str_starts_with($this->link_image, 'http') ? $this->link_image : url('storage/' . $this->link_image)) : null,
            'image_url'       => $this->link_image ? (str_starts_with($this->link_image, 'http') ? $this->link_image : url('storage/' . $this->link_image)) : null,
            'created_at'      => $this->created_at?->toIso8601String(),
            'updated_at'      => $this->updated_at?->toIso8601String(),

            'author'          => $userData,
            'user'            => $userData,
            'game'            => $this->whenLoaded('game', fn () => $this->game),

            // Viewer-specific
            'viewer_reaction' => $this->whenLoaded('reactions', fn () => $this->reactions->first()?->type),
            'is_liked'        => $this->whenLoaded('reactions', fn () => $this->reactions->isNotEmpty(), false),
            'is_bookmarked'   => $this->whenLoaded('bookmarks', fn () => $this->bookmarks->isNotEmpty(), false),
            'is_saved'        => $this->whenLoaded('bookmarks', fn () => $this->bookmarks->isNotEmpty(), false),
        ];
    }
}
