<?php

namespace App\Support;

use Illuminate\Database\Eloquent\Builder;

class QueryFilter
{
    public static function apply(Builder $query, array $rules): Builder
    {
        foreach ($rules as $rule) {
            $field = $rule['field'];
            $operator = $rule['operator'];
            $value = $rule['value'];

            match ($operator) {
                '=' => $query->where($field, $value),
                '!=' => $query->where($field, '!=', $value),
                'like' => $query->where($field, 'like', "%{$value}%"),
                'in' => $query->whereIn($field, (array) $value),
                '>=' => $query->where($field, '>=', $value),
                '<=' => $query->where($field, '<=', $value),
                'between' => $query->whereBetween($field, $value),
                default => null,
            };
        }

        return $query;
    }
}
