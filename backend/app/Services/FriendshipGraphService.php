<?php

namespace App\Services;

use Laudis\Neo4j\ClientBuilder;

class FriendshipGraphService
{
    protected $client;

    public function __construct()
    {
        $host = env('NEO4J_HOST', 'localhost');
        $port = env('NEO4J_PORT', 7687);
        $user = env('NEO4J_USERNAME', 'neo4j');
        $pass = env('NEO4J_PASSWORD', 'password');

        $this->client = ClientBuilder::create()
            ->withDriver('default', "bolt://{$user}:{$pass}@{$host}:{$port}")
            ->build();
    }

    public function createFriendship(int $userId1, int $userId2)
    {
        $query = "
            MERGE (u1:User {id: \$user1})
            MERGE (u2:User {id: \$user2})
            MERGE (u1)-[:FRIENDS_WITH]->(u2)
            MERGE (u2)-[:FRIENDS_WITH]->(u1)
        ";

        $this->client->run($query, [
            'user1' => $userId1,
            'user2' => $userId2
        ]);
    }

    public function removeFriendship(int $userId1, int $userId2)
    {
        $query = "
            MATCH (u1:User {id: \$user1})-[r:FRIENDS_WITH]-(u2:User {id: \$user2})
            DELETE r
        ";

        $this->client->run($query, [
            'user1' => $userId1,
            'user2' => $userId2
        ]);
    }

    public function getRecommendations(int $userId, int $limit = 5)
    {
        $query = "
            MATCH (u:User {id: \$userId})-[:FRIENDS_WITH]-(friend:User)-[:FRIENDS_WITH]-(fof:User)
            WHERE u <> fof AND NOT (u)-[:FRIENDS_WITH]-(fof)
            RETURN fof.id AS recommended_user_id, count(*) AS mutual_friends
            ORDER BY mutual_friends DESC
            LIMIT \$limit
        ";

        $results = $this->client->run($query, [
            'userId' => $userId,
            'limit'  => $limit
        ]);

        $recommendations = [];
        foreach ($results as $result) {
            $recommendations[] = [
                'user_id' => $result->get('recommended_user_id'),
                'mutual_friends' => $result->get('mutual_friends')
            ];
        }

        return $recommendations;
    }
}
