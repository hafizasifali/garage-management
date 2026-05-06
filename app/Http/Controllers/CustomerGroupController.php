<?php

namespace App\Http\Controllers;

use App\Models\CustomerGroup;
use Illuminate\Http\Request;

class CustomerGroupController extends Controller
{
    public function quickCreate(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255|unique:customer_groups,name',
        ]);

        $group = CustomerGroup::create($data);

        return response()->json([
            'id'    => $group->id,
            'name'  => $group->name,
            'label' => $group->name,
        ]);
    }
}
