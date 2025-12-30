<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class PurchaseOrder extends Model
{
    use HasFactory;

    protected $fillable = [
        'partner_id',
        'order_date',
        'state',
        'total_amount',
    ];

    /* ==========================
     | Relationships
     ========================== */

    public function supplier()
    {
        return $this->belongsTo(Partner::class, 'partner_id');
    }

    public function lines()
    {
        return $this->hasMany(PurchaseOrderLine::class);
    }

    /* ==========================
     | Helpers (Odoo-style)
     ========================== */

    public function recalculateTotal(): void
    {
        $this->update([
            'total_amount' => $this->lines()->sum('subtotal'),
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
