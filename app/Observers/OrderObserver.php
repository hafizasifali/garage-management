<?php

namespace App\Observers;

use App\Models\Order;
use Illuminate\Support\Facades\DB;

class OrderObserver
{
    public function updating(Order $order)
    {
        // Only react when state changes
        if (!$order->isDirty('state')) return;

        $oldState = $order->getOriginal('state');
        $newState = $order->state;

        DB::transaction(function () use ($order, $oldState, $newState) {

            // When order becomes completed → consume stock
            if ($oldState !== 'completed' && $newState === 'completed') {
                foreach ($order->lines as $line) {
                    $line->product?->decreaseStock($line->quantity);
                }
            }

            // When reverting from completed → restore stock
            if ($oldState === 'completed' && $newState !== 'completed') {
                foreach ($order->lines as $line) {
                    $line->product?->increaseStock($line->quantity);
                }
            }
        });
    }

    public function deleting(Order $order)
    {
        // If deleting a completed order → restore stock
        if ($order->state === 'completed') {
            foreach ($order->lines as $line) {
                $line->product?->increaseStock($line->quantity);
            }
        }
    }
    /**
     * Handle the Order "created" event.
     */
    public function created(Order $order): void
    {
        //
    }

    /**
     * Handle the Order "updated" event.
     */
    public function updated(Order $order): void
    {
        //
    }

    /**
     * Handle the Order "deleted" event.
     */
    public function deleted(Order $order): void
    {
        //
    }

    /**
     * Handle the Order "restored" event.
     */
    public function restored(Order $order): void
    {
        //
    }

    /**
     * Handle the Order "force deleted" event.
     */
    public function forceDeleted(Order $order): void
    {
        //
    }
}
