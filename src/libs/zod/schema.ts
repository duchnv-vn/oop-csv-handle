import { z } from 'zod';

const FAKE_VALID_IDS = ['1', '4', '5'];

const isRequired = {
  callback: (value: any) => !!value,
  message: 'This field is required.',
};

export const productSchema = z.object({
  row_number: z.number(),
  id: z
    .string({ required_error: isRequired.message })
    .refine(isRequired.callback),
  name: z.string().refine(isRequired.callback),
  price: z.number().refine(isRequired.callback),
  image_path: z.string().refine(isRequired.callback),
});

export const commonValidateSchema = z
  .array(productSchema.omit({ id: true }))
  .superRefine(async (products, ctx) => {
    console.log('------------------------');
    console.log('products 222', JSON.stringify(products, null, 2));
    console.log('------------------------');
  });

export const idValidateSchema = productSchema
  .pick({
    id: true,
    row_number: true,
  })
  .superRefine(async ({ id, row_number }, ctx) => {
    try {
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          FAKE_VALID_IDS.includes(id) ? resolve(true) : reject('NO_EXIST');
        }, 500);
      });
    } catch (error) {
      ctx.addIssue({
        code: 'custom',
        path: [row_number, 'id'],
        message: 'Invalid id',
      });
    }
  });
