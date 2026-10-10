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
            $response = Http::withHeaders([
                'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept' => 'application/rss+xml, application/xml, application/atom+xml, text/xml, text/html, */*;q=0.9',
            ])->timeout(30)->get($source->feed_url);

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

        $imageUrl = null;

        // 1. Try media namespace (<media:content> or <media:thumbnail>)
        $namespaces = $item->getNamespaces(true);
        if (isset($namespaces['media'])) {
            $media = $item->children($namespaces['media']);
            if (isset($media->content)) {
                $attrs = $media->content->attributes();
                if (isset($attrs['url'])) {
                    $imageUrl = (string) $attrs['url'];
                }
            }
            if (!$imageUrl && isset($media->thumbnail)) {
                $attrs = $media->thumbnail->attributes();
                if (isset($attrs['url'])) {
                    $imageUrl = (string) $attrs['url'];
                }
            }
        }

        // 2. Try <enclosure>
        if (!$imageUrl && isset($item->enclosure)) {
            foreach ($item->enclosure as $enclosure) {
                $attrs = $enclosure->attributes();
                if (isset($attrs['type']) && str_starts_with((string)$attrs['type'], 'image/') && isset($attrs['url'])) {
                    $imageUrl = (string) $attrs['url'];
                    break;
                }
            }
        }

        // 3. Try parsing description or content for <img> tag
        if (!$imageUrl) {
            $htmlContent = (string) $item->description;
            if (isset($namespaces['content'])) {
                $content = $item->children($namespaces['content']);
                if (isset($content->encoded)) {
                    $htmlContent .= ' ' . (string) $content->encoded;
                }
            }
            if (preg_match('/<img[^>]+src=[\'"]([^\'"]+)[\'"][^>]*>/i', $htmlContent, $matches)) {
                $imageUrl = $matches[1];
            }
        }

        $tags = [];
        
        // 4. Try extracting <category> tags
        if (isset($item->category)) {
            foreach ($item->category as $cat) {
                $tags[] = (string) $cat;
            }
        }

        // 5. Auto-tag based on keywords in title and description
        $textForTagging = strtolower($title . ' ' . $description);
        $platforms = [
            'pc' => ['pc ', 'steam', 'epic games', 'windows'],
            'xbox' => ['xbox', 'series x', 'series s', 'game pass'],
            'playstation' => ['playstation', 'ps4', 'ps5', 'sony'],
            'mobile' => ['mobile', 'ios', 'android', 'smartphone'],
            'esports' => ['esports', 'tournament', 'championship', 'vct', 'lcs', 'lec', 'worlds'],
        ];

        foreach ($platforms as $platformName => $keywords) {
            foreach ($keywords as $keyword) {
                if (str_contains($textForTagging, $keyword)) {
                    $tags[] = $platformName;
                    break;
                }
            }
        }

        $tags = array_values(array_unique(array_filter($tags)));

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
            'image_url' => $imageUrl,
            'author' => $author,
            'tags' => empty($tags) ? null : $tags,
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
