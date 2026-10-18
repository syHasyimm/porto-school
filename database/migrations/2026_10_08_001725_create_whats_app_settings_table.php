<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('whats_app_settings', function (Blueprint $table): void {
            $table->id();
            $table->text('token')->nullable();
            $table->boolean('reminders_enabled')->default(false);
            $table->string('send_time', 5)->default('07:00');
            $table->string('timezone')->default('Asia/Jakarta');
            $table->string('admin_phone', 30)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('whats_app_settings');
    }
};
