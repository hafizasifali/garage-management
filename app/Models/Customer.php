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
        'shop_no',
        'customer_group_id',
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
            'shop_no' => [
                'type' => 'char',
                'label' => 'Shop No',
                'placeholder' => 'Enter shop number (optional, for business only)',
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
            'customer_group_id' => [
                'type' => 'many2one',
                'label' => 'Customer Group',
                'relation' => 'customer_groups',
                'depends_on' => 'type',
                'depends_value' => 'company',
            ],
        ];
    }

    protected static function sanitizeArray(array $attributes): array
    {
        return array_map(function ($value) {
            if (is_string($value)) {
                return mb_check_encoding($value, 'UTF-8') ? $value : utf8_encode($value);
            }

            if (is_array($value)) {
                return self::sanitizeArray($value);
            }

            return $value;
        }, $attributes);
    }

    public function toArray(): array
    {
        return self::sanitizeArray(parent::toArray());
    }

    // The group this store/customer belongs to (e.g. "Mr. Lube")
    public function group(): BelongsTo
    {
        return $this->belongsTo(CustomerGroup::class, 'customer_group_id');
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

    public function prices()
    {
        return $this->hasMany(CustomerPrice::class);
    }
}
