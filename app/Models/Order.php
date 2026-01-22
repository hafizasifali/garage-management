<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Order extends Model
{
    use HasFactory;

    protected $table = 'orders';

    protected $fillable = [
        'customer_id',
        'customer_name',
        'customer_email',
        'customer_phone',
        'customer_address',
        'vehicle_name',
        'vehicle_model',
        'vehicle_license_plate',
        'vehicle_vin',
        'vehicle_id',
        'order_date',
        'state', // pending, in_progress, completed
        'parts_by',
        'total_parts_cost',
        'total_labor_cost',
        'tax_rate',
        'total_tax',
        'total_discount',
        'total_amount',
    ];

    protected $casts = [
        'order_date' => 'date',
        'total_parts_cost' => 'decimal:2',
        'total_labor_cost' => 'decimal:2',
        'total_tax' => 'decimal:2',
        'total_discount' => 'decimal:2',
        'total_amount' => 'decimal:2',
    ];

    public static function fields(): array
    {
        return [
            'customer_id' => ['label' => 'Customer', 'type' => 'many2one', 'relation' => 'customers', 'quick_create' => true, 'edit_route' => 'customers.edit',],
            'vehicle_id' => ['label' => 'Vehicle', 'type' => 'many2one', 'relation' => 'vehicles', 'quick_create' => true, 'edit_route' => 'vehicles.edit'],
            'order_date' => ['label' => 'Order Date', 'type' => 'date'],
            // 'employee_ids' => ['label' => 'Mechanics', 'type' => 'many2many', 'relation' => 'employees'],
            //'state' => ['label' => 'Order State', 'type' => 'many2one', 'relation' => 'states'],
            'parts_by' => ['label' => 'Parts By', 'type' => 'many2one', 'relation' => 'parts_by'],
        ];
    }
        public static function editFields(): array
    {
        return [
            'customer_name' => ['label' => 'Customer Name', 'type' => 'char'],
            'customer_email' => ['label' => 'Customer Email', 'type' => 'email'],
            'customer_phone' => ['label' => 'Customer Phone', 'type' => 'char'],
            'customer_address' => ['label' => 'Customer Address', 'type' => 'char'],
            'vehicle_name' => ['label' => 'Vehicle Name', 'type' => 'char'],
            'vehicle_model' => ['label' => 'Vehicle Model', 'type' => 'char'],
            'vehicle_license_plate' => ['label' => 'Vehicle License', 'type' => 'char'],
            'vehicle_vin' => ['label' => 'VIN', 'type' => 'char'],
            'order_date' => ['label' => 'Order Date', 'type' => 'date'],
            'parts_by' => ['label' => 'Parts By', 'type' => 'many2one', 'relation' => 'parts_by'],
//            'state' => ['label' => 'Order State', 'type' => 'many2one', 'relation' => 'states'],
        ];
    }

    public static function states(): array
    {
        return [
            ['id' => 'pending', 'name' => 'Pending'],
            ['id' => 'in_progress', 'name' => 'In Progress'],
            ['id' => 'completed', 'name' => 'Completed'],
            ['id' => 'paid', 'name' => 'Paid'],
        ];
    }
    public static function partsBy(): array
    {
        return [
            ['id' => 'customer', 'name' => 'By Customer'],
            ['id' => 'us', 'name' => 'By Us'],
        ];
    }
    /* ==========================
     | Relationships
     ========================== */

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class);
    }

    public function lines()
    {
        return $this->hasMany(OrderLine::class);
    }

}
