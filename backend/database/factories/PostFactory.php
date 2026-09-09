<?php

namespace Database\Factories;

use App\Models\Post;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class PostFactory extends Factory
{
    protected $model = Post::class;

    private static array $gamingContents = [
        "Just hit Diamond rank in Valorant after 3 weeks of grinding! The ranked climb is real 💎🎯",
        "Anyone else playing Cyberpunk 2077 Phantom Liberty? The story is absolutely insane 🤯 #CyberpunkPhantomLiberty",
        "Finally built my first gaming PC! RTX 4080 + Ryzen 9 7950X. The performance is unreal 🖥️⚡",
        "Apex Legends Season 22 is here and the new legend is BROKEN. Nerf incoming for sure 😅 #ApexLegends",
        "Spent 6 hours grinding Elden Ring DLC and I finally beat Messmer. Hardest boss fight I've ever done 🏆",
        "Who else is hyped for GTA 6? The trailer looked amazing. Can't wait for 2025! #GTA6 #Rockstar",
        "Pro tip: if you're struggling in ranked, play support. Your teammates will love you 💚",
        "The new Call of Duty map is fire 🔥 The verticality adds so much to the gameplay. 10/10 map design",
        "Just reached 1000 hours in Minecraft. Still haven't finished my mega build project 😂 #Minecraft",
        "League of Legends new champion kit looks insane. Can't wait to see it in the meta #LeagueOfLegends",
        "Finally got my first Warzone win after 47 attempts. The grind was worth it! 🏆 #Warzone",
        "Playing Baldur's Gate 3 for the third time and I'm still discovering new dialogue options. GOTY forever 🎮",
        "The gaming chair just arrived and my back pain is already gone. Invest in ergonomics people! 💺",
        "Stream starting in 10 minutes! We're grinding ranked till Challenger today. Join us! 🎮✨",
        "Spider-Man 2 platinum trophy unlocked! What a game, Insomniac never misses 🕷️ #SpiderMan2",
    ];

    public function definition(): array
    {
        return [
            'user_id'        => User::factory(),
            'content'        => $this->faker->randomElement(self::$gamingContents),
            'type'           => 'text',
            'visibility'     => 'public',
            'ranking_score'  => $this->faker->randomFloat(6, 0, 100),
            'reactions_count'=> $this->faker->numberBetween(0, 500),
            'comments_count' => $this->faker->numberBetween(0, 100),
            'shares_count'   => $this->faker->numberBetween(0, 50),
            'views_count'    => $this->faker->numberBetween(10, 10000),
        ];
    }
}
