<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Avoid caching issues
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        \Spatie\Permission\Models\Role::firstOrCreate(['name' => 'user']);
        \Spatie\Permission\Models\Role::firstOrCreate(['name' => 'admin']);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        \Spatie\Permission\Models\Role::whereIn('name', ['user', 'admin'])->delete();
    }
};
