<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class PurchaseOrder extends Model
{
    use HasFactory;

    protected $table = 'purchase_orders';

    protected $fillable = [
        'supplier_id',
        'supplier_name',
        'supplier_email',
        'supplier_phone',
        'supplier_address',
        'order_date',
        'state', // draft, confirmed, received, cancelled
        'total_tax',
        'total_discount',
        'total_amount',
    ];

    protected $casts = [
        'order_date' => 'date',
        'total_parts_cost' => 'decimal:2',
        'total_tax' => 'decimal:2',
        'total_discount' => 'decimal:2',
        'total_amount' => 'decimal:2',
    ];

    /* ==========================
     | Form Fields (Create)
     ========================== */
    public static function fields(): array
    {
        return [
            'supplier_id' => [
                'label' => 'Supplier',
                'type' => 'many2one',
                'relation' => 'suppliers',
                'quick_create' => true,
                'edit_route' => 'suppliers.edit',
            ],
            'order_date' => ['label' => 'Order Date', 'type' => 'date'],
            'state' => ['label' => 'Status', 'type' => 'many2one', 'relation' => 'states'],
        ];
    }

    /* ==========================
     | Form Fields (Edit)
     ========================== */
    public static function editFields(): array
    {
        return [
            'supplier_name' => ['label' => 'Supplier Name', 'type' => 'char'],
            'supplier_email' => ['label' => 'Supplier Email', 'type' => 'email'],
            'supplier_phone' => ['label' => 'Supplier Phone', 'type' => 'char'],
            'supplier_address' => ['label' => 'Supplier Address', 'type' => 'char'],
            'order_date' => ['label' => 'Order Date', 'type' => 'date'],
//            'state' => ['label' => 'Status', 'type' => 'many2one', 'relation' => 'states'],
        ];
    }

    /* ==========================
     | States (Odoo-style)
     ========================== */
    public static function states(): array
    {
        return [
            ['id' => 'draft', 'name' => 'Draft'],
            ['id' => 'confirmed', 'name' => 'Confirmed'],
            ['id' => 'received', 'name' => 'Received'],
            ['id' => 'cancelled', 'name' => 'Cancelled'],
        ];
    }

    /* ==========================
     | Relationships
     ========================== */
    public function supplier()
    {
        return $this->belongsTo(Supplier::class);
    }

    public function lines()
    {
        return $this->hasMany(PurchaseOrderLine::class);
    }

    /* ==========================
     | Helpers (Totals & States)
     ========================== */
    public function recalculateTotal(): void
    {
        $this->update([
            'total_amount' => $this->lines()->sum('subtotal'),
            'total_tax' => $this->lines()->sum('tax'),
            'total_discount' => $this->lines()->sum('discount'),
        ]);
    }

    public function isDraft(): bool
    {
        return $this->state === 'draft';
    }

    public function isConfirmed(): bool
    {
        return $this->state === 'confirmed';
    }

    public function isReceived(): bool
    {
        return $this->state === 'received';
    }
}
