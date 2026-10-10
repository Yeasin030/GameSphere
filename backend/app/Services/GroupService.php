<?php

namespace App\Services;

use Illuminate\Support\Facades\Redis;
use App\Models\Group;
use App\Models\User;

class GroupService
{
    /**
     * Add a user to a group and update Redis member count.
     */
    public function joinGroup(Group $group, User $user, string $role = 'member')
    {
        // Add to PostgreSQL DB
        $group->members()->attach($user->id, ['role' => $role, 'status' => 'approved']);

        // Increment in Redis
        Redis::incr("group:{$group->id}:members_count");
        // Also add to a set for real-time presence/listing if needed
        Redis::sadd("group:{$group->id}:members", $user->id);
    }

    /**
     * Remove a user from a group and update Redis member count.
     */
    public function leaveGroup(Group $group, User $user)
    {
        // Remove from PostgreSQL DB
        $group->members()->detach($user->id);

        // Decrement in Redis
        Redis::decr("group:{$group->id}:members_count");
        Redis::srem("group:{$group->id}:members", $user->id);
    }

    /**
     * Get real-time member count from Redis.
     */
    public function getMemberCount(Group $group): int
    {
        $count = Redis::get("group:{$group->id}:members_count");
        
        // Fallback to PostgreSQL if Redis is empty/cleared
        if ($count === null) {
            $count = $group->members()->count();
            Redis::set("group:{$group->id}:members_count", $count);
        }

        return (int) $count;
    }
}
