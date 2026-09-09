<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Social accounts (OAuth connections)
        Schema::create('social_accounts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('provider', 32)->comment('google, discord, steam, twitch, epic, apple');
            $table->string('provider_user_id', 191);
            $table->string('provider_username', 191)->nullable();
            $table->string('provider_email', 191)->nullable();
            $table->string('provider_avatar')->nullable();
            $table->text('access_token')->nullable()->comment('Encrypted at rest');
            $table->text('refresh_token')->nullable()->comment('Encrypted at rest');
            $table->timestamp('token_expires_at')->nullable();
            $table->json('metadata')->nullable()->comment('Provider-specific data');
            $table->timestamps();

            $table->unique(['provider', 'provider_user_id']);
            $table->index('user_id');
        });

        // User privacy settings
        Schema::create('user_privacy_settings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete()->unique();
            // Profile visibility
            $table->enum('profile_visibility', ['public', 'friends', 'only_me'])->default('public');
            // Posts
            $table->enum('posts_visibility', ['public', 'friends', 'followers', 'only_me'])->default('public');
            // Friends list
            $table->enum('friends_visibility', ['public', 'friends', 'only_me'])->default('public');
            // Online status
            $table->boolean('show_online_status')->default(true);
            // Who can send friend requests
            $table->enum('friend_requests_from', ['everyone', 'friends_of_friends', 'nobody'])->default('everyone');
            // Who can message
            $table->enum('messages_from', ['everyone', 'friends', 'nobody'])->default('everyone');
            // Who can see games
            $table->enum('games_visibility', ['public', 'friends', 'only_me'])->default('public');
            // Indexing
            $table->boolean('allow_search_indexing')->default(true);
            // Tag settings
            $table->boolean('allow_tagging')->default(true);
            $table->enum('tag_approval', ['auto', 'manual'])->default('auto');
            $table->timestamps();
        });

        // User notification preferences
        Schema::create('user_notification_preferences', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete()->unique();
            // In-app notifications
            $table->boolean('notify_likes')->default(true);
            $table->boolean('notify_comments')->default(true);
            $table->boolean('notify_follows')->default(true);
            $table->boolean('notify_friend_requests')->default(true);
            $table->boolean('notify_messages')->default(true);
            $table->boolean('notify_group_invites')->default(true);
            $table->boolean('notify_tournament_updates')->default(true);
            $table->boolean('notify_mentions')->default(true);
            $table->boolean('notify_achievements')->default(true);
            $table->boolean('notify_news')->default(false);
            // Email notifications
            $table->boolean('email_likes')->default(false);
            $table->boolean('email_comments')->default(true);
            $table->boolean('email_follows')->default(true);
            $table->boolean('email_friend_requests')->default(true);
            $table->boolean('email_messages')->default(false);
            $table->boolean('email_tournament_updates')->default(true);
            $table->boolean('email_newsletter')->default(false);
            // Push notifications
            $table->boolean('push_enabled')->default(true);
            $table->boolean('push_messages')->default(true);
            $table->boolean('push_mentions')->default(true);
            $table->boolean('push_tournament_alerts')->default(true);
            $table->timestamps();
        });

        // Device tokens for push notifications
        Schema::create('push_tokens', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('token', 512);
            $table->enum('platform', ['ios', 'android', 'web']);
            $table->string('device_name')->nullable();
            $table->timestamp('last_used_at')->nullable();
            $table->timestamps();

            $table->unique(['user_id', 'token']);
            $table->index('user_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('push_tokens');
        Schema::dropIfExists('user_notification_preferences');
        Schema::dropIfExists('user_privacy_settings');
        Schema::dropIfExists('social_accounts');
    }
};
