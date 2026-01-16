<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Vehicle extends Model
{
    use HasFactory;

    protected $table = 'vehicles';

    protected $fillable = [
        'customer_id',
        'name',
        'vin',
        'license_plate',
        'model',
        'year',
        'make'
    ];

    // Accessor for dropdown display
    public function getDisplayNameAttribute()
    {
        return trim(($this->vin ? $this->vin . ' - ' : '')
                    .($this->license_plate ? $this->license_plate . ' - ' : '')
                    . $this->model
                    . ($this->year ? ' (' . $this->year . ')' : ''));
    }

    public static function fields(): array
    {
        return [
            'customer_id' => ['label' => 'Customer', 'type' => 'many2one', 'relation' => 'customers', 'quick_create' => true,'edit_route' => 'customers.edit',],
            'name' => [
                'type' => 'char',
                'label' => 'Name',
                'required' => true,
            ],
            'vin' => [
                'type' => 'char',
                'label' => 'Identification Number (VIN)',
                'required' => true,
            ],
            'license_plate' => [
                'type' => 'char',
                'label' => 'License Plate',
                'required' => true,
            ],
            'make' => [
                'type' => 'char',
                'label' => 'Make',
                'required' => true,
            ],
            'model' => [
                'type' => 'char',
                'label' => 'Model',
                'required' => true,
            ],
            'year' => [
                'type' => 'char',
                'label' => 'Year',
            ],
        ];
    }

    /* ==========================
     | Relationships
     ========================== */

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function garageJobs()
    {
        return $this->hasMany(Order::class);
    }
}
