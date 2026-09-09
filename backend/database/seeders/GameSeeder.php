<?php

namespace Database\Seeders;

use App\Models\Game;
use App\Models\Genre;
use App\Models\Platform;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class GameSeeder extends Seeder
{
    public function run(): void
    {
        $platforms = [
            'PC', 'PlayStation 5', 'PlayStation 4', 'Xbox Series X/S', 'Xbox One', 'Nintendo Switch', 'Mobile'
        ];

        $platformIds = [];
        foreach ($platforms as $platform) {
            $p = Platform::firstOrCreate(['name' => $platform], ['slug' => Str::slug($platform)]);
            $platformIds[$platform] = $p->id;
        }

        $genres = [
            'Action', 'RPG', 'Shooter', 'Battle Royale', 'Tactical FPS', 'Strategy', 'Sports', 'Racing', 'Simulation', 'Adventure', 'Sandbox', 'MOBA', 'Co-op'
        ];

        $genreIds = [];
        foreach ($genres as $genre) {
            $g = Genre::firstOrCreate(['name' => $genre], ['slug' => Str::slug($genre)]);
            $genreIds[$genre] = $g->id;
        }

        $games = [
            [
                'name' => 'Valorant',
                'description' => 'A 5v5 character-based tactical shooter where precise gunplay meets unique agent abilities in high-stakes competitive bomb defusal.',
                'developer' => 'Riot Games',
                'publisher' => 'Riot Games',
                'release_date' => '2020-06-02',
                'cover_image' => '/squad_emblem.jpg',
                'background_image' => '/squad_emblem.jpg',
                'platforms' => ['PC', 'PlayStation 5', 'Xbox Series X/S'],
                'genres' => ['Shooter', 'Tactical FPS', 'Action'],
                'is_featured' => true,
                'is_trending' => true,
                'is_free' => true,
                'players_count' => 148000,
                'average_rating' => 4.9,
            ],
            [
                'name' => 'Call of Duty: Warzone',
                'description' => 'Drop into the massive free-to-play battle royale arena, survive intense gulag duels, and dominate with loadout drops across Urzikstan.',
                'developer' => 'Infinity Ward & Raven Software',
                'publisher' => 'Activision',
                'release_date' => '2020-03-10',
                'cover_image' => '/clutch_gameplay.jpg',
                'background_image' => '/clutch_gameplay.jpg',
                'platforms' => ['PC', 'PlayStation 5', 'Xbox Series X/S'],
                'genres' => ['Shooter', 'Battle Royale', 'Action'],
                'is_featured' => true,
                'is_trending' => true,
                'is_free' => true,
                'players_count' => 112000,
                'average_rating' => 4.7,
            ],
            [
                'name' => 'Grand Theft Auto V',
                'description' => 'Experience the critically acclaimed open-world epic of Los Santos, pull off daring multiplayer heists, and rule GTA Online with your criminal empire.',
                'developer' => 'Rockstar North',
                'publisher' => 'Rockstar Games',
                'release_date' => '2013-09-17',
                'cover_image' => 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80',
                'background_image' => 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80',
                'platforms' => ['PC', 'PlayStation 5', 'Xbox Series X/S'],
                'genres' => ['Action', 'Adventure'],
                'is_featured' => true,
                'is_trending' => true,
                'is_free' => false,
                'players_count' => 96000,
                'average_rating' => 4.9,
            ],
            [
                'name' => 'Minecraft',
                'description' => 'Explore infinite randomly generated worlds, build majestic creations from humble shelters to grandiose castles, and survive the night with friends.',
                'developer' => 'Mojang Studios',
                'publisher' => 'Xbox Game Studios',
                'release_date' => '2011-11-18',
                'cover_image' => '/minecraft_castle.jpg',
                'background_image' => '/minecraft_castle.jpg',
                'platforms' => ['PC', 'PlayStation 5', 'Xbox Series X/S', 'Nintendo Switch', 'Mobile'],
                'genres' => ['Sandbox', 'Adventure', 'Simulation'],
                'is_featured' => true,
                'is_trending' => false,
                'is_free' => false,
                'players_count' => 88000,
                'average_rating' => 4.8,
            ],
            [
                'name' => 'Counter-Strike 2',
                'description' => 'The next leap forward for competitive tactical FPS gaming, rebuilt from the ground up on Valve\'s Source 2 engine with sub-tick precision and dynamic smoke.',
                'developer' => 'Valve',
                'publisher' => 'Valve',
                'release_date' => '2023-09-27',
                'cover_image' => 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&auto=format&fit=crop&q=80',
                'background_image' => 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&auto=format&fit=crop&q=80',
                'platforms' => ['PC'],
                'genres' => ['Shooter', 'Tactical FPS', 'Action'],
                'is_featured' => true,
                'is_trending' => true,
                'is_free' => true,
                'players_count' => 155000,
                'average_rating' => 4.9,
            ],
            [
                'name' => 'Black Myth: Wukong',
                'description' => 'An action RPG rooted in Chinese mythology where you venture out as the Destined One to encounter formidable rivals and master staff techniques.',
                'developer' => 'Game Science',
                'publisher' => 'Game Science',
                'release_date' => '2024-08-20',
                'cover_image' => 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80',
                'background_image' => 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80',
                'platforms' => ['PC', 'PlayStation 5'],
                'genres' => ['Action', 'RPG', 'Adventure'],
                'is_featured' => true,
                'is_trending' => true,
                'is_free' => false,
                'players_count' => 135000,
                'average_rating' => 4.9,
            ],
            [
                'name' => 'Cyberpunk 2077',
                'description' => 'An open-world action-adventure RPG set in the megalopolis of Night City, obsessed with power, cyberware implants, and underworld corporate intrigue.',
                'developer' => 'CD Projekt Red',
                'publisher' => 'CD Projekt',
                'release_date' => '2020-12-10',
                'cover_image' => '/battlestation_setup.jpg',
                'background_image' => '/battlestation_setup.jpg',
                'platforms' => ['PC', 'PlayStation 5', 'Xbox Series X/S'],
                'genres' => ['RPG', 'Action', 'Shooter'],
                'is_featured' => false,
                'is_trending' => true,
                'is_free' => false,
                'players_count' => 64000,
                'average_rating' => 4.8,
            ],
            [
                'name' => 'Elden Ring',
                'description' => 'A fantasy action-RPG masterpiece set within the vast Lands Between. Rise, Tarnished, brandish great runes, and become an Elden Lord.',
                'developer' => 'FromSoftware',
                'publisher' => 'Bandai Namco',
                'release_date' => '2022-02-25',
                'cover_image' => 'https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?w=800&auto=format&fit=crop&q=80',
                'background_image' => 'https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?w=800&auto=format&fit=crop&q=80',
                'platforms' => ['PC', 'PlayStation 5', 'Xbox Series X/S'],
                'genres' => ['RPG', 'Action'],
                'is_featured' => true,
                'is_trending' => false,
                'is_free' => false,
                'players_count' => 72000,
                'average_rating' => 5.0,
            ],
            [
                'name' => 'Fortnite',
                'description' => 'Drop onto the island and battle to be the last player or squad standing. Build, shoot, and participate in legendary live events with cross-platform play.',
                'developer' => 'Epic Games',
                'publisher' => 'Epic Games',
                'release_date' => '2017-07-21',
                'cover_image' => 'https://images.unsplash.com/photo-1589241062272-c0a000072dfa?w=800&auto=format&fit=crop&q=80',
                'background_image' => 'https://images.unsplash.com/photo-1589241062272-c0a000072dfa?w=800&auto=format&fit=crop&q=80',
                'platforms' => ['PC', 'PlayStation 5', 'Xbox Series X/S', 'Nintendo Switch', 'Mobile'],
                'genres' => ['Battle Royale', 'Shooter', 'Action'],
                'is_featured' => true,
                'is_trending' => true,
                'is_free' => true,
                'players_count' => 195000,
                'average_rating' => 4.7,
            ],
            [
                'name' => 'Helldivers 2',
                'description' => 'Join the galaxy\'s last line of offence against alien swarms and automaton legions in fast, frantic third-person squad co-op shooter combat.',
                'developer' => 'Arrowhead Game Studios',
                'publisher' => 'PlayStation Publishing',
                'release_date' => '2024-02-08',
                'cover_image' => 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&auto=format&fit=crop&q=80',
                'background_image' => 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&auto=format&fit=crop&q=80',
                'platforms' => ['PC', 'PlayStation 5'],
                'genres' => ['Shooter', 'Action', 'Co-op'],
                'is_featured' => true,
                'is_trending' => true,
                'is_free' => false,
                'players_count' => 89000,
                'average_rating' => 4.8,
            ],
            [
                'name' => 'Apex Legends',
                'description' => 'Master an ever-growing roster of legendary characters with powerful abilities in a strategic, fast-paced battle royale experience.',
                'developer' => 'Respawn Entertainment',
                'publisher' => 'Electronic Arts',
                'release_date' => '2019-02-04',
                'cover_image' => 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&auto=format&fit=crop&q=80',
                'background_image' => 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&auto=format&fit=crop&q=80',
                'platforms' => ['PC', 'PlayStation 5', 'Xbox Series X/S', 'Nintendo Switch'],
                'genres' => ['Shooter', 'Battle Royale', 'Action'],
                'is_featured' => false,
                'is_trending' => true,
                'is_free' => true,
                'players_count' => 78000,
                'average_rating' => 4.6,
            ],
            [
                'name' => 'League of Legends',
                'description' => 'The world\'s most played team-based MOBA strategy game. Outplay, outthink, and destroy the enemy Nexus with over 160 champions.',
                'developer' => 'Riot Games',
                'publisher' => 'Riot Games',
                'release_date' => '2009-10-27',
                'cover_image' => 'https://images.unsplash.com/photo-1563089145-599997674d42?w=800&auto=format&fit=crop&q=80',
                'background_image' => 'https://images.unsplash.com/photo-1563089145-599997674d42?w=800&auto=format&fit=crop&q=80',
                'platforms' => ['PC'],
                'genres' => ['MOBA', 'Strategy', 'Action'],
                'is_featured' => true,
                'is_trending' => true,
                'is_free' => true,
                'players_count' => 220000,
                'average_rating' => 4.8,
            ],
            [
                'name' => 'Red Dead Redemption 2',
                'description' => 'America, 1899. Arthur Morgan and the Van der Linde gang are outlaws on the run across the rugged heartland of America.',
                'developer' => 'Rockstar Games',
                'publisher' => 'Rockstar Games',
                'release_date' => '2018-10-26',
                'cover_image' => 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800&auto=format&fit=crop&q=80',
                'background_image' => 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800&auto=format&fit=crop&q=80',
                'platforms' => ['PC', 'PlayStation 5', 'Xbox Series X/S'],
                'genres' => ['Action', 'Adventure', 'RPG'],
                'is_featured' => false,
                'is_trending' => false,
                'is_free' => false,
                'players_count' => 52000,
                'average_rating' => 5.0,
            ],
            [
                'name' => 'eFootball 2024',
                'description' => 'Konami\'s flagship soccer simulator featuring realistic physics, Dream Team squad building, and cross-platform esports matches.',
                'developer' => 'Konami',
                'publisher' => 'Konami',
                'release_date' => '2021-09-30',
                'cover_image' => 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&auto=format&fit=crop&q=80',
                'background_image' => 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&auto=format&fit=crop&q=80',
                'platforms' => ['PC', 'PlayStation 5', 'Xbox Series X/S', 'Mobile'],
                'genres' => ['Sports', 'Simulation'],
                'is_featured' => false,
                'is_trending' => true,
                'is_free' => true,
                'players_count' => 45000,
                'average_rating' => 4.5,
            ]
        ];

        foreach ($games as $gameData) {
            $pData = $gameData['platforms'];
            $gData = $gameData['genres'];

            unset($gameData['platforms'], $gameData['genres']);

            $slug = Str::slug($gameData['name']);
            $game = Game::updateOrCreate(
                ['slug' => $slug],
                array_merge($gameData, [
                    'short_description' => Str::limit($gameData['description'], 140),
                    'is_multiplayer' => true,
                    'is_online_multiplayer' => true,
                    'is_active' => true,
                ])
            );

            $pIds = array_map(fn($p) => $platformIds[$p], $pData);
            $gIds = array_map(fn($g) => $genreIds[$g], $gData);

            $game->platforms()->sync($pIds);
            $game->genres()->sync($gIds);
        }
    }
}
