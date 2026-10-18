<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('teacher_contacts', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('teacher_profile_id')->nullable()->unique()->constrained()->nullOnDelete();
            $table->string('name');
            $table->string('phone', 30)->nullable();
            $table->boolean('is_active')->default(true);
            $table->boolean('notifications_enabled')->default(false);
            $table->timestamps();
        });

        DB::table('teacher_profiles')->join('users', 'users.id', '=', 'teacher_profiles.user_id')
            ->where('users.role', 'guru')->select('teacher_profiles.id', 'users.name', 'teacher_profiles.phone')
            ->orderBy('teacher_profiles.id')->chunkById(100, function ($profiles): void {
                foreach ($profiles as $profile) {
                    DB::table('teacher_contacts')->insert([
                        'teacher_profile_id' => $profile->id,
                        'name' => $profile->name,
                        'phone' => $profile->phone,
                        'is_active' => true,
                        'notifications_enabled' => false,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }
            }, 'teacher_profiles.id', 'id');
    }

    public function down(): void
    {
        Schema::dropIfExists('teacher_contacts');
    }
};
