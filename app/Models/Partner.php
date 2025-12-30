<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Partner extends Model
{
    use HasFactory;

    protected $table = 'partners';

    protected $fillable = [
        'name',
        'type',
        'email',
        'phone',
        'address',
        'is_company', 'parent_id', 'customer_rank', 'supplier_rank',
        'active',
    ];

       public static function customerFields(): array
    {
        return [
            'name' => [
                'type' => 'char',
                'label' => 'Customer Name',
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
            'is_company' => [
                'type' => 'boolean',
                'label' => 'Is a Company',
            ],
            'active' => [
                'type' => 'boolean',
                'label' => 'Active',
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
        return $this->hasMany(Partner::class, 'parent_id');
    }

    // Relationship to parent company
    public function company()
    {
        return $this->belongsTo(Partner::class, 'parent_id');
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
        return $this->hasMany(GarageJob::class);
    }

    public function invoices()
    {
        return $this->hasMany(Invoice::class);
    }
}
