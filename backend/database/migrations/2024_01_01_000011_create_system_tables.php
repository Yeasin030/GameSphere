<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Achievements (platform-level)
        Schema::create('achievements', function (Blueprint $table) {
            $table->id();
            $table->string('name', 255);
            $table->string('slug', 100)->unique();
            $table->text('description');
            $table->string('icon');
            $table->enum('type', [
                'social', 'content', 'gaming', 'tournament',
                'milestone', 'special', 'veteran'
            ])->default('milestone');
            $table->enum('rarity', ['common', 'uncommon', 'rare', 'epic', 'legendary'])->default('common');
            $table->unsignedInteger('points')->default(0);
            $table->json('criteria')->nullable()->comment('Conditions to unlock: {"posts_count": 1}');
            $table->boolean('is_secret')->default(false);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // User achievements
        Schema::create('user_achievements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('achievement_id')->constrained()->cascadeOnDelete();
            $table->timestamp('unlocked_at');
            $table->boolean('is_displayed')->default(true);
            $table->timestamps();

            $table->unique(['user_id', 'achievement_id']);
            $table->index('user_id');
        });

        // Notifications
        Schema::create('notifications', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('type');
            $table->morphs('notifiable');
            $table->text('data');
            $table->timestamp('read_at')->nullable();
            $table->timestamps();

            $table->index(['notifiable_type', 'notifiable_id', 'read_at']);
        });

        // Reports
        Schema::create('reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('reporter_id')->constrained('users')->cascadeOnDelete();
            $table->morphs('reportable'); // Post, User, Comment, Video, etc.
            $table->enum('category', [
                'spam', 'harassment', 'hate_speech', 'nsfw', 'scam',
                'copyright', 'impersonation', 'dangerous', 'misinformation', 'other'
            ]);
            $table->text('description')->nullable();
            $table->enum('status', ['pending', 'under_review', 'resolved', 'dismissed'])->default('pending');
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->text('admin_notes')->nullable();
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamps();

            $table->index('reporter_id');
            $table->index('status');
        });

        // Moderation actions log
        Schema::create('moderation_actions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('moderator_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('target_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->nullableMorphs('actionable'); // Target content (nullable morphs)
            $table->enum('action', [
                'warn', 'delete_content', 'hide_content', 'restore_content',
                'ban_user', 'unban_user', 'suspend_user', 'verify_user',
                'remove_from_group', 'resolve_report', 'dismiss_report'
            ]);
            $table->text('reason');
            $table->unsignedInteger('duration_days')->nullable()->comment('For suspensions');
            $table->foreignId('report_id')->nullable()->constrained()->nullOnDelete();
            $table->timestamps();

            $table->index('moderator_id');
            $table->index('target_user_id');
            $table->index('action');
        });

        // Audit logs (important admin actions)
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('event', 100);
            $table->nullableMorphs('auditable');
            $table->json('old_values')->nullable();
            $table->json('new_values')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->string('url')->nullable();
            $table->timestamps();

            $table->index('user_id');
            $table->index('event');
            $table->index('created_at');
        });

        // Spatie roles/permissions tables (from migration stub)
        // These are created by: php artisan vendor:publish --provider="Spatie\Permission\PermissionServiceProvider"
        // Included here as a reminder — run the vendor publish command
    }

    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
        Schema::dropIfExists('moderation_actions');
        Schema::dropIfExists('reports');
        Schema::dropIfExists('notifications');
        Schema::dropIfExists('user_achievements');
        Schema::dropIfExists('achievements');
    }
};
