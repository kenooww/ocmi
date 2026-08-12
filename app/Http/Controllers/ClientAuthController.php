<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ClientAuthController extends Controller
{
    public function showLogin()
    {
        return Inertia::render('Client/ClientLogin');
    }

    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if (Auth::guard('client')->attempt($credentials)) {
            $request->session()->regenerate();
            return redirect()->route('client.dashboard');
        }

        return back()->withErrors(['email' => 'Invalid login details.']);
    }

    public function dashboard()
    {
        $client = Auth::guard('client')->user();

        return Inertia::render('Client/Dashboard', [
            'client' => [
                'id' => $client->id,
                'name' => $client->name,
                'email' => $client->email,
                'phone' => $client->phone,
                'address' => $client->address,
                'created_at' => $client->created_at->toFormattedDateString(),
            ],
        ]);
    }

    public function logout(Request $request)
    {
        Auth::guard('client')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        return redirect()->route('client.login');
    }


}
