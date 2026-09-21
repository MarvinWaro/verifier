<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (DB::getDriverName() === 'sqlite') {
            Schema::table('users', fn (Blueprint $table) => $table->string('role')->nullable()->change());

            return;
        }
        // Make role column nullable for custom roles
        DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('admin', 'prc') NULL");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (DB::getDriverName() === 'sqlite') {
            Schema::table('users', fn (Blueprint $table) => $table->string('role')->nullable(false)->default('admin')->change());

            return;
        }
        // Revert to NOT NULL with default
        DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('admin', 'prc') NOT NULL DEFAULT 'admin'");
    }
};
