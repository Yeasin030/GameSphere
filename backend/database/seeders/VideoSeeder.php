<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Str;
use App\Models\Video;
use App\Models\User;
use App\Models\Game;
use Illuminate\Support\Facades\DB;

class VideoSeeder extends Seeder
{
    public function run(): void
    {
        // Fetch users
        $demo = User::where('email', 'demo@gamesphere.com')->first() ?? User::first();
        $ninja = User::where('username', 'ninja_gamer')->first() ?? $demo;
        $shroud = User::where('username', 'shroud_fps')->first() ?? $demo;
        $rae = User::where('username', 'valkyrae_fan')->first() ?? $demo;
        $kaito = User::where('username', 'cyber_samurai')->first() ?? $demo;
        $luna = User::where('username', 'pixel_queen')->first() ?? $demo;

        // Fetch games
        $valorant = Game::where('slug', 'valorant')->first();
        $cyberpunk = Game::where('slug', 'cyberpunk-2077')->first();
        $eldenRing = Game::where('slug', 'elden-ring')->first();
        $apex = Game::where('slug', 'apex-legends')->first();
        $gta = Game::where('slug', 'grand-theft-auto-v')->first();
        $cs2 = Game::where('slug', 'like', 'counter-strike-2%')->first();
        $helldivers = Game::where('slug', 'helldivers-2')->first();

        // Clear existing videos before seeding
        Video::query()->delete();

        $sampleVideos = [
            [
                'user_id'        => $shroud->id,
                'game_id'        => $valorant?->id,
                'title'          => 'INSANE 1v5 Clutch in Valorant Radiant Lobby (New Record)',
                'description'    => 'Ranked Radiant gameplay. Last round of overtime, down 1v5 against top 10 players on Split. Watch how utility and crosshair placement turned this around.',
                'file_path'      => 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
                'thumbnail_path' => 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80',
                'poster_path'    => 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1600&auto=format&fit=crop&q=80',
                'duration'       => 845, // 14:05
                'category'       => 'highlights',
                'is_featured'    => true,
                'views_count'    => 142800,
                'likes_count'    => 12450,
                'shares_count'   => 2340,
            ],
            [
                'user_id'        => $kaito->id,
                'game_id'        => $cyberpunk?->id,
                'title'          => 'Cyberpunk 2077: Phantom Liberty 4K Ray Tracing Overdrive Gameplay',
                'description'    => 'Full ray tracing overdrive mode running on RTX 4090 with DLSS 3.5. Exploring Dogtown at night with maximum immersion and graphics mods enabled.',
                'file_path'      => 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
                'thumbnail_path' => 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&auto=format&fit=crop&q=80',
                'poster_path'    => 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1600&auto=format&fit=crop&q=80',
                'duration'       => 1320, // 22:00
                'category'       => 'gameplay',
                'is_featured'    => true,
                'views_count'    => 89300,
                'likes_count'    => 7890,
                'shares_count'   => 1230,
            ],
            [
                'user_id'        => $kaito->id,
                'game_id'        => $eldenRing?->id,
                'title'          => 'Elden Ring: Shadow of the Erdtree - Complete Boss Guide & Build',
                'description'    => 'Detailed strategy breakdown for defeating Promised Consort Radahn and Messmer the Impaler. Weapons, talismans, and parry timings explained.',
                'file_path'      => 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
                'thumbnail_path' => 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800&auto=format&fit=crop&q=80',
                'poster_path'    => 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=1600&auto=format&fit=crop&q=80',
                'duration'       => 1680, // 28:00
                'category'       => 'guide',
                'is_featured'    => false,
                'views_count'    => 215400,
                'likes_count'    => 18900,
                'shares_count'   => 4500,
            ],
            [
                'user_id'        => $ninja->id,
                'game_id'        => $apex?->id,
                'title'          => 'Apex Legends Predator Rank Up Game (Solo Queue Dominance)',
                'description'    => 'Dropping into Worlds Edge in Predator tier. 18 kills, 4200 damage game with Octane. Fast paced rotations and endgame positioning.',
                'file_path'      => 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
                'thumbnail_path' => 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&auto=format&fit=crop&q=80',
                'poster_path'    => 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1600&auto=format&fit=crop&q=80',
                'duration'       => 1150, // 19:10
                'category'       => 'esports',
                'is_featured'    => false,
                'views_count'    => 96700,
                'likes_count'    => 8200,
                'shares_count'   => 1410,
            ],
            [
                'user_id'        => $demo->id,
                'game_id'        => $cs2?->id,
                'title'          => 'CS2 Mirage Smoke Lineups & Site Takes for Premier Mode',
                'description'    => 'Master every essential smoke, flash, and molotov for Mirage in Counter-Strike 2. Sub-tick lineups that work 100% of the time in competitive.',
                'file_path'      => 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
                'thumbnail_path' => 'https://images.unsplash.com/photo-1612287233207-6b450148154c?w=800&auto=format&fit=crop&q=80',
                'poster_path'    => 'https://images.unsplash.com/photo-1612287233207-6b450148154c?w=1600&auto=format&fit=crop&q=80',
                'duration'       => 620, // 10:20
                'category'       => 'tutorial',
                'is_featured'    => false,
                'views_count'    => 54100,
                'likes_count'    => 4900,
                'shares_count'   => 890,
            ],
            [
                'user_id'        => $rae->id,
                'game_id'        => $gta?->id,
                'title'          => 'GTA V Roleplay Funniest Moments & Police Chases #42',
                'description'    => 'Hilarious highlights from NoPixel GTA RP! Bank heists gone completely wrong, chaotic getaway plans, and funny character interactions.',
                'file_path'      => 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
                'thumbnail_path' => 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&auto=format&fit=crop&q=80',
                'poster_path'    => 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=1600&auto=format&fit=crop&q=80',
                'duration'       => 940, // 15:40
                'category'       => 'funny',
                'is_featured'    => false,
                'views_count'    => 182000,
                'likes_count'    => 16300,
                'shares_count'   => 3200,
            ],
            [
                'user_id'        => $luna->id,
                'game_id'        => $helldivers?->id,
                'title'          => 'Helldivers 2: Level 9 Helldive Difficulty Solo Extraction (Impossible Win)',
                'description'    => 'Automaton Malevelon Creek on highest difficulty with zero reinforcements remaining. Stealth mechanics and stratagem timing for survival.',
                'file_path'      => 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
                'thumbnail_path' => 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&auto=format&fit=crop&q=80',
                'poster_path'    => 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1600&auto=format&fit=crop&q=80',
                'duration'       => 1050, // 17:30
                'category'       => 'walkthrough',
                'is_featured'    => false,
                'views_count'    => 67800,
                'likes_count'    => 6100,
                'shares_count'   => 1150,
            ],
            [
                'user_id'        => $demo->id,
                'game_id'        => $valorant?->id,
                'title'          => 'GameSphere Community Invitational Finals: Team Liquid vs Sentinels',
                'description'    => 'Full match broadcast of the GameSphere Invitational Championship Grand Finals. Casters, replay analysis, and trophy ceremony.',
                'file_path'      => 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
                'thumbnail_path' => 'https://images.unsplash.com/photo-1560253023-3ec5d502959f?w=800&auto=format&fit=crop&q=80',
                'poster_path'    => 'https://images.unsplash.com/photo-1560253023-3ec5d502959f?w=1600&auto=format&fit=crop&q=80',
                'duration'       => 2400, // 40:00
                'category'       => 'tournament',
                'is_featured'    => true,
                'views_count'    => 289000,
                'likes_count'    => 24500,
                'shares_count'   => 5600,
            ],
        ];

        foreach ($sampleVideos as $vid) {
            Video::create([
                'user_id'          => $vid['user_id'],
                'game_id'          => $vid['game_id'],
                'title'            => $vid['title'],
                'slug'             => Str::slug($vid['title']) . '-' . Str::random(5),
                'description'      => $vid['description'],
                'file_path'        => $vid['file_path'],
                'thumbnail_path'   => $vid['thumbnail_path'],
                'poster_path'      => $vid['poster_path'],
                'file_size'        => rand(150000000, 850000000),
                'duration'         => $vid['duration'],
                'category'         => $vid['category'],
                'visibility'       => 'public',
                'status'           => 'ready',
                'comments_enabled' => true,
                'is_featured'      => $vid['is_featured'],
                'views_count'      => $vid['views_count'],
                'likes_count'      => $vid['likes_count'],
                'shares_count'     => $vid['shares_count'],
            ]);
        }
    }
}
