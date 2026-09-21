<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('catalog_sync_runs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->unsignedTinyInteger('active_slot')->nullable()->unique();
            $table->string('status')->default('queued');
            $table->text('error')->nullable();
            $table->timestamp('finished_at')->nullable();
            $table->timestamps();
        });
        Schema::create('catalog_sync_schools', function (Blueprint $table) {
            $table->id();
            $table->foreignId('catalog_sync_run_id')->constrained()->cascadeOnDelete();
            $table->string('institution_code');
            $table->string('institution_name');
            $table->string('status')->default('queued');
            $table->unsignedInteger('created_count')->default(0);
            $table->text('error')->nullable();
            $table->timestamps();
            $table->unique(['catalog_sync_run_id', 'institution_code']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('catalog_sync_schools');
        Schema::dropIfExists('catalog_sync_runs');
    }
};
