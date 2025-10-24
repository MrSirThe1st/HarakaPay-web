-- See academic_years table structure

[
  {
    "column_name": "id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": "gen_random_uuid()"
  },
  {
    "column_name": "school_id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "column_name": "name",
    "data_type": "character varying",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "column_name": "start_date",
    "data_type": "date",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "column_name": "end_date",
    "data_type": "date",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "column_name": "term_structure",
    "data_type": "character varying",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "column_name": "is_active",
    "data_type": "boolean",
    "is_nullable": "YES",
    "column_default": "false"
  },
  {
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": "now()"
  },
  {
    "column_name": "updated_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": "now()"
  },
  {
    "column_name": "created_by",
    "data_type": "uuid",
    "is_nullable": "YES",
    "column_default": null
  }
]

-- See fee_categories table structure
[
  {
    "column_name": "id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": "gen_random_uuid()"
  },
  {
    "column_name": "school_id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "column_name": "name",
    "data_type": "character varying",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "column_name": "description",
    "data_type": "text",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "column_name": "is_mandatory",
    "data_type": "boolean",
    "is_nullable": "YES",
    "column_default": "false"
  },
  {
    "column_name": "is_recurring",
    "data_type": "boolean",
    "is_nullable": "YES",
    "column_default": "false"
  },
  {
    "column_name": "category_type",
    "data_type": "character varying",
    "is_nullable": "YES",
    "column_default": "'custom'::character varying"
  },
  {
    "column_name": "is_active",
    "data_type": "boolean",
    "is_nullable": "YES",
    "column_default": "true"
  },
  {
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": "now()"
  },
  {
    "column_name": "updated_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": "now()"
  },
  {
    "column_name": "created_by",
    "data_type": "uuid",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "column_name": "supports_one_time",
    "data_type": "boolean",
    "is_nullable": "NO",
    "column_default": "true"
  }
]

-- See fee_structures table structure
[
  {
    "column_name": "id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": "gen_random_uuid()"
  },
  {
    "column_name": "school_id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "column_name": "academic_year_id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "column_name": "grade_level",
    "data_type": "character varying",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "column_name": "name",
    "data_type": "character varying",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "column_name": "applies_to",
    "data_type": "character varying",
    "is_nullable": "NO",
    "column_default": "'school'::character varying"
  },
  {
    "column_name": "total_amount",
    "data_type": "numeric",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "column_name": "is_active",
    "data_type": "boolean",
    "is_nullable": "YES",
    "column_default": "true"
  },
  {
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": "now()"
  },
  {
    "column_name": "updated_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": "now()"
  },
  {
    "column_name": "created_by",
    "data_type": "uuid",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "column_name": "is_published",
    "data_type": "boolean",
    "is_nullable": "YES",
    "column_default": "false"
  }
]

-- See fee_structure_items table structure

[
  {
    "column_name": "id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": "gen_random_uuid()"
  },
  {
    "column_name": "structure_id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "column_name": "category_id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "column_name": "amount",
    "data_type": "numeric",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "column_name": "is_mandatory",
    "data_type": "boolean",
    "is_nullable": "YES",
    "column_default": "false"
  },
  {
    "column_name": "is_recurring",
    "data_type": "boolean",
    "is_nullable": "YES",
    "column_default": "true"
  },
  {
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": "now()"
  },
  {
    "column_name": "payment_modes",
    "data_type": "jsonb",
    "is_nullable": "YES",
    "column_default": "'[]'::jsonb"
  }
]

-- See payment_plans table structure
[
  {
    "column_name": "id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": "gen_random_uuid()"
  },
  {
    "column_name": "structure_id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "column_name": "type",
    "data_type": "character varying",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "column_name": "discount_percentage",
    "data_type": "numeric",
    "is_nullable": "YES",
    "column_default": "0"
  },
  {
    "column_name": "installments",
    "data_type": "jsonb",
    "is_nullable": "NO",
    "column_default": "'[]'::jsonb"
  },
  {
    "column_name": "is_active",
    "data_type": "boolean",
    "is_nullable": "YES",
    "column_default": "true"
  },
  {
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": "now()"
  },
  {
    "column_name": "updated_at",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": "now()"
  },
  {
    "column_name": "created_by",
    "data_type": "uuid",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "column_name": "school_id",
    "data_type": "uuid",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "column_name": "currency",
    "data_type": "character varying",
    "is_nullable": "YES",
    "column_default": "'USD'::character varying"
  }
]