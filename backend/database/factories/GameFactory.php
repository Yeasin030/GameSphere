<?php

namespace Database\Factories;

use App\Models\Game;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class GameFactory extends Factory
{
    protected $model = Game::class;

    public function definition(): array
    {
        $name = $this->faker->words(3, true);
        return [
            'title' => ucwords($name),
            'slug' => Str::slug($name),
            'description' => $this->faker->paragraphs(3, true),
            'developer' => $this->faker->company(),
            'publisher' => $this->faker->company(),
            'release_date' => $this->faker->date(),
        ];
    }
}
