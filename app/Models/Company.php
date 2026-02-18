<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Company extends Model
{
    use HasFactory;

    protected $table = 'companies';

    protected $fillable = [
        'name',
        'address',
        'logo',
        'email',
        'phone',
        'mobile',
        'vat',
        'website',
        'active',
        'country_id',
        'currency_id',
        'logo'
    ];

    public static function fields(): array
    {
        return [
            'logo'=>[
                'label' => 'Logo',
                'type' => 'image',

            ],
            'name' => [
                'type' => 'char',
                'label' => 'Company Name',
                'required' => true,
            ],
            'email' => [
                'type' => 'char',
                'label' => 'Email',
            ],
            'phone' => [
                'type' => 'char',
                'label' => 'Phone',
            ],
            'mobile' => [
                'type' => 'char',
                'label' => 'Mobile',
            ],
            'vat' => [
                'type' => 'char',
                'label' => 'VAT Number',
            ],
            'website' => [
                'type' => 'char',
                'label' => 'Website',
            ],
            'address' => [
                'type' => 'char',
                'label' => 'Address',
            ],
            'country_id' => [
                'type' => 'many2one',
                'label' => 'Country',
                'relation' => 'countries',
            ],
            'currency_id' => [
                'type' => 'many2one',
                'label' => 'Currency',
                'relation' => 'currencies',
            ]
        ];
    }
    /* ==========================
     | Relationships
     ========================== */

    public function country()
    {
        return $this->belongsTo(Country::class);
    }

    public function currency()
    {
        return $this->belongsTo(Currency::class);
    }

    public function users()
    {
        return $this->belongsToMany(User::class, 'company_users')
            ->withPivot('role_id')
            ->withTimestamps();
    }
}
