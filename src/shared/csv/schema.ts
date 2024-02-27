import { idValidateSchema } from 'src/libs/zod/schema';
import { ZodError, ZodIssue } from 'zod';

export interface RowData {
  row_number: number;
  id: string;
  name: string;
  image_path: string;
  price: number;
}

export class Row implements RowData {
  errors: any[];
  row_number: number;
  id: string;
  name: string;
  image_path: string;
  price: number;

  private constructor(data: Partial<RowData>) {
    Object.keys(data).forEach((key) => {
      switch (key) {
        case 'price':
          this.price = Number(data.price);
          break;

        default:
          this[key] = data[key];
          break;
      }
    });
  }

  get data() {
    return {
      row_number: this.row_number,
      id: this.id,
      name: this.name,
      image_path: this.image_path,
      price: this.price,
    };
  }

  static addData(payload: Partial<RowData>) {
    return new Row(payload);
  }

  async idValidate() {
    try {
      await idValidateSchema.parseAsync({ ...this.data });
    } catch (error) {
      if (error instanceof ZodError) {
        this.errors = error.issues.map((issue) => this.addIndexIssue(issue));
      }
    }
  }

  private addIndexIssue(issue: ZodIssue) {
    return {
      ...issue,
      path: Array.from(new Set([this.row_number, ...issue.path])),
    };
  }
}
