<?php

namespace App\Actions\Fortify;

use Illuminate\Http\Request;
use Laravel\Fortify\Contracts\LoginResponse as LoginResponseContract;
use Laravel\Fortify\Fortify;

class LoginResponse implements LoginResponseContract
{
    /**
     * Create an HTTP response that represents the object.
     */
    public function toResponse($request)
    {
        $redirectTo = $this->redirectPath($request);

        if ($request->wantsJson()) {
            return response()->json(['two_factor' => false, 'redirect' => $redirectTo]);
        }

        return redirect()->intended($redirectTo);
    }

    protected function redirectPath(Request $request): string
    {
        $user = $request->user();

        if (! $user) {
            return config('fortify.home');
        }

        if ($user->hasRole('Admin')) {
            return route('orders.index');
        }

        if ($user->hasRole('Mechanic')) {
            return route('orders.index');
        }

        if ($user->hasRole('Accountant')) {
            return route('orders.index');
        }

        if ($user->hasRole('Customer')) {
            return route('orders.index');
        }
        if ($user->hasRole('Mr. Lube')) {
            return route('reports.billingReport');
        }

        return config('fortify.home');
    }
}
