<?php

use App\Services\GraduateData;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $seen = [];
        foreach (DB::table('graduates')->select('id', 'hei_uii', 'so_number')->orderBy('id')->cursor() as $row) {
            $key = GraduateData::identity($row->hei_uii, $row->so_number);
            if ($key && isset($seen[$key])) {
                throw new RuntimeException("Duplicate graduate identity: record IDs {$seen[$key]} and {$row->id}. Resolve before migration; no records were changed.");
            }
            if ($key) {
                $seen[$key] = $row->id;
            }
        }
        unset($seen);
        Schema::table('graduates', function (Blueprint $table) {
            $table->string('identity_key', 64)->nullable()->unique();
            $table->string('program_key', 64)->nullable();
            $table->string('major_key', 64)->nullable();
            $table->unsignedSmallInteger('graduation_year')->nullable();
            $table->index(['hei_uii', 'program_key', 'major_key', 'graduation_year'], 'graduates_program_year_lookup');
            $table->index(['last_name', 'first_name', 'id'], 'graduates_name_order');
        });
        DB::table('graduates')->orderBy('id')->chunkById(500, function ($rows) {
            foreach ($rows as $row) {
                DB::table('graduates')->where('id', $row->id)->update(GraduateData::indexes((array) $row));
            }
        });
        Schema::create('graduate_imports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->unsignedTinyInteger('active_slot')->nullable()->unique();
            $table->string('filename');
            $table->string('path')->nullable();
            $table->string('sheet')->nullable();
            $table->string('status')->default('queued');
            $table->string('phase')->default('reading');
            $table->unsignedInteger('total_rows')->default(0);
            $table->text('error')->nullable();
            $table->timestamp('finished_at')->nullable();
            $table->timestamps();
        });
        Schema::create('graduate_import_chunks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('graduate_import_id')->constrained()->cascadeOnDelete();
            $table->unsignedInteger('start_row');
            $table->unsignedInteger('end_row');
            $table->string('phase')->default('reading');
            $table->string('status')->default('queued');
            foreach (['created', 'updated', 'unchanged', 'skipped', 'invalid'] as $column) {
                $table->unsignedInteger($column)->default(0);
            }
            $table->text('error')->nullable();
            $table->timestamps();
            $table->unique(['graduate_import_id', 'start_row']);
        });
        Schema::create('graduate_import_rows', function (Blueprint $table) {
            $table->id();
            $table->foreignId('graduate_import_id')->constrained()->cascadeOnDelete();
            $table->foreignId('graduate_import_chunk_id')->constrained()->cascadeOnDelete();
            $table->unsignedInteger('row_number');
            $table->string('identity_key', 64);
            $table->string('fingerprint', 64);
            $table->json('data');
            $table->unique(['graduate_import_id', 'row_number']);
            $table->index(['graduate_import_id', 'identity_key'], 'import_rows_identity');
        });
        Schema::create('graduate_import_issues', function (Blueprint $table) {
            $table->id();
            $table->foreignId('graduate_import_id')->constrained()->cascadeOnDelete();
            $table->unsignedInteger('row_number');
            $table->string('severity');
            $table->string('message', 500);
            $table->index(['graduate_import_id', 'row_number']);
        });
    }

    public function down(): void
    {
        foreach (['graduate_import_issues', 'graduate_import_rows', 'graduate_import_chunks', 'graduate_imports'] as $table) {
            Schema::dropIfExists($table);
        }
        Schema::table('graduates', function (Blueprint $table) {
            $table->dropIndex('graduates_program_year_lookup');
            $table->dropIndex('graduates_name_order');
            $table->dropUnique(['identity_key']);
            $table->dropColumn(['identity_key', 'program_key', 'major_key', 'graduation_year']);
        });
    }
};
