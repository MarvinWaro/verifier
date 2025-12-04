<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('activity_logs', function (Blueprint $table) {
            $table->id();

            // user who did the action (nullable in case of system jobs)
            $table->foreignId('user_id')
                ->nullable()
                ->constrained()
                ->nullOnDelete();

            // short key for what happened
            $table->string('action'); // e.g. graduates_import, graduate_update, graduate_delete

            // optional target model
            $table->string('subject_type')->nullable(); // e.g. App\Models\Graduate
            $table->unsignedBigInteger('subject_id')->nullable();

            // short message to display in the UI
            $table->string('summary');

            // anything extra you want to store (counts, changed fields, file name, etc.)
            $table->json('properties')->nullable();

            $table->timestamps();

            $table->index(['action', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('activity_logs');
    }
};
