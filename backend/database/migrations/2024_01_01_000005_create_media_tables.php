<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Stories (24-hour ephemeral content)
        Schema::create('stories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->enum('type', ['image', 'video', 'text'])->default('image');
            $table->string('media_path')->nullable();
            $table->string('thumbnail_path')->nullable();
            $table->text('text_content')->nullable();
            $table->string('background_color', 20)->nullable()->comment('For text stories');
            $table->string('font_style', 50)->nullable();
            $table->json('overlays')->nullable()->comment('Text/emoji overlays on media');
            $table->enum('privacy', ['public', 'friends', 'followers'])->default('public');
            $table->unsignedInteger('duration_seconds')->nullable()->comment('Video duration');
            $table->unsignedBigInteger('views_count')->default(0);
            $table->timestamp('expires_at')->comment('Created + 24h');
            $table->timestamps();

            $table->index('user_id');
            $table->index('expires_at');
            $table->index(['user_id', 'expires_at']);
        });

        // Story views
        Schema::create('story_views', function (Blueprint $table) {
            $table->id();
            $table->foreignId('story_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('reaction', 50)->nullable();
            $table->text('reply')->nullable();
            $table->timestamp('viewed_at');
            $table->timestamps();

            $table->unique(['story_id', 'user_id']);
            $table->index('story_id');
        });

        // Videos (long-form)
        Schema::create('videos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('game_id')->nullable()->constrained()->nullOnDelete();
            $table->string('title', 255);
            $table->string('slug', 255)->unique();
            $table->text('description')->nullable();
            $table->string('file_path');
            $table->string('thumbnail_path')->nullable();
            $table->string('poster_path')->nullable()->comment('HD thumbnail for embed');
            $table->json('processed_versions')->nullable()->comment('HLS/MP4 variants: 1080p, 720p, 480p, 360p');
            $table->unsignedBigInteger('file_size')->default(0)->comment('Bytes');
            $table->unsignedInteger('duration')->nullable()->comment('Seconds');
            $table->enum('category', [
                'gameplay', 'walkthrough', 'tutorial', 'review',
                'highlights', 'esports', 'tournament', 'guide',
                'funny', 'news', 'other'
            ])->default('gameplay');
            $table->enum('visibility', ['public', 'unlisted', 'private'])->default('public');
            $table->enum('status', ['uploading', 'processing', 'ready', 'failed'])->default('uploading');
            $table->boolean('comments_enabled')->default(true);
            $table->boolean('is_featured')->default(false);
            $table->unsignedBigInteger('views_count')->default(0);
            $table->unsignedBigInteger('likes_count')->default(0);
            $table->unsignedBigInteger('shares_count')->default(0);
            $table->timestamps();
            $table->softDeletes();

            $table->index('user_id');
            $table->index('game_id');
            $table->index('status');
            $table->index('visibility');
            $table->index('category');
            $table->fullText(['title', 'description']);
        });

        // Video views (analytics)
        Schema::create('video_views', function (Blueprint $table) {
            $table->id();
            $table->foreignId('video_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('session_id', 100)->nullable()->comment('Anonymous viewers');
            $table->string('ip_address', 45)->nullable();
            $table->unsignedInteger('watch_duration')->default(0)->comment('Seconds watched');
            $table->boolean('completed')->default(false);
            $table->timestamps();

            $table->index('video_id');
            $table->index('user_id');
        });

        // Reels (short-form vertical video)
        Schema::create('reels', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('game_id')->nullable()->constrained()->nullOnDelete();
            $table->text('caption')->nullable();
            $table->string('audio_name')->nullable()->comment('Original audio or song name');
            $table->string('file_path');
            $table->string('thumbnail_path')->nullable();
            $table->string('compressed_path')->nullable()->comment('720p compressed version');
            $table->unsignedBigInteger('file_size')->default(0);
            $table->unsignedInteger('duration')->nullable()->comment('Max 90 seconds');
            $table->unsignedInteger('width')->nullable();
            $table->unsignedInteger('height')->nullable();
            $table->enum('status', ['uploading', 'processing', 'ready', 'failed'])->default('uploading');
            $table->enum('privacy', ['public', 'friends', 'followers'])->default('public');
            $table->boolean('comments_enabled')->default(true);
            $table->boolean('is_featured')->default(false);
            $table->unsignedBigInteger('views_count')->default(0);
            $table->unsignedBigInteger('likes_count')->default(0);
            $table->unsignedBigInteger('shares_count')->default(0);
            $table->unsignedBigInteger('saves_count')->default(0);
            $table->timestamps();
            $table->softDeletes();

            $table->index('user_id');
            $table->index('game_id');
            $table->index('status');
            $table->index('created_at');
        });

        // Reel views
        Schema::create('reel_views', function (Blueprint $table) {
            $table->id();
            $table->foreignId('reel_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('session_id', 100)->nullable();
            $table->timestamps();

            $table->index('reel_id');
        });

        // Reel likes (separate from post reactions for performance)
        Schema::create('reel_likes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('reel_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['reel_id', 'user_id']);
        });

        // Video likes
        Schema::create('video_likes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('video_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['video_id', 'user_id']);
        });

        // Hashtag ↔ Reel pivot
        Schema::create('hashtag_reel', function (Blueprint $table) {
            $table->foreignId('hashtag_id')->constrained()->cascadeOnDelete();
            $table->foreignId('reel_id')->constrained()->cascadeOnDelete();
            $table->primary(['hashtag_id', 'reel_id']);
        });

        // Hashtag ↔ Video pivot
        Schema::create('hashtag_video', function (Blueprint $table) {
            $table->foreignId('hashtag_id')->constrained()->cascadeOnDelete();
            $table->foreignId('video_id')->constrained()->cascadeOnDelete();
            $table->primary(['hashtag_id', 'video_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('hashtag_video');
        Schema::dropIfExists('hashtag_reel');
        Schema::dropIfExists('video_likes');
        Schema::dropIfExists('reel_likes');
        Schema::dropIfExists('reel_views');
        Schema::dropIfExists('reels');
        Schema::dropIfExists('video_views');
        Schema::dropIfExists('videos');
        Schema::dropIfExists('story_views');
        Schema::dropIfExists('stories');
    }
};
