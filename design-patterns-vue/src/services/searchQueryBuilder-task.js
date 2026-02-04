// services/searchQueryBuilder-task.js
// TODO: Implement the Builder pattern for search queries

export class SearchQueryBuilder {
  constructor() {
    this.reset();
  }

  reset() {
    // TODO: Initialize the query object with default values
    // Hint: textFilters, dateRanges, categories, priceRange, 
    //       booleanOperator, sorting, pagination, includeFields, excludeFields
    this.query = {};
    return this;
  }

  // TODO: Implement chainable methods that return 'this'

  addTextFilter(field, value, operator = 'contains') {
    // TODO: Add a text filter to the query
    // Return 'this' for method chaining
  }

  addCategory(category) {
    // TODO: Add a category (avoid duplicates)
    // Return 'this' for method chaining
  }

  removeCategory(category) {
    // TODO: Remove a category from the list
    // Return 'this' for method chaining
  }

  setPriceRange(min, max) {
    // TODO: Set price range filter
    // Return 'this' for method chaining
  }

  setSorting(field, direction = 'asc') {
    // TODO: Set sorting options
    // Return 'this' for method chaining
  }

  setPagination(page, limit) {
    // TODO: Set pagination options
    // Return 'this' for method chaining
  }

  // Build methods - different output formats

  buildForAPI() {
    // TODO: Build query object suitable for API calls
    // Return object with: filters, sort, page, limit
  }

  buildForURL() {
    // TODO: Build URL query string
    // Use URLSearchParams to create query string
  }

  buildHumanReadable() {
    // TODO: Build human-readable description of the query
    // Example: "Text: title contains 'phone' | Categories: Electronics | Price: $100 - $500"
  }

  getCurrentState() {
    // TODO: Return current query state (for debugging)
    return { ...this.query };
  }
}
