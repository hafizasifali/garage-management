export const orderFilters = [
  {
    label: 'Customer',
    field: 'customer_id',
    operator: '=',
    type: 'select',
  },
  {
    label: 'Vehicle',
    field: 'vehicle_id',
    operator: '=',
    type: 'select',
  },
  {
    label: 'Status',
    field: 'status',
    operator: '=',
    type: 'select',
  },
  {
    label: 'Created Date',
    field: 'created_at',
    operator: 'between',
    type: 'date-range',
  },
];
