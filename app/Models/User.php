<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;
use Spatie\Permission\Traits\HasRoles;
class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, TwoFactorAuthenticatable,HasRoles;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'active',
    ];

    public static function fields(): array
    {
        return [
            'name' => [
                'type' => 'char',
                'label' => 'Full Name',
                'required' => true,
            ],
            'email' => [
                'type' => 'char',
                'label' => 'Email',
                'required' => true,
            ],
            'roles' => [
                'type' => 'many2many',
                'label' => 'Roles',
                'relation' => 'roles',
            ],
            'password' => [
                'type' => 'password',
                'label' => 'Password',
                'required' => true,
            ],
            'password_confirmation' => [
                'type' => 'password',
                'label' => 'Confirm Password',
                'required' => true,
            ],
            'active' => [
                'type' => 'boolean',
                'label' => 'Active',
                'default' => true,
            ],
            
        ];
    }

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
        ];
    }
}
