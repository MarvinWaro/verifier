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

            // Student Information
            $table->string('student_id_number')->nullable(); // Column B
            $table->string('date_of_birth')->nullable(); // Column C - ADD THIS!
            $table->string('last_name'); // Column D
            $table->string('first_name'); // Column E
            $table->string('middle_name')->nullable(); // Column F
            $table->string('extension_name')->nullable(); // Column G
            $table->enum('sex', ['MALE', 'FEMALE'])->nullable(); // Column H
            $table->string('date_graduated'); // Column I

            // Course/Program from Excel (for reference/debugging)
            $table->text('course_from_excel'); // Column J - Store original course name
            $table->text('major_from_excel')->nullable(); // Column K - Store original major

            // Additional IDs
            $table->string('so_number')->nullable(); // Column L - SO Number
            $table->string('lrn')->nullable(); // Column M - LRN
            $table->string('philsys_id')->nullable(); // Column N - PhilSys ID

            $table->timestamps();

            // Indexes for faster searching
            $table->index('institution_id');
            $table->index('program_id');
            $table->index('last_name');
            $table->index('student_id_number');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('graduates');
    }
};
