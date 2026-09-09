<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Reel;
use App\Models\User;
use App\Models\Game;

class ReelSeeder extends Seeder
{
    public function run(): void
    {
        $demo = User::where('email', 'demo@gamesphere.com')->first() ?? User::first();
        $ninja = User::where('username', 'ninja_gamer')->first() ?? $demo;
        $shroud = User::where('username', 'shroud_fps')->first() ?? $demo;
        $rae = User::where('username', 'valkyrae_fan')->first() ?? $demo;
        $kaito = User::where('username', 'cyber_samurai')->first() ?? $demo;
        $luna = User::where('username', 'pixel_queen')->first() ?? $demo;

        $valorant = Game::where('slug', 'valorant')->first();
        $cyberpunk = Game::where('slug', 'cyberpunk-2077')->first();
        $eldenRing = Game::where('slug', 'elden-ring')->first();
        $apex = Game::where('slug', 'apex-legends')->first();
        $cs2 = Game::where('slug', 'like', 'counter-strike-2%')->first();
        $gta = Game::where('slug', 'grand-theft-auto-v')->first();

        // Clear existing reels safely
        Reel::query()->delete();

        $sampleReels = [
            [
                'user_id'        => $shroud->id,
                'game_id'        => $valorant?->id,
                'caption'        => "0.01 second defuse in 1v4 overtime! My heart was beating out of my chest 🎯🔥 #valorant #clutch #radiant #esports",
                'audio_name'     => "Valorant Clutch Heartbeat OST - Riot Games",
                'file_path'      => 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
                'thumbnail_path' => 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&auto=format&fit=crop&q=80',
                'duration'       => 15,
                'views_count'    => 148200,
                'likes_count'    => 14200,
                'shares_count'   => 3800,
                'saves_count'    => 1950,
            ],
            [
                'user_id'        => $kaito->id,
                'game_id'        => $cyberpunk?->id,
                'caption'        => "Night City rainy drive with ultra RTX Path Tracing. Pure cyberpunk atmosphere 🌆✨ #cyberpunk2077 #rtx4090 #gaming #nightcity",
                'audio_name'     => "I Really Want to Stay at Your House (Lofi Remix)",
                'file_path'      => 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
                'thumbnail_path' => 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=600&auto=format&fit=crop&q=80',
                'duration'       => 15,
                'views_count'    => 92400,
                'likes_count'    => 8900,
                'shares_count'   => 2100,
                'saves_count'    => 3100,
            ],
            [
                'user_id'        => $kaito->id,
                'game_id'        => $eldenRing?->id,
                'caption'        => "Parrying Malenia 3 times in a row with buckler shield. She didn't expect this! 🗡️👑 #eldenring #souls #parry #gamer",
                'audio_name'     => "Malenia Blade of Miquella Epic Choir",
                'file_path'      => 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
                'thumbnail_path' => 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=600&auto=format&fit=crop&q=80',
                'duration'       => 15,
                'views_count'    => 245000,
                'likes_count'    => 28900,
                'shares_count'   => 6700,
                'saves_count'    => 5400,
            ],
            [
                'user_id'        => $ninja->id,
                'game_id'        => $apex?->id,
                'caption'        => "Octane superglide into tap strafe wingman triple headshot! Movement gamers rise up 🚀💨 #apexlegends #movement #apex #predator",
                'audio_name'     => "Phonk Drift Gaming Anthem #4",
                'file_path'      => 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
                'thumbnail_path' => 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=600&auto=format&fit=crop&q=80',
                'duration'       => 15,
                'views_count'    => 115000,
                'likes_count'    => 11300,
                'shares_count'   => 2900,
                'saves_count'    => 1200,
            ],
            [
                'user_id'        => $demo->id,
                'game_id'        => $cs2?->id,
                'caption'        => "5 bullets, 5 headshots. Desert Eagle ace in CS2 Premier! 💥🔫 #cs2 #deagle #ace #counterstrike",
                'audio_name'     => "Original Sound - ProGamer 99",
                'file_path'      => 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
                'thumbnail_path' => 'https://images.unsplash.com/photo-1612287233207-6b450148154c?w=600&auto=format&fit=crop&q=80',
                'duration'       => 15,
                'views_count'    => 84100,
                'likes_count'    => 7600,
                'shares_count'   => 1500,
                'saves_count'    => 980,
            ],
            [
                'user_id'        => $rae->id,
                'game_id'        => $gta?->id,
                'caption'        => "When your getaway driver is completely blindfolded... funniest RP heist ever 😂🚔 #gtarp #gta5 #funny #gamingmoments",
                'audio_name'     => "Funny Saxophone Chase Song",
                'file_path'      => 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
                'thumbnail_path' => 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=80',
                'duration'       => 30,
                'views_count'    => 198000,
                'likes_count'    => 21400,
                'shares_count'   => 5100,
                'saves_count'    => 2400,
            ],
        ];

        foreach ($sampleReels as $r) {
            Reel::create([
                'user_id'          => $r['user_id'],
                'game_id'          => $r['game_id'],
                'caption'          => $r['caption'],
                'audio_name'       => $r['audio_name'],
                'file_path'        => $r['file_path'],
                'thumbnail_path'   => $r['thumbnail_path'],
                'duration'         => $r['duration'],
                'status'           => 'ready',
                'privacy'          => 'public',
                'comments_enabled' => true,
                'is_featured'      => true,
                'views_count'      => $r['views_count'],
                'likes_count'      => $r['likes_count'],
                'shares_count'     => $r['shares_count'],
                'saves_count'      => $r['saves_count'],
            ]);
        }
    }
}
