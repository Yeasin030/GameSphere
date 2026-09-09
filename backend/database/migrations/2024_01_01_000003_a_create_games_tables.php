<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Gaming platforms (PC, PS5, Xbox, etc.)
        Schema::create('platforms', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100)->unique();
            $table->string('slug', 100)->unique();
            $table->string('icon')->nullable();
            $table->string('color', 20)->nullable()->comment('Brand color hex');
            $table->boolean('is_mobile')->default(false);
            $table->boolean('is_active')->default(true);
            $table->unsignedTinyInteger('sort_order')->default(0);
            $table->timestamps();
        });

        // Game genres
        Schema::create('genres', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100)->unique();
            $table->string('slug', 100)->unique();
            $table->string('icon')->nullable();
            $table->timestamps();
        });

        // Games (central game database)
        Schema::create('games', function (Blueprint $table) {
            $table->id();
            $table->string('name', 255);
            $table->string('slug', 255)->unique();
            $table->text('description')->nullable();
            $table->string('short_description', 500)->nullable();
            $table->string('cover_image')->nullable();
            $table->string('background_image')->nullable();
            $table->json('screenshots')->nullable();
            $table->string('trailer_url')->nullable();
            $table->string('developer', 255)->nullable();
            $table->string('publisher', 255)->nullable();
            $table->date('release_date')->nullable();
            $table->string('age_rating', 20)->nullable()->comment('PEGI, ESRB ratings');
            $table->boolean('is_multiplayer')->default(false);
            $table->boolean('is_online_multiplayer')->default(false);
            $table->boolean('is_free')->default(false);
            $table->boolean('has_battle_pass')->default(false);
            $table->boolean('is_early_access')->default(false);
            $table->string('official_website')->nullable();
            $table->boolean('is_featured')->default(false);
            $table->boolean('is_trending')->default(false);
            $table->unsignedBigInteger('players_count')->default(0)->comment('Number of users tracking this game');
            $table->decimal('average_rating', 3, 1)->nullable();
            $table->string('rawg_id')->nullable()->comment('RAWG API ID for enrichment');
            $table->string('igdb_id')->nullable()->comment('IGDB API ID for enrichment');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();

            $table->fullText(['name', 'description', 'developer', 'publisher']);
            $table->index('is_featured');
            $table->index('is_trending');
            $table->index('is_free');
            $table->index('release_date');
            $table->index('players_count');
        });

        // Game ↔ Platform pivot
        Schema::create('game_platform', function (Blueprint $table) {
            $table->foreignId('game_id')->constrained()->cascadeOnDelete();
            $table->foreignId('platform_id')->constrained()->cascadeOnDelete();
            $table->primary(['game_id', 'platform_id']);
        });

        // Game ↔ Genre pivot
        Schema::create('game_genre', function (Blueprint $table) {
            $table->foreignId('game_id')->constrained()->cascadeOnDelete();
            $table->foreignId('genre_id')->constrained()->cascadeOnDelete();
            $table->primary(['game_id', 'genre_id']);
        });

        // Game tags (more granular than genres)
        Schema::create('game_tags', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100)->unique();
            $table->string('slug', 100)->unique();
            $table->timestamps();
        });

        // Game ↔ Tag pivot
        Schema::create('game_tag', function (Blueprint $table) {
            $table->foreignId('game_id')->constrained()->cascadeOnDelete();
            $table->foreignId('game_tag_id')->constrained()->cascadeOnDelete();
            $table->primary(['game_id', 'game_tag_id']);
        });

        // Official store/download links per platform
        Schema::create('game_store_links', function (Blueprint $table) {
            $table->id();
            $table->foreignId('game_id')->constrained()->cascadeOnDelete();
            $table->foreignId('platform_id')->constrained()->cascadeOnDelete();
            $table->enum('store', [
                'steam', 'epic_games', 'playstation_store', 'xbox_store',
                'nintendo_eshop', 'google_play', 'apple_app_store',
                'gog', 'battlenet', 'origin', 'ubisoft_connect',
                'itch_io', 'microsoft_store', 'official_website', 'other'
            ]);
            $table->string('url', 2048)->comment('Official store URL - never third-party piracy');
            $table->decimal('price', 8, 2)->nullable()->comment('Base price in USD, null if free/varies');
            $table->boolean('is_free')->default(false);
            $table->boolean('is_available')->default(true);
            $table->timestamps();

            $table->index('game_id');
        });

        // User game library / tracking
        Schema::create('user_games', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('game_id')->constrained()->cascadeOnDelete();
            $table->enum('status', [
                'favorite', 'playing', 'want_to_play',
                'completed', 'competitive', 'dropped', 'on_hold'
            ])->default('want_to_play');
            $table->unsignedTinyInteger('display_order')->default(0)->comment('For profile ordering');
            $table->boolean('show_on_profile')->default(true);
            $table->decimal('playtime_hours', 8, 1)->nullable();
            $table->date('started_at')->nullable();
            $table->date('completed_at')->nullable();
            $table->unsignedTinyInteger('rating')->nullable()->comment('1-10 user rating');
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->unique(['user_id', 'game_id']);
            $table->index('user_id');
            $table->index('game_id');
            $table->index('status');
            $table->index('display_order');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_games');
        Schema::dropIfExists('game_store_links');
        Schema::dropIfExists('game_tag');
        Schema::dropIfExists('game_tags');
        Schema::dropIfExists('game_genre');
        Schema::dropIfExists('game_platform');
        Schema::dropIfExists('games');
        Schema::dropIfExists('genres');
        Schema::dropIfExists('platforms');
    }
};
