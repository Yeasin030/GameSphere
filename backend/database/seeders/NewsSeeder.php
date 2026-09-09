<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\NewsSource;
use App\Models\NewsArticle;
use Illuminate\Support\Str;

class NewsSeeder extends Seeder
{
    public function run(): void
    {
        $source = NewsSource::firstOrCreate(
            ['slug' => 'gamesphere-official'],
            [
                'name' => 'GameSphere News Desk',
                'website_url' => 'http://localhost:3000',
                'feed_type' => 'api',
                'credibility' => 'official',
                'is_active' => true,
            ]
        );

        $articles = [
            [
                'title' => 'GTA 6 Official Gameplay Trailer Breaks All Records with 150M Views in 24 Hours!',
                'summary' => 'Rockstar Games has shattered all previous entertainment records with the explosive new GTA VI trailer showcasing Vice City, next-gen physics, and dual protagonist mechanics.',
                'image_url' => 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80',
                'source_url' => 'https://www.rockstargames.com/VI',
                'author' => 'Marcus Vance',
                'tags' => ['GTA 6', 'Rockstar Games', 'Open World', 'PlayStation', 'Xbox'],
                'is_featured' => true,
                'is_breaking' => true,
                'views_count' => 142500,
                'saves_count' => 3420,
            ],
            [
                'title' => 'Valorant Episode 9 Act 1: New Sentinel Agent Vyse, Map Rotations & Battle Pass',
                'summary' => 'Riot Games unveils Vyse, the metallic controller with razorvine traps and weapon-jamming abilities that is poised to completely disrupt the professional meta.',
                'image_url' => '/squad_emblem.jpg',
                'source_url' => 'https://playvalorant.com',
                'author' => 'Elena Rostova',
                'tags' => ['Valorant', 'Riot Games', 'FPS', 'PC', 'Esports'],
                'is_featured' => true,
                'is_breaking' => false,
                'views_count' => 89200,
                'saves_count' => 2190,
            ],
            [
                'title' => 'Steam Summer Festival 2024 is Live: Up to 90% Off on Top AAA Titles',
                'summary' => 'Valve kicks off the biggest PC gaming event of the year with massive discounts on Cyberpunk 2077, Elden Ring, Baldur\'s Gate 3, and thousands of indie gems.',
                'image_url' => '/battlestation_setup.jpg',
                'source_url' => 'https://store.steampowered.com',
                'author' => 'Dave Miller',
                'tags' => ['Steam', 'Valve', 'PC Gaming', 'Sale'],
                'is_featured' => false,
                'is_breaking' => false,
                'views_count' => 64100,
                'saves_count' => 1840,
            ],
            [
                'title' => 'Call of Duty: Warzone Season 5 Reloaded: New Resurgence POIs & Weapon Meta Shift',
                'summary' => 'Activision deploys the mid-season update featuring the return of fan-favorite Superstore, heavy sniper adjustments, and the new EMP blast field upgrade.',
                'image_url' => '/clutch_gameplay.jpg',
                'source_url' => 'https://callofduty.com/warzone',
                'author' => 'Jax Thorne',
                'tags' => ['Warzone', 'Call of Duty', 'Battle Royale', 'Multiplayer'],
                'is_featured' => false,
                'is_breaking' => false,
                'views_count' => 52300,
                'saves_count' => 1420,
            ],
            [
                'title' => 'Minecraft 1.21 Tricky Trials Update Out Now: New Ominous Trials & Auto-Crafter',
                'summary' => 'Mojang officially releases the Tricky Trials update bringing the Breeze mob, the revolutionary redstone Crafter, Mace weapon, and trial chambers to Java and Bedrock.',
                'image_url' => '/minecraft_castle.jpg',
                'source_url' => 'https://minecraft.net',
                'author' => 'Sarah Lin',
                'tags' => ['Minecraft', 'Mojang', 'Sandbox', 'Update'],
                'is_featured' => false,
                'is_breaking' => false,
                'views_count' => 77900,
                'saves_count' => 2850,
            ],
            [
                'title' => 'VCT Champions 2024: Top 16 World Teams Confirmed for the Seoul Finals',
                'summary' => 'Fnatic, Sentinels, Paper Rex, and Gen.G prepare to clash in South Korea for the world championship trophy and a $2,250,000 prize pool.',
                'image_url' => 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&auto=format&fit=crop&q=80',
                'source_url' => 'https://valorantesports.com',
                'author' => 'Kevin Park',
                'tags' => ['Esports', 'VCT', 'Valorant', 'Tournament'],
                'is_featured' => false,
                'is_breaking' => false,
                'views_count' => 91400,
                'saves_count' => 3100,
            ],
        ];

        foreach ($articles as $art) {
            $slug = Str::slug($art['title']);
            NewsArticle::updateOrCreate(
                ['slug' => $slug],
                array_merge($art, [
                    'source_id' => $source->id,
                    'status' => 'published',
                    'published_at' => now()->subHours(rand(1, 24)),
                ])
            );
        }
    }
}
