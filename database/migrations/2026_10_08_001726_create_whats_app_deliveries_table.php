<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('whats_app_deliveries', function (Blueprint $table): void {
            $table->id();
            $table->string('kind')->default('reminder');
            // Audit identifiers survive deletion of the original event or contact.
            $table->unsignedBigInteger('academic_event_id')->nullable();
            $table->unsignedBigInteger('teacher_contact_id')->nullable();
            $table->string('event_title');
            $table->string('recipient_name');
            $table->string('phone', 30);
            $table->date('reminder_date');
            $table->string('timezone');
            $table->text('message')->nullable();
            $table->string('status')->default('pending');
            $table->unsignedInteger('attempts')->default(0);
            $table->timestamp('available_at');
            $table->timestamp('dispatched_at')->nullable();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('finished_at')->nullable();
            $table->timestamp('accepted_at')->nullable();
            $table->text('failure_reason')->nullable();
            $table->json('provider_ids')->nullable();
            $table->string('provider_request_id')->nullable();
            $table->json('attempt_history')->nullable();
            $table->timestamps();
            $table->unique(['academic_event_id', 'phone', 'reminder_date'], 'wa_event_phone_day_unique');
            $table->unique(['academic_event_id', 'teacher_contact_id', 'reminder_date'], 'wa_event_contact_day_unique');
            $table->index(['status', 'available_at']);
            $table->index(['status', 'started_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('whats_app_deliveries');
    }
};
