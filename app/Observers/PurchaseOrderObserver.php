<?php

namespace App\Observers;

use App\Models\PurchaseOrder;
use Illuminate\Support\Facades\DB;

class PurchaseOrderObserver
{
    public function updating(PurchaseOrder $order)
    {
        if (!$order->isDirty('state')) return;

        $oldState = $order->getOriginal('state');
        $newState = $order->state;

        DB::transaction(function () use ($order, $oldState, $newState) {

            // When PO becomes received → add stock
            if ($oldState !== 'received' && $newState === 'received') {
                foreach ($order->lines as $line) {
                    $line->product?->increaseStock($line->quantity);
                }
            }

            // When reverting from received → rollback stock
            if ($oldState === 'received' && $newState !== 'received') {
                foreach ($order->lines as $line) {
                    $line->product?->decreaseStock($line->quantity);
                }
            }
        });
    }

    public function deleting(PurchaseOrder $order)
    {
        if ($order->state === 'received') {
            foreach ($order->lines as $line) {
                $line->product?->decreaseStock($line->quantity);
            }
        }
    }

    /**
     * Handle the PurchaseOrder "created" event.
     */
    public function created(PurchaseOrder $purchaseOrder): void
    {
        //
    }

    /**
     * Handle the PurchaseOrder "updated" event.
     */
    public function updated(PurchaseOrder $purchaseOrder): void
    {
        //
    }

    /**
     * Handle the PurchaseOrder "deleted" event.
     */
    public function deleted(PurchaseOrder $purchaseOrder): void
    {
        //
    }

    /**
     * Handle the PurchaseOrder "restored" event.
     */
    public function restored(PurchaseOrder $purchaseOrder): void
    {
        //
    }

    /**
     * Handle the PurchaseOrder "force deleted" event.
     */
    public function forceDeleted(PurchaseOrder $purchaseOrder): void
    {
        //
    }
}
