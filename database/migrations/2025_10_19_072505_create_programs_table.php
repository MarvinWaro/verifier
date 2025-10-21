<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('programs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('institution_id')->constrained()->onDelete('cascade');
            $table->string('program_name');
            $table->string('major')->nullable();
            $table->string('program_type')->nullable(); // Board or Non-Board
            $table->string('permit_number');
            $table->timestamps();

            // Add indexes for faster searching
            $table->index('institution_id');
            $table->index('program_name');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('programs');
    }
};
