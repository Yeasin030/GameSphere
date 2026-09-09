<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Post;
use App\Models\Story;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // ── Demo account ──────────────────────────────────────────
        $demo = User::firstOrCreate(
            ['email' => 'demo@gamesphere.com'],
            [
                'username'           => 'progamer99',
                'display_name'       => 'ProGamer 99',
                'password'           => Hash::make('password'),
                'bio'                => 'Just here to game 🎮',
                'email_verified_at'  => now(),
                'is_verified'        => true,
                'is_active'          => true,
                'country'            => 'US',
            ]
        );

        // ── Gamer Users ───────────────────────────────────────────
        $gamersData = [
            ['username' => 'ninja_gamer', 'display_name' => 'Tyler "Ninja"', 'bio' => 'Streaming daily! 🎮', 'email' => 'ninja@gamesphere.com'],
            ['username' => 'valkyrae_fan', 'display_name' => 'Rae Gamer', 'bio' => 'Valorant enthusiast 🎯', 'email' => 'rae@gamesphere.com'],
            ['username' => 'shroud_fps', 'display_name' => 'Michael Aim', 'bio' => 'The human aimbot 🔫', 'email' => 'shroud@gamesphere.com'],
            ['username' => 'pokimane_vibes', 'display_name' => 'Imane Cozy', 'bio' => 'Variety streamer & chill vibes ✨', 'email' => 'poki@gamesphere.com'],
            ['username' => 'timthetatman', 'display_name' => 'Tim Tatman', 'bio' => 'Heavy gamer, heavy laughs 😂', 'email' => 'tim@gamesphere.com'],
            ['username' => 'cyber_samurai', 'display_name' => 'Kaito Ken', 'bio' => 'RPG master & Souls veteran 🗡️', 'email' => 'kaito@gamesphere.com'],
            ['username' => 'pixel_queen', 'display_name' => 'Luna Sparks', 'bio' => 'Indie games & speedruns 🕹️', 'email' => 'luna@gamesphere.com'],
        ];

        $users = collect([$demo]);
        foreach ($gamersData as $gamer) {
            $user = User::firstOrCreate(
                ['email' => $gamer['email']],
                [
                    'username'          => $gamer['username'],
                    'display_name'      => $gamer['display_name'],
                    'password'          => Hash::make('password'),
                    'bio'               => $gamer['bio'],
                    'email_verified_at' => now(),
                    'is_verified'       => true,
                    'is_active'         => true,
                    'country'           => 'US',
                ]
            );
            $users->push($user);
        }

        // ── Posts ─────────────────────────────────────────────────
        $gamingPosts = [
            "Just hit Diamond rank in Valorant after 3 weeks of grinding! The ranked climb is real 💎🎯 #Valorant",
            "Anyone else playing Cyberpunk 2077 Phantom Liberty? The story is absolutely insane 🤯 #Cyberpunk",
            "Finally built my first gaming PC! RTX 4080 + Ryzen 9 7950X. The performance is unreal 🖥️⚡",
            "Apex Legends Season 22 is here and the new legend is BROKEN. Nerf incoming for sure 😅 #ApexLegends",
            "Spent 6 hours grinding Elden Ring DLC and I finally beat Messmer. Hardest boss fight ever 🏆",
            "Who else is hyped for GTA 6? The trailer looked AMAZING. 2025 can't come fast enough! #GTA6",
            "Pro tip: if you're struggling in ranked, play support. Your teammates will love you 💚",
            "The new Call of Duty map is fire 🔥 The verticality adds so much to gameplay. 10/10 map design #COD",
            "Just reached 1000 hours in Minecraft. Still haven't finished my mega build project 😂 #Minecraft",
            "League of Legends new champion kit looks insane. Can't wait to see it in the meta #LeagueOfLegends",
            "Finally got my first Warzone win after 47 attempts. The grind was worth it! 🏆 #Warzone",
            "Playing Baldur's Gate 3 for the third time and I'm still discovering new dialogue options. GOTY forever 🎮",
            "Spider-Man 2 platinum trophy unlocked! What a game, Insomniac never misses 🕷️ #SpiderMan2",
            "Stream starting in 10 minutes! Grinding ranked till Challenger. Come join! 🎮✨",
            "The gaming chair just arrived and my back pain is already gone. Invest in ergonomics, people! 💺",
            "Anyone wanna duo queue? Silver elo but I'm grinding hard every night 💪 #Valorant #DuoLFG",
            "Elden Ring Shadow of the Erdtree review: absolute masterpiece. FromSoftware keeps delivering 🐉",
            "That moment when you clutch a 1v5 on the last round... unreal feeling 🤯 #FPS #Gaming",
            "Finally subscribed to Xbox Game Pass and I haven't slept in 3 days. Send help 😂 #GamePass",
            "Hot take: single player games are better than multiplayer. Fight me 🎮",
        ];

        foreach ($users as $i => $user) {
            for ($j = 0; $j < 3; $j++) {
                $content = $gamingPosts[($i * 3 + $j) % count($gamingPosts)];
                Post::firstOrCreate(
                    ['user_id' => $user->id, 'content' => $content],
                    [
                        'type'             => 'text',
                        'privacy'          => 'public',
                        'rank_score'       => rand(50, 500) / 10.0,
                        'likes_count'      => rand(12, 450),
                        'comments_count'   => rand(2, 68),
                        'shares_count'     => rand(1, 24),
                        'views_count'      => rand(300, 8500),
                        'comments_enabled' => true,
                        'is_hidden'        => false,
                    ]
                );
            }
        }

        // ── Stories ───────────────────────────────────────────────
        $storyTexts = [
            "🏆 Won the tournament!",
            "🔥 New setup complete! 4090 beast",
            "🔴 LIVE NOW grinding Ranked!",
            "👀 Look who I bumped into in lobby",
            "🍕 Late night gaming fuel",
        ];

        foreach ($users->take(5) as $idx => $user) {
            Story::firstOrCreate(
                ['user_id' => $user->id],
                [
                    'type'             => 'text',
                    'text_content'     => $storyTexts[$idx % count($storyTexts)],
                    'background_color' => '#7c3aed',
                    'privacy'          => 'public',
                    'duration_seconds' => 5,
                    'views_count'      => rand(50, 400),
                    'expires_at'       => now()->addHours(20),
                ]
            );
        }

        $this->call(NotificationSeeder::class);
        $this->call(VideoSeeder::class);
        $this->call(ReelSeeder::class);
        $this->call(TournamentSeeder::class);
        $this->call(ProfileSeeder::class);
    }
}
