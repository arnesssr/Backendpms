export class PMSValidationService {
  validateProduct(data: any) {
    const required = ['name', 'price', 'category'];
    const errors: string[] = [];

    required.forEach(field => {
      if (!data[field]) errors.push(`Missing required field: ${field}`);
    });

    if (data.price && typeof data.price !== 'number') {
      errors.push('Price must be a number');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}
