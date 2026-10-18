<?php

namespace App\Services;

use App\Enums\WhatsAppDeliveryStatus;
use App\Models\WhatsAppSetting;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class FonnteClient
{
    /** @return array{status: WhatsAppDeliveryStatus, reason: string|null, provider_ids: list<string>, request_id: string|null} */
    public function send(string $phone, string $message): array
    {
        $token = WhatsAppSetting::current()->effectiveToken();
        if ($token === null) {
            return $this->result(WhatsAppDeliveryStatus::Failed, 'Token Fonnte belum diatur.');
        }

        try {
            $response = Http::asForm()->acceptJson()
                ->withHeaders(['Authorization' => $token])
                ->withOptions(['allow_redirects' => false])
                ->connectTimeout(5)->timeout(20)
                ->post('https://api.fonnte.com/send', [
                    'target' => $phone,
                    'message' => $message,
                    'countryCode' => '0',
                    'connectOnly' => true,
                ]);
        } catch (ConnectionException) {
            return $this->result(WhatsAppDeliveryStatus::NeedsReview, 'Koneksi terputus atau batas waktu terlampaui. Periksa dashboard Fonnte sebelum mengambil tindakan.');
        }

        $data = $response->json();
        $status = is_array($data) ? ($data['status'] ?? $data['Status'] ?? null) : null;
        if ($response->successful() && $status === true) {
            $ids = [];
            foreach ((array) ($data['id'] ?? []) as $id) {
                if (is_scalar($id)) {
                    $ids[] = Str::limit(str_replace($token, '[disamarkan]', (string) $id), 100, '');
                }
            }
            $requestId = $data['requestid'] ?? null;

            return [
                'status' => WhatsAppDeliveryStatus::Accepted,
                'reason' => null,
                'provider_ids' => $ids,
                'request_id' => is_scalar($requestId) ? Str::limit(str_replace($token, '[disamarkan]', (string) $requestId), 100, '') : null,
            ];
        }

        if ($status === false && ! $response->serverError()) {
            $reason = $data['reason'] ?? $data['detail'] ?? 'Permintaan ditolak Fonnte.';
            $reason = is_string($reason) ? $reason : 'Permintaan ditolak Fonnte.';

            return $this->result(WhatsAppDeliveryStatus::Failed, Str::limit(strip_tags(str_replace($token, '[disamarkan]', $reason)), 500, ''));
        }

        return $this->result(WhatsAppDeliveryStatus::NeedsReview, 'Respons Fonnte tidak memastikan hasil pengiriman (HTTP '.$response->status().'). Periksa dashboard Fonnte.');
    }

    /** @return array{status: WhatsAppDeliveryStatus, reason: string|null, provider_ids: list<string>, request_id: string|null} */
    private function result(WhatsAppDeliveryStatus $status, ?string $reason): array
    {
        return ['status' => $status, 'reason' => $reason, 'provider_ids' => [], 'request_id' => null];
    }
}
