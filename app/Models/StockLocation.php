<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class StockLocation extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'type',
        'parent_id',
        'active',
    ];

    /* ==========================
     | Relationships
     ========================== */

    public function parent()
    {
        return $this->belongsTo(StockLocation::class, 'parent_id');
    }

    public function children()
    {
        return $this->hasMany(StockLocation::class, 'parent_id');
    }

    public function sourceMoves()
    {
        return $this->hasMany(StockMove::class, 'source_location_id');
    }

    public function destinationMoves()
    {
        return $this->hasMany(StockMove::class, 'dest_location_id');
    }

    /* ==========================
     | Helpers (Odoo-style)
     ========================== */

    public static function internal()
    {
        return static::where('type', 'internal')->first();
    }

    public static function garage()
    {
        return static::where('type', 'garage')->first();
    }

    public static function scrap()
    {
        return static::where('type', 'scrap')->first();
    }
}
