<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Supplier extends Model
{
    use HasFactory;

    protected $table = 'suppliers';

    protected $fillable = [
        'name',
        'type',
        'email',
        'phone',
        'address',
        'active',
    ];

    public static function fields(): array
    {
        return [
            'name' => [
                'type' => 'char',
                'label' => 'Name',
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
            'address' => [
                'type' => 'char',
                'label' => 'Address',
            ],
            'active' => [
                'type' => 'boolean',
                'label' => 'Active',
            ],
        ];
    }


}
