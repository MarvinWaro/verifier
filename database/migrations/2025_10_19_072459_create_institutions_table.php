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
            $table->string('institution_code')->unique();
            $table->string('name');
            $table->enum('type', ['Private', 'SUCs', 'LUCs']);
            $table->timestamps();

            // Add index for faster searching
            $table->index('institution_code');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('institutions');
    }
};
