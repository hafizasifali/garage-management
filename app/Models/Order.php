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
        'vehicle_make',
        'vehicle_year',
        'vehicle_license_plate',
        'vehicle_vin',
        'vehicle_id',
        'note',
        'order_date',
        'state', // pending, in_progress, completed
        'parts_by',
        'total_parts_cost',
        'total_labor_cost',
        'tax_rate',
        'total_tax',
        'total_discount',
        'total_amount',
        'is_brake_fluid_order',
    ];

    protected $casts = [
        'order_date' => 'date',
        'total_parts_cost' => 'decimal:2',
        'total_labor_cost' => 'decimal:2',
        'total_tax' => 'decimal:2',
        'total_discount' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'is_brake_fluid_order' => 'boolean',
    ];

    public static function fields(): array
    {
        return [
            'customer_id' => ['label' => 'Customer', 'type' => 'many2one', 'relation' => 'customers', 'quick_create' => true, 'edit_route' => 'customers.edit', 'placeholder' => 'Select Customer e.g. John Doe'],
            'vehicle_id' => ['label' => 'Vehicle', 'type' => 'many2one', 'relation' => 'vehicles', 'quick_create' => true, 'edit_route' => 'vehicles.edit', 'placeholder' => 'Select Vehicle e.g. 2020 Toyota Camry'],
            'vehicle_year' => ['label' => 'Year', 'type' => 'number', 'length' => '4', 'placeholder' => 'Enter year e.g. 2025'],
            'vehicle_make' => ['label' => 'Make', 'type' => 'char', 'placeholder' => 'Enter vehicle make e.g. Toyota'],
            'vehicle_model' => ['label' => 'Model', 'type' => 'char', 'placeholder' => 'Enter vehicle model e.g. Camry'],
            'vehicle_license_plate' => ['label' => 'License Plate', 'type' => 'char', 'placeholder' => 'Enter vehicle license plate e.g. ABC 123'],
            'order_date' => ['label' => 'Order Date', 'type' => 'date', 'placeholder' => 'Select order date e.g. 2024-01-15'],
            // 'employee_ids' => ['label' => 'Mechanics', 'type' => 'many2many', 'relation' => 'employees'],
            //'state' => ['label' => 'Order State', 'type' => 'many2one', 'relation' => 'states'],
            'parts_by' => ['label' => 'Parts By', 'type' => 'many2one', 'relation' => 'parts_by', 'placeholder' => 'Select parts provider e.g. Customer'],
        'is_brake_fluid_order' => ['label' => 'Is Brake Fluid Order', 'type' => 'boolean'],
            ];
    }
        public static function editFields(): array
    {
        return [
            'customer_name' => ['label' => 'Customer Name', 'type' => 'char', 'placeholder' => 'Enter customer name e.g. John Doe'],
            'customer_email' => ['label' => 'Customer Email', 'type' => 'email', 'placeholder' => 'Enter email address e.g. john@example.com'],
            'customer_phone' => ['label' => 'Customer Phone', 'type' => 'char', 'placeholder' => 'Enter phone number e.g. (416) 123-4567'],
            'customer_address' => ['label' => 'Customer Address', 'type' => 'char', 'placeholder' => 'Enter customer address e.g. 123 Main St, Toronto, ON'],
            'vehicle_name' => ['label' => 'Vehicle Name', 'type' => 'char', 'placeholder' => 'Enter vehicle name e.g. 2020 Toyota Camry'],
            'vehicle_year' => ['label' => 'Year', 'type' => 'number', 'length' => '4', 'placeholder' => 'Enter year e.g. 2025'],
            'vehicle_make' => ['label' => 'Make', 'type' => 'char', 'placeholder' => 'Enter vehicle make e.g. Toyota'],
            'vehicle_model' => ['label' => 'Model', 'type' => 'char', 'placeholder' => 'Enter vehicle model e.g. Camry'],
            'vehicle_license_plate' => ['label' => 'License Plate', 'type' => 'char', 'placeholder' => 'Enter vehicle license plate e.g. ABC 123'],
            'vehicle_vin' => ['label' => 'VIN', 'type' => 'char', 'placeholder' => 'Enter VIN e.g. 1HGCM82633A123456'],
            'order_date' => ['label' => 'Order Date', 'type' => 'date', 'placeholder' => 'Select order date e.g. 2024-01-15'],
            'parts_by' => ['label' => 'Parts By', 'type' => 'many2one', 'relation' => 'parts_by', 'placeholder' => 'Select parts provider e.g. Customer'],
//            'state' => ['label' => 'Order State', 'type' => 'many2one', 'relation' => 'states'],
            'note' => ['label' => 'Note', 'type' => 'char', 'placeholder' => 'Enter note e.g. Oil change required'],
            'is_brake_fluid_order' => ['label' => 'Is Brake Fluid Order', 'type' => 'boolean'],
        ];
    }

    public static function states(): array
    {
        return [
//            ['id' => 'pending', 'name' => 'Pending'],
            ['id' => 'in_progress', 'name' => 'In Progress'],
            ['id' => 'completed', 'name' => 'Completed'],
            ['id' => 'invoiced', 'name' => 'Invoiced'],
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
