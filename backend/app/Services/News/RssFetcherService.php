<?php

namespace App\Services\News;

use App\Models\NewsSource;
use App\Models\NewsArticle;
use Carbon\Carbon;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class RssFetcherService
{
    protected DuplicateDetector $duplicateDetector;
    protected GameMatcher $gameMatcher;

    public function __construct(DuplicateDetector $duplicateDetector, GameMatcher $gameMatcher)
    {
        $this->duplicateDetector = $duplicateDetector;
        $this->gameMatcher = $gameMatcher;
    }

    public function fetchSource(NewsSource $source): void
    {
        if (!$source->feed_url) {
            return;
        }

        try {
            $response = Http::timeout(30)->get($source->feed_url);

            if ($response->successful()) {
                $xml = simplexml_load_string($response->body(), 'SimpleXMLElement', LIBXML_NOCDATA);
                
                if ($xml && isset($xml->channel->item)) {
                    foreach ($xml->channel->item as $item) {
                        $this->processItem($source, $item);
                    }
                }
            }

            $source->update(['last_fetched_at' => now()]);
        } catch (\Exception $e) {
            Log::error("Failed to fetch RSS for source {$source->name}: " . $e->getMessage());
        }
    }

    protected function processItem(NewsSource $source, \SimpleXMLElement $item): void
    {
        $title = trim((string) $item->title);
        $link = trim((string) $item->link);
        $description = trim(strip_tags((string) $item->description));
        $pubDate = isset($item->pubDate) ? Carbon::parse((string) $item->pubDate) : now();
        $author = isset($item->author) ? (string) $item->author : null;

        // Hash for duplicate detection
        $contentHash = md5($title . $link);

        if (NewsArticle::where('content_hash', $contentHash)->exists()) {
            return;
        }

        $isDuplicate = $this->duplicateDetector->isDuplicate($title, $source->id);
        
        $article = NewsArticle::create([
            'source_id' => $source->id,
            'title' => Str::limit($title, 500),
            'slug' => Str::slug(Str::limit($title, 100)) . '-' . Str::random(6),
            'summary' => Str::limit($description, 1000),
            'source_url' => $link,
            'author' => $author,
            'content_hash' => $contentHash,
            'is_duplicate' => $isDuplicate,
            'status' => $isDuplicate ? 'draft' : 'published',
            'published_at' => $isDuplicate ? null : now(),
            'source_published_at' => $pubDate,
        ]);

        if (!$isDuplicate) {
            $this->gameMatcher->matchGames($article);
        }
    }
}
