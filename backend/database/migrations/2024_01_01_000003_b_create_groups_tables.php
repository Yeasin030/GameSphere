<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Groups
        Schema::create('groups', function (Blueprint $table) {
            $table->id();
            $table->foreignId('owner_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('game_id')->nullable()->constrained()->nullOnDelete()->comment('Primary game focus');
            $table->string('name', 255);
            $table->string('slug', 255)->unique();
            $table->text('description')->nullable();
            $table->string('avatar')->nullable();
            $table->string('cover_image')->nullable();
            $table->enum('type', ['public', 'private', 'invite_only'])->default('public');
            $table->string('country', 2)->nullable();
            $table->string('language', 10)->default('en');
            $table->boolean('require_approval')->default(false);
            $table->boolean('is_verified')->default(false);
            $table->boolean('is_active')->default(true);
            $table->unsignedBigInteger('members_count')->default(0);
            $table->unsignedBigInteger('posts_count')->default(0);
            $table->timestamps();
            $table->softDeletes();

            $table->index('owner_id');
            $table->index('type');
            $table->index('game_id');
            $table->fullText(['name', 'description']);
        });

        // Group members (with roles)
        Schema::create('group_members', function (Blueprint $table) {
            $table->id();
            $table->foreignId('group_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->enum('role', ['owner', 'admin', 'moderator', 'member'])->default('member');
            $table->enum('status', ['pending', 'approved', 'banned'])->default('approved');
            $table->foreignId('invited_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('joined_at');
            $table->timestamps();

            $table->unique(['group_id', 'user_id']);
            $table->index('group_id');
            $table->index('user_id');
            $table->index('status');
        });

        // Group rules
        Schema::create('group_rules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('group_id')->constrained()->cascadeOnDelete();
            $table->string('title', 255);
            $table->text('description')->nullable();
            $table->unsignedTinyInteger('sort_order')->default(0);
            $table->timestamps();
        });

        // Group events
        Schema::create('group_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('group_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete()->comment('Creator');
            $table->string('title', 255);
            $table->text('description')->nullable();
            $table->string('cover_image')->nullable();
            $table->timestamp('starts_at');
            $table->timestamp('ends_at')->nullable();
            $table->string('location')->nullable()->comment('Online/location name');
            $table->string('link')->nullable()->comment('Meeting/stream link');
            $table->unsignedInteger('max_attendees')->nullable();
            $table->unsignedInteger('attendees_count')->default(0);
            $table->timestamps();

            $table->index('group_id');
            $table->index('starts_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('group_events');
        Schema::dropIfExists('group_rules');
        Schema::dropIfExists('group_members');
        Schema::dropIfExists('groups');
    }
};
