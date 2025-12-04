<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('graduates', function (Blueprint $table) {
            $table->id();

            $table->foreignId('institution_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('program_id')->nullable()->constrained()->onDelete('set null');

            // Keys from SOAIS / Excel
            $table->string('hei_uii')->nullable();          // HEI UII (instCode)
            $table->string('so_number')->nullable();        // Special Order Number

            // Optional IDs (not in SOAIS now but kept for future)
            $table->string('student_id_number')->nullable();
            $table->string('date_of_birth')->nullable();

            // Student name
            $table->string('last_name');
            $table->string('first_name');
            $table->string('middle_name')->nullable();
            $table->string('extension_name')->nullable();

            // Sex
            $table->enum('sex', ['MALE', 'FEMALE'])->nullable();

            // Graduation info
            $table->string('date_graduated');        // from Excel "Date of Graduation"
            $table->string('academic_year')->nullable(); // from Excel "Academic Year"

            // Program info from Excel
            $table->text('course_from_excel');           // Program
            $table->text('major_from_excel')->nullable(); // Major
            $table->string('psced_code')->nullable();    // PSCED Code

            $table->timestamps();

            // Indexes
            $table->index('institution_id');
            $table->index('program_id');
            $table->index('last_name');
            $table->index('student_id_number');
            $table->index('hei_uii');
            $table->index('so_number');
            $table->index('psced_code');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('graduates');
    }
};
