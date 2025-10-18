<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('institutions', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique()->nullable(); // Institution code (will generate if not provided)
            $table->string('name'); // Institution name
            $table->enum('type', ['public', 'private']); // public (SUC/LUC) or private (PHEI)
            $table->string('level')->nullable(); // BACCALAUREATE, GRADUATE, etc.
            $table->string('sector'); // SUC, LUC, PRIVATE
            $table->timestamps();

            $table->index('name');
            $table->index('type');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('institutions');
    }
};
