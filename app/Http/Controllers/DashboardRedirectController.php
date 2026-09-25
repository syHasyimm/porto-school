<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class DashboardRedirectController extends Controller
{
    public function __invoke(Request $request): RedirectResponse
    {
        $user = $request->user();

        if (! $user instanceof User) {
            return to_route('login');
        }

        return $user->isAdmin()
            ? to_route('admin.dashboard')
            : to_route('guru.dashboard');
    }
}
