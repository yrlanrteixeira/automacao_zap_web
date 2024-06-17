import ExcelJS from "exceljs";
import { Readable } from "stream";

export const parseExcel = async (file: Readable): Promise<any[]> => {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.read(file);
  const worksheet = workbook.getWorksheet(1);
  const data: any[] = [];

  worksheet?.eachRow((row) => {
    data.push(row.values);
  });

  return data;
};
