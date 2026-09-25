<?php

use App\Enums\ComplaintStatus;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('complaints', function (Blueprint $table) {
            $table->id();
            $table->string('reference_number', 24)->unique();
            $table->string('reporter_name');
            $table->string('email');
            $table->string('phone', 30);
            $table->string('student_name');
            $table->string('student_class', 30);
            $table->string('category');
            $table->text('body');
            $table->string('attachment_path')->nullable();
            $table->string('status')->default(ComplaintStatus::Baru->value);
            $table->timestamps();

            $table->index(['status', 'created_at']);
            $table->index(['category', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('complaints');
    }
};
