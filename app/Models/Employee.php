<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Employee extends Model
{
    use HasFactory;

    protected $table = 'employees';

    protected $fillable = [
        'name',
        'email',
        'phone',
        'address',
        'joining_date',
        'birthday',
        'company_id',
        'country_id',
        'user_id',
        'active',
    ];

    protected $casts = [
        'joining_date' => 'date',
        'birthday'     => 'date',
        'active'       => 'boolean',
    ];

    /* ==========================
     | Display helpers
     ========================== */

    public function getDisplayNameAttribute()
    {
        return "{$this->name} ({$this->email})";
    }

    /* ==========================
     | Dynamic form fields
     ========================== */

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
            'phone' => [
                'type' => 'char',
                'label' => 'Phone',
            ],
            'address' => [
                'type' => 'text',
                'label' => 'Address',
            ],
            'joining_date' => [
                'type' => 'date',
                'label' => 'Joining Date',
                'required' => true,
            ],
            'birthday' => [
                'type' => 'date',
                'label' => 'Date of Birth',
            ],
            'company_id' => [
                'type' => 'many2one',
                'label' => 'Company',
                'relation' => 'companies',
                'required' => true,
            ],
            'country_id' => [
                'type' => 'many2one',
                'label' => 'Country',
                'relation' => 'countries',
            ],
            'user_id' => [
                'type' => 'many2one',
                'label' => 'System User',
                'relation' => 'users',
            ],
        ];
    }

    /* ==========================
     | Relationships
     ========================== */

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function country()
    {
        return $this->belongsTo(Country::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
