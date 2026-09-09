<?php

namespace Database\Seeders;

use App\Models\Achievement;
use App\Models\Game;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ProfileSeeder extends Seeder
{
    public function run(): void
    {
        $demo = User::where('email', 'demo@gamesphere.com')->first();
        if (!$demo) {
            return;
        }

        // 1. Update demo profile with realistic avatar, banner, bio, location
        $demo->update([
            'avatar' => 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=400&auto=format&fit=crop&q=80',
            'cover_image' => 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1600&auto=format&fit=crop&q=80',
            'bio' => 'Cyberpunk enthusiast. Professional FPS clutch master. Grinding ranked every night & streaming on weekends 🎮⚡',
            'website' => 'https://twitch.tv/progamer99',
            'country' => 'US',
            'display_name' => 'ProGamer 99',
        ]);

        // Also give other seeded gamers realistic avatars and cover images
        $avatarList = [
            'ninja_gamer' => 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80',
            'valkyrae_fan' => 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80',
            'shroud_fps' => 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=400&auto=format&fit=crop&q=80',
            'pokimane_vibes' => 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
            'timthetatman' => 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
            'cyber_samurai' => 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
            'pixel_queen' => 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&auto=format&fit=crop&q=80',
        ];

        foreach ($avatarList as $username => $avatarUrl) {
            User::where('username', $username)->update([
                'avatar' => $avatarUrl,
                'cover_image' => 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1600&auto=format&fit=crop&q=80',
            ]);
        }

        // 2. Seed Achievements
        $achievements = [
            [
                'name' => 'Elden Lord',
                'slug' => 'elden-lord',
                'description' => 'Completed Elden Ring main storyline and claimed the throne in Leyndell.',
                'icon' => 'Trophy',
                'type' => 'gaming',
                'rarity' => 'legendary',
                'points' => 100,
            ],
            [
                'name' => 'Radiant Valor',
                'slug' => 'radiant-valor',
                'description' => 'Achieved Radiant tier rank in competitive Valorant.',
                'icon' => 'ShieldCheck',
                'type' => 'gaming',
                'rarity' => 'epic',
                'points' => 75,
            ],
            [
                'name' => 'Apex Predator',
                'slug' => 'apex-predator',
                'description' => 'Placed in the Top 750 globally in Apex Legends ranked leagues.',
                'icon' => 'Flame',
                'type' => 'tournament',
                'rarity' => 'epic',
                'points' => 80,
            ],
            [
                'name' => 'Ace in the Hole',
                'slug' => 'ace-in-the-hole',
                'description' => 'Scored a flawless 1v5 clutch round in Counter-Strike 2 competitive MR12.',
                'icon' => 'Swords',
                'type' => 'gaming',
                'rarity' => 'rare',
                'points' => 50,
            ],
            [
                'name' => 'Super Earth Hero',
                'slug' => 'super-earth-hero',
                'description' => 'Extracted with all Super Samples on Difficulty 10 in Helldivers 2.',
                'icon' => 'Award',
                'type' => 'milestone',
                'rarity' => 'uncommon',
                'points' => 30,
            ],
            [
                'name' => 'Community Champion',
                'slug' => 'community-champion',
                'description' => 'Reached 500+ likes on a single community discussion thread.',
                'icon' => 'Crown',
                'type' => 'social',
                'rarity' => 'uncommon',
                'points' => 25,
            ],
        ];

        foreach ($achievements as $achData) {
            $ach = Achievement::updateOrCreate(
                ['slug' => $achData['slug']],
                $achData
            );

            // Assign to demo user
            DB::table('user_achievements')->updateOrInsert(
                ['user_id' => $demo->id, 'achievement_id' => $ach->id],
                [
                    'unlocked_at' => Carbon::now()->subDays(rand(2, 60)),
                    'is_displayed' => true,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );
        }

        // 3. Seed User Game Library for Demo User
        $games = Game::all();
        if ($games->isNotEmpty()) {
            DB::table('user_games')->where('user_id', $demo->id)->delete();

            $gameConfigs = [
                ['slug' => 'valorant', 'status' => 'favorite', 'hours' => 450.5, 'rating' => 10, 'notes' => 'Current Rank: Radiant. Main: Jett/Omen'],
                ['slug' => 'cyberpunk-2077', 'status' => 'favorite', 'hours' => 180.0, 'rating' => 10, 'notes' => '100% achievements unlocked with Phantom Liberty'],
                ['slug' => 'elden-ring', 'status' => 'completed', 'hours' => 240.2, 'rating' => 10, 'notes' => 'Shadow of the Erdtree finished with Dex build'],
                ['slug' => 'counter-strike-2', 'status' => 'competitive', 'hours' => 320.0, 'rating' => 9, 'notes' => 'Premier Rating: 18,450'],
                ['slug' => 'apex-legends', 'status' => 'playing', 'hours' => 150.0, 'rating' => 9, 'notes' => 'Season 22 Master Rank'],
                ['slug' => 'helldivers-2', 'status' => 'playing', 'hours' => 88.5, 'rating' => 9, 'notes' => 'Spreading democracy on Diff 10'],
            ];

            foreach ($gameConfigs as $idx => $gc) {
                $game = $games->first(fn($g) => str_contains($g->slug, $gc['slug']));
                if ($game) {
                    DB::table('user_games')->insert([
                        'user_id' => $demo->id,
                        'game_id' => $game->id,
                        'status' => $gc['status'],
                        'display_order' => $idx + 1,
                        'show_on_profile' => true,
                        'playtime_hours' => $gc['hours'],
                        'rating' => $gc['rating'],
                        'notes' => $gc['notes'],
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }
            }
        }

        // 4. Seed followers and friends for Demo User
        $otherUsers = User::where('id', '!=', $demo->id)->get();
        DB::table('followers')->where('following_id', $demo->id)->orWhere('follower_id', $demo->id)->delete();
        DB::table('friendships')->where('recipient_id', $demo->id)->orWhere('requester_id', $demo->id)->delete();

        // Have 6 users follow demo user
        foreach ($otherUsers->take(6) as $ou) {
            DB::table('followers')->insert([
                'follower_id' => $ou->id,
                'following_id' => $demo->id,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // Demo user follows 3 users
        foreach ($otherUsers->take(3) as $ou) {
            DB::table('followers')->insert([
                'follower_id' => $demo->id,
                'following_id' => $ou->id,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // Seed 4 friends
        foreach ($otherUsers->take(4) as $ou) {
            DB::table('friendships')->insert([
                'requester_id' => $ou->id,
                'recipient_id' => $demo->id,
                'status' => 'accepted',
                'accepted_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // Update counts
        $demo->update([
            'followers_count' => 6,
            'following_count' => 3,
            'friends_count' => 4,
            'posts_count' => $demo->posts()->count(),
        ]);
    }
}
