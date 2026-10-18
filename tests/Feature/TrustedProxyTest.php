<?php

use Illuminate\Support\Facades\Route;

beforeEach(function () {
    Route::get('/_test/font-url', fn (): array => [
        'font_url' => asset('build/assets/manrope.woff2'),
    ]);
});

it('generates HTTPS font URLs behind a proxy while preserving the request host', function () {
    $this->withServerVariables(['REMOTE_ADDR' => '172.18.0.2'])
        ->withHeaders([
            'X-Forwarded-Proto' => 'https',
            'X-Forwarded-Port' => '443',
            'X-Forwarded-Host' => 'other.example',
        ])
        ->get('http://school.example/_test/font-url')
        ->assertJsonPath('font_url', 'https://school.example/build/assets/manrope.woff2');
});

it('keeps HTTP font URLs and the public port for direct local requests', function () {
    $this->get('http://localhost:8081/_test/font-url')
        ->assertJsonPath('font_url', 'http://localhost:8081/build/assets/manrope.woff2');
});
