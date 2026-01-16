<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Customer extends Model
{
    use HasFactory;

    protected $table = 'customers';

    protected $fillable = [
        'name',
        'type',
        'email',
        'phone',
        'address',
        'type'
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
            'type' => [
                'type' => 'many2one',
                'label' => 'Type',
                'relation' => 'types'
            ],
        ];
    }


    // Accessor for is_customer
    public function getIsCustomerAttribute()
    {
        return $this->customer_rank > 0;
    }

    // Accessor for is_supplier
    public function getIsSupplierAttribute()
    {
        return $this->supplier_rank > 0;
    }

    // Relationship for contacts
    public function contacts()
    {
        return $this->hasMany(Customer::class, 'parent_id');
    }

    // Relationship to parent company
    public function company()
    {
        return $this->belongsTo(Customer::class, 'parent_id');
    }

    /* ==========================
     | Relationships
     ========================== */

    public function vehicles()
    {
        return $this->hasMany(Vehicle::class);
    }

    public function garageJobs()
    {
        return $this->hasMany(Order::class);
    }

    public function invoices()
    {
        return $this->hasMany(Invoice::class);
    }
}
