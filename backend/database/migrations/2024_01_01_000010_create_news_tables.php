<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // News sources (approved RSS/API sources)
        Schema::create('news_sources', function (Blueprint $table) {
            $table->id();
            $table->string('name', 255);
            $table->string('slug', 255)->unique();
            $table->string('website_url', 2048);
            $table->string('feed_url', 2048)->nullable()->comment('RSS/Atom feed URL');
            $table->string('api_endpoint', 2048)->nullable()->comment('REST API endpoint');
            $table->enum('feed_type', ['rss', 'atom', 'api', 'scraper'])->default('rss');
            $table->string('logo')->nullable();
            $table->string('language', 10)->default('en');
            $table->enum('credibility', ['official', 'major', 'community', 'blog'])->default('major');
            $table->boolean('is_active')->default(true);
            $table->json('allowed_categories')->nullable()->comment('Filter to these categories only');
            $table->string('api_key_env', 100)->nullable()->comment('Env var name holding the API key');
            $table->timestamp('last_fetched_at')->nullable();
            $table->unsignedInteger('fetch_interval_minutes')->default(60);
            $table->timestamps();
        });

        // News categories
        Schema::create('news_categories', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100)->unique();
            $table->string('slug', 100)->unique();
            $table->string('icon')->nullable();
            $table->string('color', 20)->nullable();
            $table->unsignedTinyInteger('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // News articles
        Schema::create('news_articles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('source_id')->constrained('news_sources')->cascadeOnDelete();
            $table->foreignId('game_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('category_id')->nullable()->constrained('news_categories')->nullOnDelete();
            $table->string('title', 500);
            $table->string('slug', 500)->unique();
            $table->text('summary')->comment('Short summary - never full article body for copyright reasons');
            $table->text('ai_summary')->nullable()->comment('AI-generated additional summary');
            $table->string('source_url', 2048)->comment('Always link to original article');
            $table->string('image_url')->nullable();
            $table->string('image_credit')->nullable()->comment('Image attribution');
            $table->string('author', 255)->nullable();
            $table->json('tags')->nullable();
            $table->enum('status', ['draft', 'pending_review', 'published', 'rejected'])->default('draft');
            $table->boolean('is_featured')->default(false);
            $table->boolean('is_breaking')->default(false);
            $table->boolean('is_duplicate')->default(false)->comment('Duplicate detector flag');
            $table->string('content_hash', 64)->nullable()->comment('For duplicate detection');
            $table->unsignedBigInteger('views_count')->default(0);
            $table->unsignedBigInteger('saves_count')->default(0);
            $table->timestamp('published_at')->nullable();
            $table->timestamp('source_published_at')->nullable()->comment('Original article publish time');
            $table->timestamps();
            $table->softDeletes();

            $table->index('source_id');
            $table->index('game_id');
            $table->index('category_id');
            $table->index('status');
            $table->index('published_at');
            $table->index('is_featured');
            $table->index('is_breaking');
            // $table->fullText(['title', 'summary']);
        });

        // Saved news articles
        Schema::create('saved_news', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('article_id')->constrained('news_articles')->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['user_id', 'article_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('saved_news');
        Schema::dropIfExists('news_articles');
        Schema::dropIfExists('news_categories');
        Schema::dropIfExists('news_sources');
    }
};
