// builders/SearchQueryBuilder.js
export class SearchQueryBuilder {
  constructor() {
    this.reset();
  }

  reset() {
    this.query = {
      textFilters: [],
      dateRanges: [],
      categories: [],
      priceRange: null,
      booleanOperator: 'AND',
      sorting: null,
      pagination: { page: 1, limit: 20 },
      includeFields: [],
      excludeFields: []
    };
    return this;
  }

  // Text search methods
  addTextFilter(field, value, operator = 'contains') {
    this.query.textFilters.push({ field, value, operator });
    return this;
  }

  // Date range methods
  addDateRange(field, startDate, endDate) {
    this.query.dateRanges.push({ field, startDate, endDate });
    return this;
  }

  // Category methods
  addCategory(category) {
    if (!this.query.categories.includes(category)) {
      this.query.categories.push(category);
    }
    return this;
  }

  removeCategory(category) {
    this.query.categories = this.query.categories.filter(c => c !== category);
    return this;
  }

  // Price range methods
  setPriceRange(min, max) {
    this.query.priceRange = { min, max };
    return this;
  }

  // Boolean operator
  setBooleanOperator(operator) {
    this.query.booleanOperator = operator; // 'AND' or 'OR'
    return this;
  }

  // Sorting methods
  setSorting(field, direction = 'asc') {
    this.query.sorting = { field, direction };
    return this;
  }

  // Pagination
  setPagination(page, limit) {
    this.query.pagination = { page, limit };
    return this;
  }

  // Field selection
  includeFields(fields) {
    this.query.includeFields = [...this.query.includeFields, ...fields];
    return this;
  }

  excludeFields(fields) {
    this.query.excludeFields = [...this.query.excludeFields, ...fields];
    return this;
  }

  // Build methods - different output formats
  buildForAPI() {
    const apiQuery = {
      filters: {},
      sort: this.query.sorting,
      page: this.query.pagination.page,
      limit: this.query.pagination.limit
    };

    // Text filters
    if (this.query.textFilters.length > 0) {
      apiQuery.filters.text = this.query.textFilters;
    }

    // Date ranges
    if (this.query.dateRanges.length > 0) {
      apiQuery.filters.dates = this.query.dateRanges;
    }

    // Categories
    if (this.query.categories.length > 0) {
      apiQuery.filters.categories = this.query.categories;
    }

    // Price range
    if (this.query.priceRange) {
      apiQuery.filters.priceRange = this.query.priceRange;
    }

    // Boolean operator
    apiQuery.filters.operator = this.query.booleanOperator;

    // Field selection
    if (this.query.includeFields.length > 0) {
      apiQuery.fields = this.query.includeFields;
    }

    return apiQuery;
  }

  buildForURL() {
    const params = new URLSearchParams();

    // Text filters
    this.query.textFilters.forEach((filter, index) => {
      params.append(`text_${index}`, `${filter.field}:${filter.operator}:${filter.value}`);
    });

    // Date ranges
    this.query.dateRanges.forEach((range, index) => {
      params.append(`date_${index}`, `${range.field}:${range.startDate}:${range.endDate}`);
    });

    // Categories
    if (this.query.categories.length > 0) {
      params.append('categories', this.query.categories.join(','));
    }

    // Price range
    if (this.query.priceRange) {
      params.append('price_min', this.query.priceRange.min.toString());
      params.append('price_max', this.query.priceRange.max.toString());
    }

    // Boolean operator
    params.append('operator', this.query.booleanOperator);

    // Sorting
    if (this.query.sorting) {
      params.append('sort', `${this.query.sorting.field}:${this.query.sorting.direction}`);
    }

    // Pagination
    params.append('page', this.query.pagination.page.toString());
    params.append('limit', this.query.pagination.limit.toString());

    return params.toString();
  }

  buildHumanReadable() {
    const parts = [];

    // Text filters
    if (this.query.textFilters.length > 0) {
      const textParts = this.query.textFilters.map(filter => 
        `${filter.field} ${filter.operator} "${filter.value}"`
      );
      parts.push(`Text: ${textParts.join(` ${this.query.booleanOperator} `)}`);
    }

    // Categories
    if (this.query.categories.length > 0) {
      parts.push(`Categories: ${this.query.categories.join(', ')}`);
    }

    // Price range
    if (this.query.priceRange) {
      parts.push(`Price: $${this.query.priceRange.min} - $${this.query.priceRange.max}`);
    }

    // Date ranges
    if (this.query.dateRanges.length > 0) {
      const dateParts = this.query.dateRanges.map(range => 
        `${range.field}: ${range.startDate} to ${range.endDate}`
      );
      parts.push(`Dates: ${dateParts.join(', ')}`);
    }

    // Sorting
    if (this.query.sorting) {
      parts.push(`Sorted by: ${this.query.sorting.field} (${this.query.sorting.direction})`);
    }

    return parts.length > 0 ? parts.join(' | ') : 'No filters applied';
  }

  buildForSave() {
    return {
      ...this.query,
      createdAt: new Date(),
      id: Date.now().toString()
    };
  }

  // Load saved query
  loadFromSaved(savedQuery) {
    this.query = { ...savedQuery };
    delete this.query.createdAt;
    delete this.query.id;
    return this;
  }

  // Get current state (for debugging)
  getCurrentState() {
    return { ...this.query };
  }
}
