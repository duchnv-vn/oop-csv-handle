import { Controller, Get } from '@nestjs/common';

import * as csv from 'csvtojson';
import { Row } from './shared/csv/schema';
import { omitBy } from 'lodash';
import { commonValidateSchema } from './libs/zod/schema';
import { ZodError } from 'zod';

const addForFirstDataRow = 2;

@Controller()
export class AppController {
  @Get()
  async getHello(): Promise<any> {
    const filePath = './file.csv';

    const rawData = await csv({ flatKeys: true }).fromFile(filePath);
    const products = rawData.map((data, index) =>
      Row.addData({
        ...omitBy(data, (value) => !value),
        row_number: index + addForFirstDataRow,
      }),
    );

    await Promise.all(products.map((product) => product.idValidate()));

    try {
      await commonValidateSchema.parseAsync(products);
    } catch (error) {
      if (error instanceof ZodError) {
        const issues = error.issues.map((issue) => ({
          ...issue,
          path: [
            Number(issue.path[0]) + addForFirstDataRow,
            ...issue.path.slice(1),
          ],
        }));
      }
    }

    return 'hello world';
  }
}
