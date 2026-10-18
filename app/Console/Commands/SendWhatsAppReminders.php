<?php

namespace App\Console\Commands;

use App\Services\WhatsAppReminderService;
use Illuminate\Console\Command;

class SendWhatsAppReminders extends Command
{
    protected $signature = 'whatsapp:remind';

    protected $description = 'Antrekan pengingat agenda hari ini untuk kontak guru yang memenuhi syarat';

    public function handle(WhatsAppReminderService $reminders): int
    {
        $this->info($reminders->enqueue().' pengingat baru diantrekan.');

        return self::SUCCESS;
    }
}
