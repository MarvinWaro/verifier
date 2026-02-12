<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Make role column nullable for custom roles
        DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('admin', 'prc') NULL");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert to NOT NULL with default
        DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('admin', 'prc') NOT NULL DEFAULT 'admin'");
    }
};
