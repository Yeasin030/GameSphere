<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Tournaments
        Schema::create('tournaments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete()->comment('Host');
            $table->foreignId('game_id')->constrained();
            $table->string('name', 255);
            $table->string('slug', 255)->unique();
            $table->text('description')->nullable();
            $table->string('banner')->nullable();
            $table->text('rules')->nullable();
            $table->enum('format', [
                'single_elimination', 'double_elimination',
                'round_robin', 'league', 'battle_royale',
                'swiss', 'custom'
            ])->default('single_elimination');
            $table->enum('team_mode', ['solo', '2v2', '3v3', '4v4', '5v5', 'custom'])->default('solo');
            $table->unsignedTinyInteger('team_size')->default(1);
            $table->unsignedInteger('max_participants');
            $table->unsignedInteger('registered_count')->default(0);
            $table->decimal('entry_fee', 10, 2)->default(0)->comment('0 = free');
            $table->string('currency', 3)->default('USD');
            $table->string('prize_info', 500)->nullable()->comment('Prize description, not payment processing');
            $table->string('region', 100)->nullable();
            $table->enum('platform_type', ['pc', 'console', 'mobile', 'cross_platform'])->default('cross_platform');
            $table->enum('status', [
                'draft', 'registration', 'check_in',
                'in_progress', 'completed', 'cancelled'
            ])->default('draft');
            $table->boolean('is_featured')->default(false);
            $table->boolean('is_verified')->default(false);
            $table->boolean('require_check_in')->default(false);
            $table->timestamp('registration_starts_at')->nullable();
            $table->timestamp('registration_ends_at')->nullable();
            $table->timestamp('check_in_starts_at')->nullable();
            $table->timestamp('check_in_ends_at')->nullable();
            $table->timestamp('starts_at')->nullable();
            $table->timestamp('ends_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index('user_id');
            $table->index('game_id');
            $table->index('status');
            $table->index('starts_at');
            $table->fullText(['name', 'description']);
        });

        // Tournament registrations / participants
        Schema::create('tournament_registrations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tournament_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('team_id')->nullable()->comment('FK added after tournament_teams');
            $table->enum('status', ['pending', 'approved', 'rejected', 'checked_in', 'eliminated', 'disqualified'])->default('pending');
            $table->timestamp('registered_at')->useCurrent();
            $table->timestamp('checked_in_at')->nullable();
            $table->unsignedInteger('seed')->nullable()->comment('Seeding position');
            $table->timestamps();

            $table->unique(['tournament_id', 'user_id']);
            $table->index('tournament_id');
            $table->index('user_id');
            $table->index('status');
        });

        // Tournament teams
        Schema::create('tournament_teams', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tournament_id')->constrained()->cascadeOnDelete();
            $table->foreignId('captain_id')->constrained('users')->cascadeOnDelete();
            $table->string('name', 255);
            $table->string('avatar')->nullable();
            $table->enum('status', ['forming', 'complete', 'registered', 'eliminated'])->default('forming');
            $table->unsignedInteger('seed')->nullable();
            $table->timestamps();

            $table->index('tournament_id');
            $table->index('captain_id');
        });

        // Add FK for team_id in registrations
        Schema::table('tournament_registrations', function (Blueprint $table) {
            $table->foreign('team_id')->references('id')->on('tournament_teams')->nullOnDelete();
        });

        // Tournament team members
        Schema::create('tournament_team_members', function (Blueprint $table) {
            $table->id();
            $table->foreignId('team_id')->constrained('tournament_teams')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->enum('role', ['captain', 'member', 'substitute'])->default('member');
            $table->timestamps();

            $table->unique(['team_id', 'user_id']);
        });

        // Tournament brackets / matches
        Schema::create('tournament_matches', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tournament_id')->constrained()->cascadeOnDelete();
            $table->string('round_name', 100)->comment('Quarter Finals, Semi Finals, etc.');
            $table->unsignedTinyInteger('round_number');
            $table->unsignedTinyInteger('match_number');
            $table->foreignId('participant_a_id')->nullable()->constrained('tournament_registrations')->nullOnDelete();
            $table->foreignId('participant_b_id')->nullable()->constrained('tournament_registrations')->nullOnDelete();
            $table->foreignId('winner_id')->nullable()->constrained('tournament_registrations')->nullOnDelete();
            $table->json('score')->nullable()->comment('{"a": 2, "b": 1} etc.');
            $table->enum('status', ['scheduled', 'in_progress', 'completed', 'walkover', 'disputed'])->default('scheduled');
            $table->string('match_url')->nullable()->comment('Stream link or platform match ID');
            $table->text('notes')->nullable();
            $table->timestamp('scheduled_at')->nullable();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            $table->index('tournament_id');
            $table->index(['round_number', 'match_number']);
            $table->index('status');
        });

        // Tournament announcements
        Schema::create('tournament_announcements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tournament_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete()->comment('Announcer');
            $table->string('title', 255);
            $table->text('content');
            $table->boolean('send_notification')->default(false);
            $table->timestamps();

            $table->index('tournament_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tournament_announcements');
        Schema::dropIfExists('tournament_matches');
        Schema::dropIfExists('tournament_team_members');
        Schema::dropIfExists('tournament_teams');
        Schema::dropIfExists('tournament_registrations');
        Schema::dropIfExists('tournaments');
    }
};
