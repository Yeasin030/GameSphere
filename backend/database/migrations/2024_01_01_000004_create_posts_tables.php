<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Hashtags
        Schema::create('hashtags', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100)->unique();
            $table->string('slug', 100)->unique();
            $table->unsignedBigInteger('posts_count')->default(0);
            $table->unsignedBigInteger('weekly_posts_count')->default(0)->comment('For trending');
            $table->timestamp('trending_since')->nullable();
            $table->timestamps();

            // $table->fullText('name');
        });

        // Posts
        Schema::create('posts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('game_id')->nullable()->constrained()->nullOnDelete();
            $table->text('content')->nullable();
            $table->enum('type', [
                'text', 'image', 'video', 'reel', 'game_activity',
                'tournament', 'news_share', 'link', 'repost'
            ])->default('text');
            $table->enum('privacy', ['public', 'friends', 'followers', 'only_me'])->default('public');
            $table->string('link_url')->nullable();
            $table->string('link_title')->nullable();
            $table->string('link_description')->nullable();
            $table->string('link_image')->nullable();
            $table->foreignId('repost_id')->nullable()->constrained('posts')->nullOnDelete();
            $table->boolean('is_pinned')->default(false);
            $table->boolean('comments_enabled')->default(true);
            $table->boolean('is_hidden')->default(false)->comment('Admin hide');
            $table->boolean('is_reported')->default(false);
            $table->unsignedBigInteger('likes_count')->default(0);
            $table->unsignedBigInteger('comments_count')->default(0);
            $table->unsignedBigInteger('shares_count')->default(0);
            $table->unsignedBigInteger('saves_count')->default(0);
            $table->unsignedBigInteger('views_count')->default(0);
            $table->decimal('rank_score', 10, 4)->default(0)->comment('FeedRankingService score');
            $table->timestamp('edited_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index('user_id');
            $table->index('game_id');
            $table->index('type');
            $table->index('privacy');
            $table->index(['is_hidden', 'deleted_at', 'created_at']);
            $table->index('rank_score');
            // $table->fullText('content');
        });

        // Post media attachments
        Schema::create('post_media', function (Blueprint $table) {
            $table->id();
            $table->foreignId('post_id')->constrained()->cascadeOnDelete();
            $table->enum('type', ['image', 'video', 'audio'])->default('image');
            $table->string('file_path');
            $table->string('thumbnail_path')->nullable();
            $table->string('mime_type', 100);
            $table->unsignedBigInteger('file_size')->comment('Bytes');
            $table->unsignedInteger('width')->nullable();
            $table->unsignedInteger('height')->nullable();
            $table->unsignedInteger('duration')->nullable()->comment('Seconds for video/audio');
            $table->string('alt_text')->nullable();
            $table->unsignedTinyInteger('sort_order')->default(0);
            $table->enum('status', ['pending', 'processing', 'ready', 'failed'])->default('pending');
            $table->json('processing_metadata')->nullable();
            $table->timestamps();

            $table->index('post_id');
            $table->index('status');
        });

        // Post ↔ Hashtag pivot
        Schema::create('hashtag_post', function (Blueprint $table) {
            $table->foreignId('hashtag_id')->constrained()->cascadeOnDelete();
            $table->foreignId('post_id')->constrained()->cascadeOnDelete();
            $table->primary(['hashtag_id', 'post_id']);
        });

        // Mentions
        Schema::create('mentions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete()->comment('Mentioned user');
            $table->morphs('mentionable'); // Post, Comment, Story, etc.
            $table->foreignId('mentioned_by')->constrained('users')->cascadeOnDelete();
            $table->timestamps();

            $table->index('user_id');
        });

        // Post reactions (like, love, fire, wow, haha, sad, angry)
        Schema::create('post_reactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('post_id')->constrained()->cascadeOnDelete();
            $table->enum('type', ['like', 'love', 'fire', 'wow', 'haha', 'sad', 'angry'])->default('like');
            $table->timestamps();

            $table->unique(['user_id', 'post_id']);
            $table->index('post_id');
        });

        // Comments
        Schema::create('comments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('post_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('parent_id')->nullable()->constrained('comments')->cascadeOnDelete();
            $table->text('content');
            $table->string('media_path')->nullable();
            $table->unsignedBigInteger('likes_count')->default(0);
            $table->unsignedBigInteger('replies_count')->default(0);
            $table->boolean('is_hidden')->default(false);
            $table->timestamp('edited_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index('post_id');
            $table->index('user_id');
            $table->index('parent_id');
        });

        // Comment reactions
        Schema::create('comment_reactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('comment_id')->constrained()->cascadeOnDelete();
            $table->enum('type', ['like', 'love', 'fire', 'wow', 'haha', 'sad', 'angry'])->default('like');
            $table->timestamps();

            $table->unique(['user_id', 'comment_id']);
        });

        // Post shares
        Schema::create('shares', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('post_id')->constrained()->cascadeOnDelete();
            $table->text('content')->nullable()->comment('Optional share comment');
            $table->enum('privacy', ['public', 'friends', 'followers', 'only_me'])->default('public');
            $table->timestamps();

            $table->unique(['user_id', 'post_id']);
        });

        // Saved posts
        Schema::create('saved_posts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('post_id')->constrained()->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['user_id', 'post_id']);
            $table->index('user_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('saved_posts');
        Schema::dropIfExists('shares');
        Schema::dropIfExists('comment_reactions');
        Schema::dropIfExists('comments');
        Schema::dropIfExists('post_reactions');
        Schema::dropIfExists('mentions');
        Schema::dropIfExists('hashtag_post');
        Schema::dropIfExists('post_media');
        Schema::dropIfExists('posts');
        Schema::dropIfExists('hashtags');
    }
};
